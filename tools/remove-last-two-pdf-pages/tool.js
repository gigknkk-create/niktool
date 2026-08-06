(() => {
  'use strict';

  const fileInput = document.querySelector('#pdf-file-input');
  const primaryButton = document.querySelector('#primary-action');
  const clearButton = document.querySelector('#clear-action');
  const downloadButton = document.querySelector('#download-action');
  const message = document.querySelector('#tool-message');

  if (!fileInput || !primaryButton || !clearButton || !downloadButton || !message) {
    console.error('Tool initialization failed: required DOM elements missing.');
    return;
  }

  let processing = false;
  let objectUrl = null;

  function setMessage(text, type = '') {
    message.textContent = text;
    message.className = `message${type ? ` ${type}` : ''}`;
  }

  function cleanupUrl() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
  }

  function updateControls() {
    const hasFile = Boolean(fileInput.files && fileInput.files.length > 0);
    primaryButton.disabled = processing || !hasFile;
    clearButton.disabled = processing || !hasFile;
  }

  fileInput.addEventListener('change', () => {
    cleanupUrl();
    downloadButton.style.display = 'none';
    
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      setMessage(`Selected file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB). Ready to process.`);
    } else {
      setMessage('Select a PDF file with at least 3 pages to begin.');
    }
    updateControls();
  });

  clearButton.addEventListener('click', () => {
    fileInput.value = '';
    cleanupUrl();
    downloadButton.style.display = 'none';
    setMessage('Select a PDF file with at least 3 pages to begin.');
    updateControls();
    fileInput.focus();
  });

  primaryButton.addEventListener('click', async () => {
    if (processing || !fileInput.files || !fileInput.files[0]) return;

    const file = fileInput.files[0];

    if (file.size === 0) {
      setMessage('The selected file is empty. Please choose a valid PDF file.', 'error');
      return;
    }

    if (typeof window.PDFLib === 'undefined') {
      setMessage('PDF processing library failed to load. Please refresh and try again.', 'error');
      return;
    }

    processing = true;
    updateControls();
    setMessage('Processing PDF locally in your browser...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      if (totalPages < 3) {
        setMessage(`This PDF has ${totalPages} page(s). You need a document with at least 3 pages to remove the last two.`, 'error');
        return;
      }

      // Remove last two pages (index totalPages - 1, then totalPages - 2)
      pdfDoc.removePage(totalPages - 1);
      pdfDoc.removePage(totalPages - 2);

      const modifiedBytes = await pdfDoc.save();
      const blob = new Blob([modifiedBytes], { type: 'application/pdf' });

      cleanupUrl();
      objectUrl = URL.createObjectURL(blob);

      const outputFilename = file.name.replace(/\.pdf$/i, '') + '-trimmed.pdf';
      downloadButton.href = objectUrl;
      downloadButton.download = outputFilename;
      downloadButton.style.display = 'inline-block';

      setMessage(`Success! Removed 2 pages. New page count: ${totalPages - 2}. Click Download below.`, 'success');
    } catch (err) {
      console.error('PDF processing error:', err);
      if (err.message && err.message.toLowerCase().includes('encrypted')) {
        setMessage('The selected PDF is password-protected. Please unlock it first.', 'error');
      } else {
        setMessage('Unable to process this PDF file. It may be corrupted or unsupported.', 'error');
      }
    } finally {
      processing = false;
      updateControls();
    }
  });

  updateControls();
})();
