(() => {
  'use strict';

  const fileInput = document.querySelector('#pdf-file-input');
  const pagesInput = document.querySelector('#pages-input');
  const primaryButton = document.querySelector('#primary-action');
  const clearButton = document.querySelector('#clear-action');
  const downloadButton = document.querySelector('#download-action');
  const message = document.querySelector('#tool-message');

  if (!fileInput || !pagesInput || !primaryButton || !clearButton || !downloadButton || !message) {
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
    const hasPages = Boolean(pagesInput.value.trim());
    primaryButton.disabled = processing || !hasFile || !hasPages;
    clearButton.disabled = processing || (!hasFile && !hasPages);
  }

  function parsePagesToRemove(inputStr, totalPages) {
    const pagesToRemove = new Set();
    const parts = inputStr.split(',').map(p => p.trim().toLowerCase()).filter(Boolean);

    for (const part of parts) {
      const matchFirst = part.match(/^first\s+(\d+)$/);
      const matchLast = part.match(/^last\s+(\d+)$/);
      const matchRange = part.match(/^(\d+)\s*-\s*(\d+)$/);
      const matchSingle = part.match(/^(\d+)$/);

      if (matchFirst) {
        const count = parseInt(matchFirst[1], 10);
        for (let i = 1; i <= Math.min(count, totalPages); i++) {
          pagesToRemove.add(i);
        }
      } else if (matchLast) {
        const count = parseInt(matchLast[1], 10);
        for (let i = Math.max(1, totalPages - count + 1); i <= totalPages; i++) {
          pagesToRemove.add(i);
        }
      } else if (matchRange) {
        const start = parseInt(matchRange[1], 10);
        const end = parseInt(matchRange[2], 10);
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        for (let i = min; i <= max; i++) {
          if (i >= 1 && i <= totalPages) {
            pagesToRemove.add(i);
          }
        }
      } else if (matchSingle) {
        const pageNum = parseInt(matchSingle[1], 10);
        if (pageNum >= 1 && pageNum <= totalPages) {
          pagesToRemove.add(pageNum);
        }
      } else {
        throw new Error(`Unrecognized page format: "${part}". Use standard numbers (e.g. 2), ranges (e.g. 2-5), or "first N"/"last N".`);
      }
    }

    return pagesToRemove;
  }

  fileInput.addEventListener('change', () => {
    cleanupUrl();
    downloadButton.style.display = 'none';
    
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      setMessage(`Selected file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB). Enter page numbers to remove.`);
    } else {
      setMessage('Select a PDF file and specify the pages to remove.');
    }
    updateControls();
  });

  pagesInput.addEventListener('input', updateControls);

  clearButton.addEventListener('click', () => {
    fileInput.value = '';
    pagesInput.value = '';
    cleanupUrl();
    downloadButton.style.display = 'none';
    setMessage('Select a PDF file and specify the pages to remove.');
    updateControls();
    fileInput.focus();
  });

  primaryButton.addEventListener('click', async () => {
    if (processing || !fileInput.files || !fileInput.files[0] || !pagesInput.value.trim()) return;

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

      const pagesToRemoveSet = parsePagesToRemove(pagesInput.value, totalPages);

      if (pagesToRemoveSet.size === 0) {
        setMessage(`No valid pages matching your input were found in this ${totalPages}-page document.`, 'error');
        return;
      }

      if (pagesToRemoveSet.size >= totalPages) {
        setMessage(`Cannot delete all ${totalPages} pages. A PDF must retain at least 1 page.`, 'error');
        return;
      }

      const indicesToRemove = Array.from(pagesToRemoveSet)
        .map(p => p - 1)
        .sort((a, b) => b - a);

      indicesToRemove.forEach(index => {
        pdfDoc.removePage(index);
      });

      const modifiedBytes = await pdfDoc.save();
      const blob = new Blob([modifiedBytes], { type: 'application/pdf' });

      cleanupUrl();
      objectUrl = URL.createObjectURL(blob);

      const outputFilename = file.name.replace(/\.pdf$/i, '') + '-custom-trimmed.pdf';
      downloadButton.href = objectUrl;
      downloadButton.download = outputFilename;
      downloadButton.style.display = 'inline-block';

      const remainingPages = totalPages - indicesToRemove.length;
      setMessage(`Success! Removed ${indicesToRemove.length} page(s). Remaining pages: ${remainingPages}. Click Download below.`, 'success');
    } catch (err) {
      console.error('PDF processing error:', err);
      if (err.message && err.message.toLowerCase().includes('encrypted')) {
        setMessage('The selected PDF is password-protected. Please unlock it first.', 'error');
      } else {
        setMessage(err.message || 'Unable to process this PDF file. Please check your page selection.', 'error');
      }
    } finally {
      processing = false;
      updateControls();
    }
  });

  updateControls();
})();
