document.addEventListener('DOMContentLoaded', () => {
    const jsonInput = document.getElementById('jsonInput');
    const yamlOutput = document.getElementById('yamlOutput');
    const copyBtn = document.getElementById('copyBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const clearBtn = document.getElementById('clearBtn');
    const indentSelect = document.getElementById('indentSelect');
    const quoteToggle = document.getElementById('quoteToggle');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    const SAMPLE_JSON = {
        "name": "JSON-to-YAML Tool",
        "version": 1.0,
        "description": "A developer utility for data format conversion",
        "features": [
            "Dark mode support",
            "Real-time conversion",
            "Configurable indentation",
            "Error validation"
        ],
        "meta": {
            "author": "DevTool Repo",
            "license": "MIT",
            "tags": ["yaml", "json", "converter"]
        }
    };

    const convert = () => {
        const input = jsonInput.value.trim();
        
        if (!input) {
            yamlOutput.value = '';
            hideError();
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const indent = parseInt(indentSelect.value);
            const forceQuotes = quoteToggle.checked;

            const yaml = jsyaml.dump(parsed, {
                indent: indent,
                forceQuotes: forceQuotes,
                noRefs: true,
                lineWidth: -1
            });

            yamlOutput.value = yaml;
            hideError();
        } catch (e) {
            showError(e.message);
        }
    };

    const showError = (msg) => {
        errorText.textContent = msg;
        errorMessage.classList.remove('hidden');
    };

    const hideError = () => {
        errorMessage.classList.add('hidden');
    };

    const copyToClipboard = () => {
        if (!yamlOutput.value) return;
        
        navigator.clipboard.writeText(yamlOutput.value).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fa-solid fa-check mr-1"></i> Copied!';
            copyBtn.classList.replace('bg-emerald-600', 'bg-blue-600');
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.replace('bg-blue-600', 'bg-emerald-600');
            }, 2000);
        });
    };

    // Event Listeners
    jsonInput.addEventListener('input', convert);
    indentSelect.addEventListener('change', convert);
    quoteToggle.addEventListener('change', convert);

    sampleBtn.addEventListener('click', () => {
        jsonInput.value = JSON.stringify(SAMPLE_JSON, null, 2);
        convert();
    });

    clearBtn.addEventListener('click', () => {
        jsonInput.value = '';
        yamlOutput.value = '';
        hideError();
    });

    copyBtn.addEventListener('click', copyToClipboard);

    // Auto-focus input on load
    jsonInput.focus();
});