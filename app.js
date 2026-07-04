const grid = document.getElementById('grid');
const emptyState = document.getElementById('empty');
const searchInput = document.getElementById('search');
const countChip = document.getElementById('count');

let allItems = [];

function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function cardTemplate(item) {
  const cover = item.image
    ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)} cover" loading="lazy" />`
    : `<div style="font-family:var(--font-mono);color:var(--text-dim);font-size:12px;">no cover</div>`;

  const tags = Array.isArray(item.tags) && item.tags.length
    ? `<div class="tag-row">${item.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`
    : '';

  return `
    <article class="card">
      <div class="card-cover">${cover}</div>
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(item.title)}</h2>
        <p class="card-desc">${escapeHtml(item.description)}</p>
        ${tags}
        <div class="card-nfo">
          <div class="row"><span class="k">added</span><span>${formatDate(item.date)}</span></div>
        </div>
        <a class="download-btn" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">
          Download ↗
        </a>
      </div>
    </article>
  `;
}

function render(items) {
  if (!items.length) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
    countChip.textContent = '0 items';
    return;
  }
  emptyState.style.display = 'none';
  grid.innerHTML = items.map(cardTemplate).join('');
  countChip.textContent = `${items.length} item${items.length === 1 ? '' : 's'}`;
}

function applyFilter() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return render(allItems);
  render(allItems.filter(i => (i.title || '').toLowerCase().includes(q)));
}

searchInput.addEventListener('input', applyFilter);

fetch('items.json', { cache: 'no-store' })
  .then(res => res.json())
  .then(data => {
    allItems = (data || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    render(allItems);
  })
  .catch(() => {
    grid.innerHTML = '';
    emptyState.textContent = 'could not load items.json — check that the build step ran.';
    emptyState.style.display = 'block';
  });
