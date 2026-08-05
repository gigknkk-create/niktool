const grid = document.querySelector('#tool-grid');
const search = document.querySelector('#tool-search');
const filters = document.querySelector('#category-filters');
const count = document.querySelector('#tool-count');
let tools = [];
let activeCategory = 'All';

const initialQuery = new URLSearchParams(window.location.search).get('q');
if (initialQuery) search.value = initialQuery;

const card = (tool) => `
  <a class="tool-card" href="${tool.path}" data-category="${tool.category}">
    <div class="tool-card-top">
      <span class="tool-icon" aria-hidden="true">${NikTool.icons[tool.icon] || NikTool.icons.code}</span>
      <span class="tool-arrow" aria-hidden="true">${NikTool.icons.arrow}</span>
    </div>
    <h3>${tool.name}</h3>
    <p>${tool.description}</p>
    <span class="tool-category">${tool.category}</span>
  </a>`;

function render() {
  const query = search.value.trim().toLowerCase();
  const matches = tools.filter((tool) => {
    const inCategory = activeCategory === 'All' || tool.category === activeCategory;
    const searchable = `${tool.name} ${tool.description} ${tool.category} ${tool.keywords.join(' ')}`.toLowerCase();
    return inCategory && searchable.includes(query);
  });

  count.textContent = `${matches.length} ${matches.length === 1 ? 'tool' : 'tools'}`;
  grid.innerHTML = matches.length
    ? matches.map(card).join('')
    : `<div class="empty-state"><strong>No tools found.</strong><br>Try another search or category.</div>`;
}

function renderFilters() {
  const categories = ['All', ...new Set(tools.map((tool) => tool.category))];
  filters.innerHTML = categories.map((category) =>
    `<button class="filter-button${category === 'All' ? ' active' : ''}" type="button" data-category="${category}">${category}</button>`
  ).join('');
}

fetch('/catalog.json')
  .then((response) => {
    if (!response.ok) throw new Error('Catalog unavailable');
    return response.json();
  })
  .then((data) => {
    tools = data;
    renderFilters();
    render();
  })
  .catch(() => {
    grid.innerHTML = '<div class="empty-state">The tool catalog could not be loaded. Please refresh the page.</div>';
  });

search.addEventListener('input', render);
filters.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  activeCategory = button.dataset.category;
  filters.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button));
  render();
});

document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement !== search) {
    event.preventDefault();
    search.focus();
  }
});
