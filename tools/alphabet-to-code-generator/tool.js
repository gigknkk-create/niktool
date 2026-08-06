const userInput = document.getElementById('userInput');
const clearBtn = document.getElementById('clearBtn');

const MORSE_MAP = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
    'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
    'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
    '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----', ' ': '/'
};

const NATO_MAP = {
    'A': 'Alpha', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta', 'E': 'Echo', 'F': 'Foxtrot',
    'G': 'Golf', 'H': 'Hotel', 'I': 'India', 'J': 'Juliet', 'K': 'Kilo', 'L': 'Lima',
    'M': 'Mike', 'N': 'November', 'O': 'Oscar', 'P': 'Papa', 'Q': 'Quebec', 'R': 'Romeo',
    'S': 'Sierra', 'T': 'Tango', 'U': 'Uniform', 'V': 'Victor', 'W': 'Whiskey', 'X': 'X-ray',
    'Y': 'Yankee', 'Z': 'Zulu', ' ': 'Space'
};

function convert() {
    const text = userInput.value;
    const upperText = text.toUpperCase();

    // Binary
    const binary = text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
    document.getElementById('outputBinary').textContent = binary || '...';

    // Morse
    const morse = upperText.split('').map(c => MORSE_MAP[c] || '').filter(x => x).join(' ');
    document.getElementById('outputMorse').textContent = morse || '...';

    // NATO
    const nato = upperText.split('').map(c => NATO_MAP[c] || '').filter(x => x).join(' ');
    document.getElementById('outputNato').textContent = nato || '...';

    // Hex
    const hex = text.split('').map(c => c.charCodeAt(0).toString(16).toUpperCase()).join(' ');
    document.getElementById('outputHex').textContent = hex || '...';

    // Base64
    try {
        const b64 = btoa(unescape(encodeURIComponent(text)));
        document.getElementById('outputBase64').textContent = b64 || '...';
    } catch (e) {
        document.getElementById('outputBase64').textContent = 'Invalid characters for Base64';
    }

    // ROT13
    const rot13 = text.replace(/[a-zA-Z]/g, function(c) {
        return String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
    });
    document.getElementById('outputRot13').textContent = rot13 || '...';
}

function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).textContent;
    if (!text || text === '...') return;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = document.getElementById(elementId).textContent;
        const btn = document.querySelector(`[onclick="copyToClipboard('${elementId}')"]`);
        const icon = btn.querySelector('i');
        
        icon.className = 'fa-solid fa-check text-green-400';
        setTimeout(() => {
            icon.className = 'fa-solid fa-copy';
        }, 2000);
    });
}

userInput.addEventListener('input', convert);
clearBtn.addEventListener('click', () => {
    userInput.value = '';
    convert();
});

// Initial conversion
convert();