document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('tool-input-field');
    const outputField = document.getElementById('tool-output-field');
    const btnPrimary = document.getElementById('btn-action-primary');
    const btnClear = document.getElementById('btn-action-clear');
    const btnCopy = document.getElementById('btn-action-copy');
    const statChars = document.getElementById('stat-chars');
    const statWords = document.getElementById('stat-words');
    const statusMsg = document.getElementById('status-message-box');

    // Realtime Input Handler & Statistics
    if (inputField) {
        inputField.addEventListener('input', () => {
            const val = inputField.value;
            if (statChars) statChars.textContent = val.length;
            if (statWords) {
                const words = val.trim() ? val.trim().split(/\s+/).length : 0;
                statWords.textContent = words;
            }
        });
    }

    if (btnPrimary) {
        
        btnPrimary.addEventListener('click', () => {
            const val = inputField.value;
            outputField.value = val.toUpperCase();
            showStatus('Converted to UPPERCASE!', 'success');
        });

        // Additional Case Action Listeners
        const actionGroup = document.getElementById('action-buttons-group');
        if (actionGroup && !document.getElementById('btn-lowercase')) {
            actionGroup.innerHTML += `
                <button id="btn-lowercase" class="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition">Lowercase</button>
                <button id="btn-titlecase" class="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition">Title Case</button>
            `;

            setTimeout(() => {
                document.getElementById('btn-lowercase')?.addEventListener('click', () => {
                    outputField.value = inputField.value.toLowerCase();
                    showStatus('Converted to lowercase!', 'success');
                });
                document.getElementById('btn-titlecase')?.addEventListener('click', () => {
                    outputField.value = inputField.value.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
                    showStatus('Converted to Title Case!', 'success');
                });
            }, 100);
        }
    }

    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (inputField) inputField.value = '';
            if (outputField) outputField.value = '';
            if (statChars) statChars.textContent = '0';
            if (statWords) statWords.textContent = '0';
            showStatus('Input cleared.', 'info');
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

    function showStatus(text, type) {
        if (!statusMsg) return;
        statusMsg.className = 'text-xs px-3 py-2 rounded-lg font-mono';
        
        if (type === 'success') {
            statusMsg.classList.add('bg-emerald-950', 'text-emerald-300', 'border', 'border-emerald-800');
        } else if (type === 'error') {
            statusMsg.classList.add('bg-red-950', 'text-red-300', 'border', 'border-red-800');
        } else {
            statusMsg.classList.add('bg-slate-800', 'text-slate-300');
        }
        
        statusMsg.textContent = text;
        statusMsg.classList.remove('hidden');
        setTimeout(() => {
            statusMsg.classList.add('hidden');
        }, 3000);
    }
});