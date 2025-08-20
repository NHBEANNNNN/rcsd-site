
async function loadNews(){
  try{
    const res = await fetch('data/news.json', { cache: 'no-store' });
    if(!res.ok) throw new Error('无法读取 data/news.json');
    const items = await res.json();

    const el = document.getElementById('news');
    if(!el) return;

    el.innerHTML = items.map(n => `
      <article class="card">
        <h3>${n.title}</h3>
        <div style="color:var(--muted);font-size:13px">${n.date} · ${n.category || '通告'}</div>
        ${n.image ? `<img src="${n.image}" alt="${n.title}" style="width:100%;border-radius:8px;margin:10px 0;" onerror="this.style.display='none'">` : ''}
        <p>${n.body}</p>
      </article>
    `).join('');
  }catch(e){
    console.error('news.js error:', e);
  }
}
loadNews();
