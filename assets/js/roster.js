
async function loadRoster(){
  try{
    const res = await fetch('data/roster.json');
    const roster = await res.json();

    const q = document.getElementById('q');
    const divisionSel = document.getElementById('division');
    const rankSel = document.getElementById('rank');
    const statusSel = document.getElementById('status');
    const mount = document.getElementById('roster');

    function render(){
      const query = (q.value || '').toLowerCase().trim();
      const divv = divisionSel.value;
      const rank = rankSel.value;
      const stat = statusSel.value;

      const filtered = roster.filter(o=>{
        const hay = (o.name + ' ' + o.callsign + ' ' + o.badge + ' ' + o.rank + ' ' + o.division).toLowerCase();
        const hit = hay.includes(query);
        const okDiv = !divv || o.division===divv;
        const okRank = !rank || o.rank===rank;
        const okStat = !stat || o.status===stat;
        return hit && okDiv && okRank && okStat;
      });

      mount.innerHTML = filtered.map(o=>`
        <article class="officer" tabindex="0" aria-label="${o.name} ${o.rank}">
          <img src="${o.photo || 'assets/img/placeholder_officer.svg'}" alt="Photo of ${o.name}">
          <div class="body">
            <h3>${o.rank} ${o.name} <span class="badge-no">#${o.badge}</span></h3>
            <div class="meta">
              <span>${o.callsign}</span> · <span>${o.division}</span> · <span>${o.status}</span>
            </div>
            <p style="color:var(--muted)">${o.bio || ''}</p>
          </div>
        </article>
      `).join('') || '<p class="notice">未找到匹配的成员。</p>';
    }

    [q, divisionSel, rankSel, statusSel].forEach(el=>el.addEventListener('input', render));
    render();
  }catch(err){
    console.error(err);
  }
}
loadRoster();
