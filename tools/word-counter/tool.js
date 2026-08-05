const input = document.querySelector('#text-input');
const nodes = {
  words: document.querySelector('#words'),
  characters: document.querySelector('#characters'),
  sentences: document.querySelector('#sentences'),
  readingTime: document.querySelector('#reading-time'),
  detail: document.querySelector('#detail-count')
};

function updateCounts() {
  const text = input.value;
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/u).length : 0;
  const sentences = trimmed ? (trimmed.match(/[^.!?]+(?:[.!?]+|$)/gu) || []).filter((part) => part.trim()).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/u).filter((part) => part.trim()).length : 0;
  const noSpaces = text.replace(/\s/gu, '').length;
  const minutes = words === 0 ? '0 min' : words < 225 ? '< 1 min' : `${Math.ceil(words / 225)} min`;

  nodes.words.textContent = words.toLocaleString();
  nodes.characters.textContent = text.length.toLocaleString();
  nodes.sentences.textContent = sentences.toLocaleString();
  nodes.readingTime.textContent = minutes;
  nodes.detail.textContent = `${paragraphs.toLocaleString()} ${paragraphs === 1 ? 'paragraph' : 'paragraphs'} · ${noSpaces.toLocaleString()} characters without spaces`;
}

input.addEventListener('input', updateCounts);
document.querySelector('#clear-button').addEventListener('click', () => {
  input.value = '';
  updateCounts();
  input.focus();
});

