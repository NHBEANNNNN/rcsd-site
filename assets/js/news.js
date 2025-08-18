
async function loadNews(){
  try{
    const res = await fetch('data/news.json');
    const items = await res.json();
    const el = document.getElementById('news');
    if(!el) return;
    el.innerHTML = items.map(n => `
      <article class="card">
        <h3>${n.title}</h3>
        <div style="color:var(--muted);font-size:13px">${n.date} · ${n.category||'通告'}</div>
        <p>${n.body}</p>
      </article>
    `).join('');
  }catch(e){
    console.error(e);
  }
}
loadNews();
