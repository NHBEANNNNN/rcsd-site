async function loadRoster() {
  try {
    const res = await fetch("data/roster.json");
    const officers = await res.json();

    const list = document.getElementById("rosterList");
    const searchInput = document.getElementById("searchInput");

    function render(filter = "") {
      list.innerHTML = "";
      officers
        .filter(o =>
          o.name.toLowerCase().includes(filter) ||
          o.rank.toLowerCase().includes(filter) ||
          o.callsign.toLowerCase().includes(filter) ||
          o.division.toLowerCase().includes(filter) ||
          o.badge.toLowerCase().includes(filter)
        )
        .forEach(o => {
          const card = document.createElement("div");
          card.className = "officer";
          card.innerHTML = `
            <img src="${o.photo}" alt="${o.name}">
            <h3>${o.name}</h3>
            <p><b>职级:</b> ${o.rank}</p>
            <p><b>呼号:</b> ${o.callsign}</p>
            <p><b>部门:</b> ${o.division}</p>
            <p><b>警徽编号:</b> ${o.badge}</p>
            <p><b>状态:</b> ${o.status}</p>
            <p>${o.bio}</p>
          `;
          list.appendChild(card);
        });
    }

    // 初始渲染
    render();

    // 监听搜索
    searchInput.addEventListener("input", e => {
      render(e.target.value.toLowerCase());
    });
  } catch (err) {
    console.error("Roster 加载失败:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadRoster);
