document.addEventListener('DOMContentLoaded', () => {
    const cmInput = document.getElementById('cmInput');
    const mInput = document.getElementById('mInput');
    const clearBtn = document.getElementById('clearBtn');
    const swapBtn = document.getElementById('swapBtn');

    /**
     * Utility to handle precision and prevent long decimal tails
     * @param {number} value 
     * @returns {number}
     */
    const formatResult = (value) => {
        if (isNaN(value)) return '';
        // Using toPrecision or rounding to 10 decimal places to handle float precision
        const result = Number(Math.round(value + 'e10') + 'e-10');
        return result;
    };

    /**
     * Logic for Centimeters to Meters
     */
    const convertCmToM = () => {
        const val = parseFloat(cmInput.value);
        if (!isNaN(val)) {
            mInput.value = formatResult(val / 100);
        } else {
            mInput.value = '';
        }
    };

    /**
     * Logic for Meters to Centimeters
     */
    const convertMToCm = () => {
        const val = parseFloat(mInput.value);
        if (!isNaN(val)) {
            cmInput.value = formatResult(val * 100);
        } else {
            cmInput.value = '';
        }
    };

    // Input Event Listeners
    cmInput.addEventListener('input', convertCmToM);
    mInput.addEventListener('input', convertMToCm);

    // Clear Functionality
    clearBtn.addEventListener('click', () => {
        cmInput.value = '';
        mInput.value = '';
        cmInput.focus();
    });

    // Swap Focus Functionality
    swapBtn.addEventListener('click', () => {
        if (document.activeElement === cmInput) {
            mInput.focus();
        } else {
            cmInput.focus();
        }
    });

    // Handle negative values - length usually isn't negative
    // but we allow it as this is a mathematical converter.
    // However, prevent 'e' and other chars if browser doesn't block them.
    [cmInput, mInput].forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (['e', 'E', '+'].includes(e.key)) {
                // Optional: prevent exponent notation for simpler UX
                // e.preventDefault();
            }
        });
    });

    // Initialization
    console.log('NikTool: Length Converter Initialized');
});