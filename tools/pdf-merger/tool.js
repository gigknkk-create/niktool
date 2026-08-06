const { PDFDocument } = PDFLib;

const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const fileListContainer = document.getElementById('fileListContainer');
const fileList = document.getElementById('fileList');
const fileCountLabel = document.getElementById('fileCount');
const mergeBtn = document.getElementById('mergeBtn');
const clearBtn = document.getElementById('clearBtn');
const loader = document.getElementById('loader');

let uploadedFiles = [];

// Event Listeners
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-red-500/50', 'bg-slate-800/50');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-red-500/50', 'bg-slate-800/50');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-red-500/50', 'bg-slate-800/50');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

clearBtn.addEventListener('click', () => {
    uploadedFiles = [];
    renderFileList();
});

mergeBtn.addEventListener('click', mergePdfs);

function handleFiles(files) {
    const newFiles = Array.from(files).filter(f => f.type === 'application/pdf');
    if (newFiles.length === 0 && files.length > 0) {
        alert('Please select valid PDF files.');
        return;
    }
    uploadedFiles = [...uploadedFiles, ...newFiles];
    renderFileList();
}

function renderFileList() {
    if (uploadedFiles.length === 0) {
        fileListContainer.classList.add('hidden');
        return;
    }

    fileListContainer.classList.remove('hidden');
    fileCountLabel.textContent = `${uploadedFiles.length} file${uploadedFiles.length === 1 ? '' : 's'}`;
    
    fileList.innerHTML = '';
    uploadedFiles.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'file-item flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700 transition-all hover:bg-slate-800';
        div.innerHTML = `
            <div class="text-slate-500 text-sm font-mono">${index + 1}</div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-200 truncate">${file.name}</p>
                <p class="text-xs text-slate-500">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <div class="flex gap-2">
                <button onclick="moveItem(${index}, -1)" class="p-2 hover:bg-slate-700 rounded-lg text-slate-400" title="Move Up" ${index === 0 ? 'disabled' : ''}>
                    <i class="fa-solid fa-chevron-up"></i>
                </button>
                <button onclick="moveItem(${index}, 1)" class="p-2 hover:bg-slate-700 rounded-lg text-slate-400" title="Move Down" ${index === uploadedFiles.length - 1 ? 'disabled' : ''}>
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
                <button onclick="removeItem(${index})" class="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-400" title="Remove">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        fileList.appendChild(div);
    });

    mergeBtn.disabled = uploadedFiles.length < 2;
}

window.removeItem = (index) => {
    uploadedFiles.splice(index, 1);
    renderFileList();
};

window.moveItem = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < uploadedFiles.length) {
        const temp = uploadedFiles[index];
        uploadedFiles[index] = uploadedFiles[newIndex];
        uploadedFiles[newIndex] = temp;
        renderFileList();
    }
};

async function mergePdfs() {
    try {
        loader.classList.remove('hidden');
        mergeBtn.disabled = true;
        
        const mergedPdf = await PDFDocument.create();

        for (const file of uploadedFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const pdfBytes = await mergedPdf.save();
        
        // Download implementation
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `merged_${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error merging PDFs:', error);
        alert('An error occurred while merging PDFs. Please ensure all files are valid PDF documents.');
    } finally {
        loader.classList.add('hidden');
        mergeBtn.disabled = false;
    }
}