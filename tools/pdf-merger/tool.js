document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('tool-input-field');
    const outputField = document.getElementById('tool-output-field');
    const btnPrimary = document.getElementById('btn-action-primary');
    const btnClear = document.getElementById('btn-action-clear');
    const btnSample = document.getElementById('btn-action-sample');
    const btnCopy = document.getElementById('btn-action-copy');
    const btnDownload = document.getElementById('btn-action-download');
    const statChars = document.getElementById('stat-chars');
    const statWords = document.getElementById('stat-words');
    const statLines = document.getElementById('stat-lines');
    const statusMsg = document.getElementById('status-message-box');

    // Realtime Input Handler & Statistics
    if (inputField) {
        inputField.addEventListener('input', updateStats);
    }

    function updateStats() {
        const val = inputField ? inputField.value : '';
        if (statChars) statChars.textContent = val.length;
        if (statWords) {
            const words = val.trim() ? val.trim().split(/\s+/).length : 0;
            statWords.textContent = words;
        }
        if (statLines) {
            const lines = val ? val.split('\n').length : 0;
            statLines.textContent = lines;
        }
    }

    if (btnSample && inputField) {
        btnSample.addEventListener('click', () => {
            inputField.value = "Sample input text for pdf merger testing on NikTool.in";
            updateStats();
            showStatus('Sample data loaded.', 'info');
        });
    }

    if (btnPrimary) {
        
        btnPrimary.addEventListener('click', () => {
            const val = inputField.value;
            if (!val.trim()) { showStatus('Please enter input text.', 'error'); return; }
            outputField.value = val.trim();
            showStatus('Processed input successfully!', 'success');
        });
    }

    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (inputField) inputField.value = '';
            if (outputField) outputField.value = '';
            updateStats();
            showStatus('Cleared all inputs.', 'info');
        });
    }

    if (btnCopy) {
        btnCopy.addEventListener('click', () => {
            if (!outputField || !outputField.value) {
                showStatus('Nothing to copy!', 'error');
                return;
            }
            try {
                outputField.select();
                document.execCommand('copy');
                showStatus('Result copied to clipboard!', 'success');
            } catch (err) {
                showStatus('Copy failed: ' + err.message, 'error');
            }
        });
    }

    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            const content = outputField ? outputField.value : '';
            if (!content) { showStatus('No output to save!', 'error'); return; }
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = "pdf-merger-result.txt";
            link.click();
            URL.revokeObjectURL(link.href);
            showStatus('File downloaded!', 'success');
        });
    }

    function showStatus(text, type) {
        if (!statusMsg) return;
        statusMsg.className = 'text-xs px-4 py-2.5 rounded-xl font-mono transition';
        
        if (type === 'success') {
            statusMsg.classList.add('bg-emerald-950/80', 'text-emerald-300', 'border', 'border-emerald-800');
        } else if (type === 'error') {
            statusMsg.classList.add('bg-red-950/80', 'text-red-300', 'border', 'border-red-800');
        } else {
            statusMsg.classList.add('bg-slate-800', 'text-slate-200', 'border', 'border-slate-700');
        }
        
        statusMsg.textContent = text;
        statusMsg.classList.remove('hidden');
        setTimeout(() => {
            statusMsg.classList.add('hidden');
        }, 3000);
    }
});