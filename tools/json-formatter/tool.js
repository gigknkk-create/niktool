const input = document.querySelector('#json-input');
const output = document.querySelector('#json-output');
const message = document.querySelector('#json-message');

function transform(spaces) {
  const source = input.value.trim();
  if (!source) {
    output.value = '';
    setMessage('Paste JSON to get started.');
    return;
  }

  try {
    output.value = JSON.stringify(JSON.parse(source), null, spaces);
    setMessage(spaces === 0 ? 'Valid JSON · Minified successfully.' : 'Valid JSON · Formatted successfully.', 'success');
  } catch (error) {
    output.value = '';
    setMessage(`Invalid JSON · ${error.message}`, 'error');
  }
}

function setMessage(text, type = '') {
  message.textContent = text;
  message.className = `message${type ? ` ${type}` : ''}`;
}

document.querySelector('#format-button').addEventListener('click', () => transform(2));
document.querySelector('#minify-button').addEventListener('click', () => transform(0));
document.querySelector('#clear-button').addEventListener('click', () => {
  input.value = '';
  output.value = '';
  setMessage('Paste JSON to get started.');
  input.focus();
});
document.querySelector('#copy-button').addEventListener('click', async (event) => {
  if (!output.value) {
    setMessage('Format or minify JSON before copying.', 'error');
    return;
  }
  try {
    await NikTool.copy(output.value, event.currentTarget);
    setMessage('Output copied to your clipboard.', 'success');
  } catch {
    setMessage('Clipboard access was blocked. Select and copy the output manually.', 'error');
  }
});
