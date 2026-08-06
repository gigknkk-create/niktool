const fileInput = document.getElementById('fileInput');
const dropzone = document.getElementById('dropzone');
const fileList = document.getElementById('fileList');
const fileListContainer = document.getElementById('fileListContainer');
const mergeBtn = document.getElementById('mergeBtn');
const clearAll = document.getElementById('clearAll');
const loader = document.getElementById('loader');

let filesArray = [];

dropzone.addEventListener('click', () => fileInput.click());

dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('border-blue-500', 'bg-blue-500/5');
});

dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('border-blue-500', 'bg-blue-500/5');
});

dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-blue-500', 'bg-blue-500/5');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    const validFiles = Array.from(files).filter(f => f.type === 'application/pdf');
    filesArray = [...filesArray, ...validFiles];
    renderFileList();
}

function renderFileList() {
    if (filesArray.length > 0) {
        fileListContainer.classList.remove('hidden');
    } else {
        fileListContainer.classList.add('hidden');
    }

    fileList.innerHTML = '';
    filesArray.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'glass-panel p-4 rounded-xl flex items-center justify-between file-item group border border-slate-700/50';
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="text-slate-500 text-sm font-mono w-6">${index + 1}</span>
                <i class="fa-solid fa-file-pdf text-red-400"></i>
                <div class="overflow-hidden">
                    <p class="text-sm text-slate-200 truncate font-medium max-w-[200px] md:max-w-md">${file.name}</p>
                    <p class="text-xs text-slate-500">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="moveItem(${index}, -1)" class="p-2 text-slate-500 hover:text-white transition-colors">
                    <i class="fa-solid fa-chevron-up"></i>
                </button>
                <button onclick="moveItem(${index}, 1)" class="p-2 text-slate-500 hover:text-white transition-colors">
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
                <button onclick="removeFile(${index})" class="p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        fileList.appendChild(div);
    });
}

window.removeFile = (index) => {
    filesArray.splice(index, 1);
    renderFileList();
};

window.moveItem = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < filesArray.length) {
        const temp = filesArray[index];
        filesArray[index] = filesArray[newIndex];
        filesArray[newIndex] = temp;
        renderFileList();
    }
};

clearAll.addEventListener('click', () => {
    filesArray = [];
    renderFileList();
});

mergeBtn.addEventListener('click', async () => {
    if (filesArray.length < 2) {
        alert('Please select at least 2 PDF files to merge.');
        return;
    }

    loader.classList.remove('hidden');
    fileListContainer.classList.add('hidden');
    mergeBtn.disabled = true;

    try {
        const mergedPdf = await PDFLib.PDFDocument.create();
        
        for (const file of filesArray) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'merged_document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error(error);
        alert('An error occurred while merging PDFs. Ensure the files are not encrypted or corrupted.');
    } finally {
        loader.classList.add('hidden');
        fileListContainer.classList.remove('hidden');
        mergeBtn.disabled = false;
    }
});