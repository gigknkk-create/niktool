document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const sortableList = document.getElementById('sortable-list');
    const previewContainer = document.getElementById('preview-container');
    const clearBtn = document.getElementById('clear-btn');
    const generateBtn = document.getElementById('generate-btn');
    const imageCountText = document.getElementById('image-count');

    let imageFiles = [];

    // Initialize SortableJS
    new Sortable(sortableList, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: () => {
            reorderImageFiles();
        }
    });

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-blue-500', 'bg-slate-800/50');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-blue-500', 'bg-slate-800/50');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-blue-500', 'bg-slate-800/50');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (validFiles.length === 0) return;

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileId = Math.random().toString(36).substr(2, 9);
                const imageData = {
                    id: fileId,
                    src: e.target.result,
                    name: file.name
                };
                imageFiles.push(imageData);
                renderPreview(imageData);
                updateUI();
            };
            reader.readAsDataURL(file);
        });
    }

    function renderPreview(imageData) {
        const div = document.createElement('div');
        div.className = 'relative group aspect-square rounded-xl overflow-hidden bg-slate-800 border border-slate-700 cursor-move';
        div.dataset.id = imageData.id;
        div.innerHTML = `
            <img src="${imageData.src}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button class="delete-btn bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors" data-id="${imageData.id}">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
            <div class="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] p-1 truncate">
                ${imageData.name}
            </div>
        `;

        div.querySelector('.delete-btn').onclick = (e) => {
            e.stopPropagation();
            removeImage(imageData.id);
        };

        sortableList.appendChild(div);
    }

    function removeImage(id) {
        imageFiles = imageFiles.filter(img => img.id !== id);
        const el = sortableList.querySelector(`[data-id="${id}"]`);
        if (el) el.remove();
        updateUI();
    }

    function reorderImageFiles() {
        const newOrderIds = Array.from(sortableList.querySelectorAll('[data-id]')).map(el => el.dataset.id);
        imageFiles.sort((a, b) => newOrderIds.indexOf(a.id) - newOrderIds.indexOf(b.id));
    }

    function updateUI() {
        const count = imageFiles.length;
        imageCountText.textContent = count;
        if (count > 0) {
            previewContainer.classList.remove('hidden');
        } else {
            previewContainer.classList.add('hidden');
        }
    }

    clearBtn.onclick = () => {
        imageFiles = [];
        sortableList.innerHTML = '';
        updateUI();
    };

    generateBtn.onclick = async () => {
        if (imageFiles.length === 0) return;
        
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Generating...';

        try {
            const { jsPDF } = window.jspdf;
            const format = document.getElementById('page-size').value;
            const orientation = document.getElementById('orientation').value;
            const margin = parseInt(document.getElementById('margin').value) || 0;

            let doc;
            if (format === 'fit') {
                // Placeholder, will define per page
                doc = new jsPDF(orientation, 'mm');
            } else {
                doc = new jsPDF(orientation, 'mm', format);
            }

            for (let i = 0; i < imageFiles.length; i++) {
                const imgData = imageFiles[i].src;
                
                // Create a temporary image to get dimensions
                const img = new Image();
                img.src = imgData;
                await new Promise(resolve => img.onload = resolve);

                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                
                if (format === 'fit') {
                    // If fit mode, set page size to image size (approximate conversion px to mm)
                    const mmWidth = img.width * 0.264583;
                    const mmHeight = img.height * 0.264583;
                    if (i > 0) doc.addPage([mmWidth, mmHeight], mmWidth > mmHeight ? 'l' : 'p');
                    else doc = new jsPDF(mmWidth > mmHeight ? 'l' : 'p', 'mm', [mmWidth, mmHeight]);
                    doc.addImage(imgData, 'JPEG', 0, 0, mmWidth, mmHeight);
                } else {
                    if (i > 0) doc.addPage(format, orientation);
                    
                    const availableWidth = pageWidth - (margin * 2);
                    const availableHeight = pageHeight - (margin * 2);
                    
                    let width = availableWidth;
                    let height = (img.height * width) / img.width;

                    if (height > availableHeight) {
                        height = availableHeight;
                        width = (img.width * height) / img.height;
                    }

                    const x = margin + (availableWidth - width) / 2;
                    const y = margin + (availableHeight - height) / 2;

                    doc.addImage(imgData, 'JPEG', x, y, width, height);
                }
            }

            doc.save(`images-to-pdf-${new Date().getTime()}.pdf`);
        } catch (error) {
            console.error(error);
            alert('Failed to generate PDF. Please try smaller or fewer images.');
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fa-solid fa-file-export"></i> Generate & Download PDF';
        }
    };
});