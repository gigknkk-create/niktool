const fileInput = document.querySelector('#pdf-input');
const fileSection = document.querySelector('#file-section');
const fileList = document.querySelector('#file-list');
const mergeButton = document.querySelector('#merge-button');
const clearButton = document.querySelector('#clear-button');
const message = document.querySelector('#pdf-message');

const MAX_TOTAL_SIZE = 200 * 1024 * 1024;
let selectedFiles = [];

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function setMessage(text, type = '') {
  message.textContent = text;
  message.className = `message${type ? ` ${type}` : ''}`;
}

function renderFiles() {
  fileList.replaceChildren();

  selectedFiles.forEach((file, index) => {
    const item = document.createElement('li');
    item.className = 'control-group';

    const name = document.createElement('strong');
    name.textContent = `${index + 1}. ${file.name}`;

    const size = document.createElement('span');
    size.className = 'message';
    size.textContent = formatFileSize(file.size);

    const controls = document.createElement('div');
    controls.className = 'toolbar';

    const actions = [
      { label: 'Move up', action: 'up', disabled: index === 0 },
      { label: 'Move down', action: 'down', disabled: index === selectedFiles.length - 1 },
      { label: 'Remove', action: 'remove', disabled: false }
    ];

    actions.forEach(({ label, action, disabled }) => {
      const button = document.createElement('button');
      button.className = 'button secondary';
      button.type = 'button';
      button.textContent = label;
      button.dataset.action = action;
      button.dataset.index = String(index);
      button.disabled = disabled;
      button.setAttribute('aria-label', `${label} ${file.name}`);
      controls.append(button);
    });

    item.append(name, size, controls);
    fileList.append(item);
  });

  const hasFiles = selectedFiles.length > 0;
  fileSection.hidden = !hasFiles;
  clearButton.disabled = !hasFiles;
  mergeButton.disabled = selectedFiles.length < 2;

  if (!hasFiles) setMessage('Select at least two PDF files to begin.');
  else if (selectedFiles.length === 1) setMessage('Add one more PDF file to enable merging.');
  else setMessage(`${selectedFiles.length} PDF files ready to merge.`, 'success');
}

function isPdf(file) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

fileInput.addEventListener('change', () => {
  const newFiles = Array.from(fileInput.files || []);
  const pdfFiles = newFiles.filter(isPdf);

  if (pdfFiles.length !== newFiles.length) {
    setMessage('Only PDF files can be added.', 'error');
  }

  const nextFiles = [...selectedFiles, ...pdfFiles];
  const totalSize = nextFiles.reduce((sum, file) => sum + file.size, 0);

  if (totalSize > MAX_TOTAL_SIZE) {
    setMessage('The selected files exceed the 200 MB total limit.', 'error');
    fileInput.value = '';
    return;
  }

  selectedFiles = nextFiles;
  fileInput.value = '';
  renderFiles();
});

fileList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const index = Number(button.dataset.index);
  const action = button.dataset.action;

  if (action === 'remove') selectedFiles.splice(index, 1);
  if (action === 'up' && index > 0) {
    [selectedFiles[index - 1], selectedFiles[index]] = [selectedFiles[index], selectedFiles[index - 1]];
  }
  if (action === 'down' && index < selectedFiles.length - 1) {
    [selectedFiles[index], selectedFiles[index + 1]] = [selectedFiles[index + 1], selectedFiles[index]];
  }

  renderFiles();
});

clearButton.addEventListener('click', () => {
  selectedFiles = [];
  fileInput.value = '';
  renderFiles();
  fileInput.focus();
});

mergeButton.addEventListener('click', async () => {
  if (selectedFiles.length < 2) {
    setMessage('Select at least two PDF files before merging.', 'error');
    return;
  }

  if (!window.PDFLib) {
    setMessage('The PDF engine could not load. Check your connection and try again.', 'error');
    return;
  }

  mergeButton.disabled = true;
  clearButton.disabled = true;
  fileInput.disabled = true;
  mergeButton.textContent = 'Merging…';
  setMessage('Reading and combining your PDF files…');

  try {
    const mergedPdf = await PDFLib.PDFDocument.create();

    for (const file of selectedFiles) {
      const sourceBytes = await file.arrayBuffer();
      const sourcePdf = await PDFLib.PDFDocument.load(sourceBytes);
      const pageIndices = sourcePdf.getPageIndices();
      const pages = await mergedPdf.copyPages(sourcePdf, pageIndices);
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    const blob = new Blob([mergedBytes], { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = 'merged-document.pdf';
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

    setMessage(`Merged ${selectedFiles.length} PDF files successfully.`, 'success');
  } catch (error) {
    const encrypted = /encrypt/i.test(error.message || '');
    setMessage(
      encrypted
        ? 'A password-protected PDF could not be opened. Unlock it and try again.'
        : 'One of the PDF files could not be merged. Make sure every file is a valid PDF.',
      'error'
    );
  } finally {
    mergeButton.textContent = 'Merge PDFs';
    mergeButton.disabled = selectedFiles.length < 2;
    clearButton.disabled = selectedFiles.length === 0;
    fileInput.disabled = false;
  }
});
