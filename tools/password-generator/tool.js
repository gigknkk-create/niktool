const sets = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?'
};

const lengthInput = document.querySelector('#length');
const lengthValue = document.querySelector('#length-value');
const output = document.querySelector('#password-output');
const message = document.querySelector('#password-message');
const checkboxes = [...document.querySelectorAll('[data-chars]')];

function randomIndex(max) {
  const limit = Math.floor(256 / max) * max;
  const buffer = new Uint8Array(1);
  do crypto.getRandomValues(buffer); while (buffer[0] >= limit);
  return buffer[0] % max;
}

function shuffle(value) {
  const chars = [...value];
  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];
  }
  return chars.join('');
}

function generate() {
  const selected = checkboxes.filter((box) => box.checked).map((box) => sets[box.dataset.chars]);
  if (!selected.length) {
    checkboxes[0].checked = true;
    selected.push(sets.lower);
    message.textContent = 'Lowercase was enabled so a password could be generated.';
  } else {
    message.textContent = '';
  }

  const length = Number(lengthInput.value);
  const pool = selected.join('');
  let password = selected.map((set) => set[randomIndex(set.length)]).join('');
  while (password.length < length) password += pool[randomIndex(pool.length)];
  output.value = shuffle(password);
  updateStrength(length, pool.length);
}

function updateStrength(length, poolSize) {
  const entropy = length * Math.log2(poolSize);
  const fill = document.querySelector('#strength-fill');
  const label = document.querySelector('#strength-label');
  let score;
  if (entropy < 50) score = ['Fair', '45%', '#d19a2a'];
  else if (entropy < 80) score = ['Good', '70%', '#6d9c3d'];
  else score = ['Strong', '100%', '#2a9e70'];
  [label.textContent, fill.style.width, fill.style.background] = score;
}

lengthInput.addEventListener('input', () => {
  lengthValue.textContent = lengthInput.value;
  generate();
});
checkboxes.forEach((box) => box.addEventListener('change', generate));
document.querySelector('#generate-button').addEventListener('click', generate);
document.querySelector('#copy-button').addEventListener('click', async (event) => {
  try {
    await NikTool.copy(output.value, event.currentTarget);
    message.textContent = 'Password copied to your clipboard.';
  } catch {
    message.textContent = 'Clipboard access was blocked. Select and copy the password manually.';
  }
});

generate();
