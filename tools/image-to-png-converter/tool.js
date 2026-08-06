document.addEventListener('DOMContentLoaded', () => {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const previewContainer = document.getElementById('previewContainer');
  const previewImg = document.getElementById('previewImg');
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');
  const origFormat = document.getElementById('origFormat');
  const dimensions = document.getElementById('dimensions');
  const canvas = document.getElementById('converterCanvas');
  const ctx = canvas.getContext('2d');

  let originalFileName = 'image';

  // Click to upload
  dropzone.addEventListener('click', () => fileInput.click());

  // Handle drag and drop
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('border-blue-500', 'bg-slate-800/80');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('border-blue-500', 'bg-slate-800/80');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-blue-500', 'bg-slate-800/80');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  });

  function processFile(file) {
    const reader = new FileReader();
    originalFileName = file.name.split('.').slice(0, -1).join('.') || 'converted';
    origFormat.textContent = file.type.split('/')[1].toUpperCase();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Update UI
        dimensions.textContent = `${img.width} × ${img.height}`;
        previewImg.src = img.src;
        
        // Prepare Canvas
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // Switch sections
        dropzone.classList.add('hidden');
        previewContainer.classList.remove('hidden');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  downloadBtn.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${originalFileName}.png`;
    link.href = dataURL;
    link.click();
  });

  resetBtn.addEventListener('click', () => {
    fileInput.value = '';
    dropzone.classList.remove('hidden');
    previewContainer.classList.add('hidden');
    previewImg.src = '';
  });
});