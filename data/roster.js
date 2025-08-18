
// Corrected roster.js
// - matches roster.html: #searchInput and #rosterList
// - loads data/roster.json
// - robust to missing fields/photos
(async function(){
  const searchEl = document.getElementById("searchInput");
  const mount = document.getElementById("rosterList");
  if(!searchEl || !mount){
    console.error("Roster: missing #searchInput or #rosterList in HTML.");
    return;
  }

  async function loadJSON(url){
    const res = await fetch(url, {cache: "no-store"});
    if(!res.ok) throw new Error("Failed to load "+url);
    return res.json();
  }

  let data = [];
  try{
    data = await loadJSON("data/roster.json");
  }catch(e){
    console.error(e);
    mount.innerHTML = '<p class="notice">无法加载名册数据（data/roster.json）。</p>';
    return;
  }

  const placeholder = "assets/img/placeholder_officer.svg";

  function card(o){
    const photo = o.photo && o.photo.trim() ? o.photo : placeholder;
    const name = o.name || "未命名";
    const rank = o.rank || "";
    const badge = o.badge ? `#${o.badge}` : "";
    const callsign = o.callsign || "";
    const division = o.division || "";
    const status = o.status || "";
    const bio = o.bio || "";

    return `
      <article class="officer">
        <img src="${photo}" alt="Photo of ${name}" onerror="this.src='${placeholder}'">
        <div class="info">
          <h3>${rank} ${name} <span class="badge-no">${badge}</span></h3>
          <p>${callsign} · ${division} · ${status}</p>
          <p>${bio}</p>
        </div>
      </article>
    `;
  }

  function render(list){
    if(!Array.isArray(list) || list.length === 0){
      mount.innerHTML = '<p class="notice">未找到匹配的成员。</p>';
      return;
    }
    mount.innerHTML = list.map(card).join("");
  }

  function normalize(s){ return (s || "").toString().toLowerCase(); }

  function filter(query){
    const q = normalize(query);
    if(!q) return data;
    return data.filter(o => {
      const hay = [
        o.name, o.rank, o.callsign, o.division, o.badge, o.status, o.bio
      ].map(normalize).join(" ");
      return hay.includes(q);
    });
  }

  // initial render
  render(data);

  // live search
  searchEl.addEventListener("input", () => {
    render(filter(searchEl.value));
  });
})();
