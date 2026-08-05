import { removeBackground } from "https://cdn.jsdelivr.net/npm/@imgly/background-removal@latest/dist/index.js";

const fileInput = document.getElementById('fileInput');
const processBtn = document.getElementById('processBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resultImage = document.getElementById('resultImage');
const loader = document.getElementById('loader');
const uploadPrompt = document.getElementById('uploadPrompt');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const selectedFileName = document.getElementById('selectedFileName');
const emptyStateText = document.getElementById('emptyStateText');

let currentImageBlob = null;

// Handle file selection
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedFileName.textContent = file.name;
        uploadPrompt.classList.add('hidden');
        fileNameDisplay.classList.remove('hidden');
    }
});

window.resetInput = () => {
    fileInput.value = '';
    uploadPrompt.classList.remove('hidden');
    fileNameDisplay.classList.add('hidden');
    resultImage.classList.add('hidden');
    emptyStateText.classList.remove('hidden');
    downloadBtn.disabled = true;
};

// Handle processing
processBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select an image first!");
        return;
    }

    try {
        loader.classList.add('active');
        processBtn.disabled = true;
        emptyStateText.classList.add('hidden');

        // Configuration for the removal library
        const config = {
            progress: (key, current, total) => {
                const percent = Math.round((current / total) * 100);
                document.getElementById('progressText').textContent = `Step: ${key} (${percent}%)`;
            }
        };

        const blob = await removeBackground(file, config);
        
        currentImageBlob = blob;
        const url = URL.createObjectURL(blob);
        
        resultImage.src = url;
        resultImage.classList.remove('hidden');
        downloadBtn.disabled = false;
        
    } catch (error) {
        console.error("Background removal failed:", error);
        alert("Error processing image. Make sure it's a valid image file.");
        emptyStateText.classList.remove('hidden');
    } finally {
        loader.classList.remove('active');
        processBtn.disabled = false;
    }
});

// Handle download
downloadBtn.addEventListener('click', () => {
    if (!currentImageBlob) return;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(currentImageBlob);
    link.download = `removed-bg-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Drag and Drop enhancement
const dropZone = fileInput.parentElement;
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
    }, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('border-indigo-400', 'bg-indigo-500/5');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('border-indigo-400', 'bg-indigo-500/5');
    }, false);
});

dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file && file.type.startsWith('image/')) {
        fileInput.files = dt.files;
        selectedFileName.textContent = file.name;
        uploadPrompt.classList.add('hidden');
        fileNameDisplay.classList.remove('hidden');
    }
}, false);