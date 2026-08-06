const { jsPDF } = window.jspdf;

const fileInput = document.getElementById('fileInput');
const dropzone = document.getElementById('dropzone');
const imageGrid = document.getElementById('imageGrid');
const previewContainer = document.getElementById('previewContainer');
const emptyState = document.getElementById('emptyState');
const controls = document.getElementById('controls');
const imageCountLabel = document.getElementById('imageCount');
const clearAllBtn = document.getElementById('clearAll');
const generateBtn = document.getElementById('generateBtn');

let imageList = [];

// Handle Click & Drag Events
dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('border-indigo-500', 'bg-slate-800/60');
});
dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('border-indigo-500', 'bg-slate-800/60');
});
dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-indigo-500', 'bg-slate-800/60');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const id = Date.now() + Math.random();
                imageList.push({
                    id,
                    src: e.target.result,
                    name: file.name,
                    type: file.type
                });
                renderPreviews();
            };
            reader.readAsDataURL(file);
        }
    });
}

function renderPreviews() {
    imageGrid.innerHTML = '';
    
    if (imageList.length === 0) {
        previewContainer.classList.add('hidden');
        controls.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    previewContainer.classList.remove('hidden');
    controls.classList.remove('hidden');
    emptyState.classList.add('hidden');
    imageCountLabel.textContent = imageList.length;

    imageList.forEach((img, index) => {
        const card = document.createElement('div');
        card.className = 'img-card relative group bg-slate-800 p-2 rounded-lg border border-slate-700';
        card.innerHTML = `
            <img src="${img.src}" class="w-full h-32 object-cover rounded-md">
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                 <button onclick="removeImage(${img.id})" class="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90">
                    <i class="fa-solid fa-times"></i>
                 </button>
            </div>
            <p class="text-[10px] text-slate-500 mt-2 truncate">${img.name}</p>
        `;
        imageGrid.appendChild(card);
    });
}

window.removeImage = (id) => {
    imageList = imageList.filter(img => img.id !== id);
    renderPreviews();
};

clearAllBtn.addEventListener('click', () => {
    imageList = [];
    renderPreviews();
});

generateBtn.addEventListener('click', async () => {
    if (imageList.length === 0) return;

    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Generating PDF...';

    try {
        const pageSize = document.getElementById('pageSize').value;
        const orientation = document.getElementById('orientation').value;
        
        const doc = new jsPDF({
            orientation: orientation,
            unit: 'px',
            format: pageSize === 'fit' ? undefined : pageSize
        });

        for (let i = 0; i < imageList.length; i++) {
            const imgData = imageList[i].src;
            const img = await loadImage(imgData);
            
            const imgWidth = img.width;
            const imgHeight = img.height;

            let finalWidth, finalHeight;

            if (pageSize === 'fit') {
                // Create page matching image size
                if (i > 0) doc.addPage([imgWidth, imgHeight], orientation);
                else doc.deletePage(1), doc.addPage([imgWidth, imgHeight], orientation);
                finalWidth = imgWidth;
                finalHeight = imgHeight;
            } else {
                // A4/Letter sizing with containment
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = doc.internal.pageSize.getHeight();
                const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                finalWidth = imgWidth * ratio;
                finalHeight = imgHeight * ratio;
                if (i > 0) doc.addPage();
            }

            const xOffset = (doc.internal.pageSize.getWidth() - finalWidth) / 2;
            const yOffset = (doc.internal.pageSize.getHeight() - finalHeight) / 2;

            doc.addImage(imgData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight);
        }

        doc.save(`images-${Date.now()}.pdf`);
    } catch (error) {
        console.error(error);
        alert('Failed to generate PDF. Please try again.');
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Generate & Download PDF';
    }
});

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}