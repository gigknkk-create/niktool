document.addEventListener('DOMContentLoaded', () => {
    const cmInput = document.getElementById('cm-input');
    const mInput = document.getElementById('m-input');
    const resetBtn = document.getElementById('reset-btn');

    /**
     * Formats a number to a reasonable string representation
     * Avoids long floating point trails but doesn't force decimals if they aren't needed.
     */
    const formatNumber = (num) => {
        if (isNaN(num) || num === null) return '';
        // Using a precision that handles most common conversion cases
        const fixed = parseFloat(num.toFixed(8));
        return fixed.toString();
    };

    /**
     * Logic for CM to M conversion
     */
    const convertCmToM = (value) => {
        if (value === '') {
            mInput.value = '';
            return;
        }
        const cm = parseFloat(value);
        if (!isNaN(cm)) {
            const meters = cm / 100;
            mInput.value = formatNumber(meters);
        } else {
            mInput.value = '';
        }
    };

    /**
     * Logic for M to CM conversion
     */
    const convertMToCm = (value) => {
        if (value === '') {
            cmInput.value = '';
            return;
        }
        const m = parseFloat(value);
        if (!isNaN(m)) {
            const cm = m * 100;
            cmInput.value = formatNumber(cm);
        } else {
            cmInput.value = '';
        }
    };

    // Event Listeners for live updates
    cmInput.addEventListener('input', (e) => {
        convertCmToM(e.target.value);
    });

    mInput.addEventListener('input', (e) => {
        convertMToCm(e.target.value);
    });

    // Clear button logic
    resetBtn.addEventListener('click', () => {
        cmInput.value = '';
        mInput.value = '';
        cmInput.focus();
    });

    // Handle negative values or edge cases visually
    [cmInput, mInput].forEach(input => {
        input.addEventListener('keydown', (e) => {
            // Prevent scientific notation characters if desired, 
            // but 'e' is technically valid in type="number".
            // For simple length converters, we allow standard behavior.
        });
    });

    // Initial state setup
    console.log('Centimeter to Meter Converter Initialized');
});