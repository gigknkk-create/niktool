const icons = {
  text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h16M4 10h10M4 14h16M4 18h8"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m8 9-3 3 3 3m8-6 3 3-3 3m-2-9-4 12"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 4.6 2.9 8 7 10 4.1-2 7-5.4 7-10V6l-7-3Z"/><path d="m9.5 12 1.6 1.6 3.6-3.8"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>'
};

window.NikTool = {
  icons,
  copy: async (text, button) => {
    await navigator.clipboard.writeText(text);
    const oldLabel = button.getAttribute('aria-label');
    button.setAttribute('aria-label', 'Copied');
    button.dataset.copied = 'true';
    window.setTimeout(() => {
      button.setAttribute('aria-label', oldLabel || 'Copy');
      delete button.dataset.copied;
    }, 1500);
  }
};

const yearNode = document.querySelector('[data-year]');
if (yearNode) yearNode.textContent = new Date().getFullYear();
