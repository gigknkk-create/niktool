const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('pdf-upload');
const controls = document.getElementById('controls');
const processBtn = document.getElementById('process-btn');
const resetBtn = document.getElementById('reset-btn');
const statusContainer = document.getElementById('status-container');
const statusText = document.getElementById('status-text');
const previewSection = document.getElementById('preview-section');
const previewCanvas = document.getElementById('preview-canvas');
const thresholdInput = document.getElementById('threshold');
const outputType = document.getElementById('output-type');

let currentPdf = null;

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-blue-500');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-blue-500');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-blue-500');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFile(e.target.files[0]);
});

async function handleFile(file) {
    if (file.type !== 'application/pdf') {
        alert('Please upload a valid PDF file.');
        return;
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        currentPdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        controls.classList.remove('hidden');
        dropZone.classList.add('hidden');
    } catch (err) {
        alert('Error loading PDF: ' + err.message);
    }
}

processBtn.addEventListener('click', async () => {
    if (!currentPdf) return;

    statusContainer.classList.remove('hidden');
    previewSection.classList.add('hidden');
    processBtn.disabled = true;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const threshold = parseInt(thresholdInput.value);
    const mode = outputType.value;

    try {
        for (let i = 1; i <= currentPdf.numPages; i++) {
            statusText.innerText = `Processing page ${i} of ${currentPdf.numPages}...`;
            
            const page = await currentPdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: ctx, viewport: viewport }).promise;

            // Pixel Manipulation
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let j = 0; j < data.length; j += 4) {
                const r = data[j];
                const g = data[j + 1];
                const b = data[j + 2];
                
                // If pixel is lighter than threshold, make it transparent
                if (r > threshold && g > threshold && b > threshold) {
                    data[j + 3] = 0;
                }
            }
            
            ctx.putImageData(imageData, 0, 0);

            if (mode === 'pdf') {
                const imgData = canvas.toDataURL('image/png');
                if (i > 1) doc.addPage();
                
                const imgProps = doc.getImageProperties(imgData);
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                
                doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            } else {
                // Download as individual PNGs or batch them if desired
                // For this tool, we'll download the preview of the processed page
            }

            // Update Preview with last page
            if (i === currentPdf.numPages) {
                previewCanvas.width = canvas.width;
                previewCanvas.height = canvas.height;
                const pCtx = previewCanvas.getContext('2d');
                pCtx.putImageData(imageData, 0, 0);
                previewSection.classList.remove('hidden');
            }
        }

        if (mode === 'pdf') {
            doc.save('cleaned_document.pdf');
        } else {
            // In PNG mode, just showing preview for simplicity of UX in one file
            alert('Processing complete. You can right-click and save the preview image.');
        }

    } catch (err) {
        console.error(err);
        alert('Error during processing.');
    } finally {
        statusContainer.classList.add('hidden');
        processBtn.disabled = false;
    }
});

resetBtn.addEventListener('click', () => {
    currentPdf = null;
    controls.classList.add('hidden');
    dropZone.classList.remove('hidden');
    previewSection.classList.add('hidden');
    fileInput.value = '';
});