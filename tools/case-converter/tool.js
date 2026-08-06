const input = document.querySelector('#case-input');
const output = document.querySelector('#case-output');
const conversionButtons = document.querySelectorAll('[data-case]');
const copyButton = document.querySelector('#copy-output');
const clearButton = document.querySelector('#clear-text');
const message = document.querySelector('#case-message');

function setMessage(text, type = '') {
  message.textContent = text;
  message.className = `message${type ? ` ${type}` : ''}`;
}

function wordsFrom(text) {
  return text
    .trim()
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map((word) => word.toLocaleLowerCase());
}

function sentenceCase(text) {
  const lower = text.toLocaleLowerCase();
  return lower.replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, (match) => match.toLocaleUpperCase());
}

function titleCase(text) {
  return text.toLocaleLowerCase().replace(/\b[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu, (word) =>
    word.charAt(0).toLocaleUpperCase() + word.slice(1)
  );
}

function convert(text, type) {
  const words = wordsFrom(text);

  switch (type) {
    case 'sentence':
      return sentenceCase(text);
    case 'lower':
      return text.toLocaleLowerCase();
    case 'upper':
      return text.toLocaleUpperCase();
    case 'title':
      return titleCase(text);
    case 'camel':
      return words.map((word, index) =>
        index === 0 ? word : word.charAt(0).toLocaleUpperCase() + word.slice(1)
      ).join('');
    case 'snake':
      return words.join('_');
    case 'kebab':
      return words.join('-');
    default:
      return text;
  }
}

function updateControls() {
  const hasInput = input.value.length > 0;
  const hasOutput = output.value.length > 0;
  clearButton.disabled = !hasInput && !hasOutput;
  copyButton.disabled = !hasOutput;
}

conversionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!input.value.trim()) {
      output.value = '';
      setMessage('Enter some text before choosing a conversion.', 'error');
      updateControls();
      input.focus();
      return;
    }

    output.value = convert(input.value, button.dataset.case);
    setMessage(`Converted to ${button.textContent}.`, 'success');
    updateControls();
  });
});

input.addEventListener('input', () => {
  if (!input.value) {
    output.value = '';
    setMessage('Enter some text and choose a conversion.');
  } else {
    setMessage(`${input.value.length.toLocaleString()} characters ready to convert.`);
  }
  updateControls();
});

copyButton.addEventListener('click', async () => {
  if (!output.value) return;

  try {
    await navigator.clipboard.writeText(output.value);
    setMessage('Converted text copied to your clipboard.', 'success');
  } catch {
    output.focus();
    output.select();
    setMessage('Select the result and copy it manually.', 'error');
  }
});

clearButton.addEventListener('click', () => {
  input.value = '';
  output.value = '';
  setMessage('Text cleared.');
  updateControls();
  input.focus();
});

updateControls();
