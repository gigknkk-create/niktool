document.addEventListener('DOMContentLoaded', () => {
    const { jsPDF } = window.jspdf;
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const imageGrid = document.getElementById('imageGrid');
    const previewContainer = document.getElementById('previewContainer');
    const optionsPanel = document.getElementById('optionsPanel');
    const generateBtn = document.getElementById('generateBtn');
    const clearAll = document.getElementById('clearAll');
    const imageCountText = document.getElementById('imageCount');

    let imageFiles = [];

    // Handle click on drop zone
    dropZone.addEventListener('click', () => fileInput.click());

    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    dropZone.addEventListener('dragenter', () => dropZone.classList.add('dragover'));
    dropZone.addEventListener('dragover', () => dropZone.classList.add('dragover'));
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        const validImages = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        validImages.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const id = Date.now() + Math.random();
                imageFiles.push({ id, file, src: e.target.result });
                renderPreview();
            };
            reader.readAsDataURL(file);
        });
    }

    function renderPreview() {
        if (imageFiles.length > 0) {
            previewContainer.classList.remove('hidden');
            optionsPanel.classList.remove('hidden');
        } else {
            previewContainer.classList.add('hidden');
            optionsPanel.classList.add('hidden');
        }

        imageCountText.textContent = imageFiles.length;
        imageGrid.innerHTML = '';

        imageFiles.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-800';
            div.innerHTML = `
                <img src="${item.src}" class="w-full h-32 object-cover">
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onclick="removeImage(${item.id})" class="bg-red-600 p-2 rounded-full hover:bg-red-500">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] p-1 text-center truncate">
                    ${item.file.name}
                </div>
            `;
            imageGrid.appendChild(div);
        });
    }

    window.removeImage = (id) => {
        imageFiles = imageFiles.filter(item => item.id !== id);
        renderPreview();
    };

    clearAll.addEventListener('click', () => {
        imageFiles = [];
        renderPreview();
    });

    generateBtn.addEventListener('click', async () => {
        if (imageFiles.length === 0) return;
        
        const orientation = document.getElementById('orientation').value;
        const format = document.getElementById('format').value;
        
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';

        try {
            const doc = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: format
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            for (let i = 0; i < imageFiles.length; i++) {
                if (i > 0) doc.addPage(format, orientation);
                
                const imgData = imageFiles[i].src;
                
                // Calculate proportions to fit page
                const imgProps = doc.getImageProperties(imgData);
                const ratio = imgProps.width / imgProps.height;
                
                let drawWidth = pageWidth;
                let drawHeight = pageWidth / ratio;

                if (drawHeight > pageHeight) {
                    drawHeight = pageHeight;
                    drawWidth = pageHeight * ratio;
                }

                // Center image
                const x = (pageWidth - drawWidth) / 2;
                const y = (pageHeight - drawHeight) / 2;

                doc.addImage(imgData, 'JPEG', x, y, drawWidth, drawHeight);
            }

            doc.save('converted-images.pdf');
        } catch (err) {
            alert('Error generating PDF: ' + err.message);
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-magic mr-2"></i> Generate PDF';
        }
    });
});