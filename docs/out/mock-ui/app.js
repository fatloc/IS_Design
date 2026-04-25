const roleConfig = {
  sale: {
    label: "Sale",
    kpis: [
      { title: "Lich hen hom nay", value: "8", note: "4 can xac nhan" },
      { title: "Yeu cau moi", value: "14", note: "24h gan nhat" },
      { title: "Ti le show-up", value: "72%", note: "Tuan nay" },
      { title: "Khach dang follow", value: "21", note: "Pipeline mo" }
    ],
    widgets: [
      "Lich hen hom nay theo khung gio",
      "Danh sach yeu cau moi can goi lai",
      "Danh sach phong de xuat theo tieu chi",
      "Conversion: Tu xem phong -> dat coc"
    ]
  },
  manager: {
    label: "Quan ly",
    kpis: [
      { title: "Phong trong", value: "42", note: "San sang cho thue" },
      { title: "Dang coc", value: "15", note: "24h hold" },
      { title: "Dang o", value: "167", note: "Dang hop dong" },
      { title: "Yeu cau check-out", value: "6", note: "Can xu ly" }
    ],
    widgets: [
      "Heatmap trang thai phong theo tang",
      "Queue lock/unlock phong cho dat coc",
      "Canh bao conflict: coc de / trung lich",
      "Tien do bien ban ban giao va thanh ly"
    ]
  },
  accountant: {
    label: "Ke toan",
    kpis: [
      { title: "Hoa don cho thu", value: "19", note: "Trong 48h" },
      { title: "Dat coc cho doi soat", value: "11", note: "SLA 24h" },
      { title: "Yeu cau hoan coc", value: "7", note: "Can tinh toan" },
      { title: "Cong no qua han", value: "5", note: "Can nhac no" }
    ],
    widgets: [
      "Bang doi soat thu/chi theo ticket",
      "Nhat ky thanh toan ky dau + phat sinh",
      "May tinh hoan coc theo quy tac",
      "Danh sach bien ban thanh ly cho ky"
    ]
  }
};

const tickets = [
  { id: "TK-221", customer: "Nguyen Van A", stage: "Tim kiem & Xem phong", owner: "Sale", sla: "3h", status: "Dang hen lich" },
  { id: "TK-226", customer: "Tran Thi B", stage: "Dat coc & Xac nhan", owner: "Manager", sla: "12h", status: "Cho lock phong" },
  { id: "TK-229", customer: "Le Quang C", stage: "Dat coc & Xac nhan", owner: "Accountant", sla: "4h", status: "Cho doi soat coc" },
  { id: "TK-233", customer: "Pham Thi D", stage: "Nhan phong & Ky HD", owner: "Manager", sla: "8h", status: "Cho ban giao" },
  { id: "TK-241", customer: "Do Minh E", stage: "Tra phong & Thanh ly", owner: "Accountant", sla: "20h", status: "Tinh hoan coc" }
];

const roomData = [
  { code: "A-101", status: "vacant", guest: "-", note: "Trong, chua coc" },
  { code: "A-102", status: "hold", guest: "TK-226", note: "Dang coc 24h" },
  { code: "A-103", status: "occupied", guest: "HD-901", note: "Dang hop dong" },
  { code: "A-104", status: "maintenance", guest: "-", note: "Dang sua dieu hoa" },
  { code: "B-201", status: "vacant", guest: "-", note: "Trong, full noi that" },
  { code: "B-202", status: "occupied", guest: "HD-887", note: "Hop dong den 08/2026" },
  { code: "B-203", status: "hold", guest: "TK-229", note: "Cho xac nhan coc" },
  { code: "B-204", status: "vacant", guest: "-", note: "Trong, co bai xe" }
];

const flowSteps = [
  {
    title: "Giai doan 1 - Tim kiem & Xem phong",
    detail: "Sale tiep nhan nhu cau, he thong loc phong trong/chua coc, tao lich hen xem phong, ghi nhan ket qua xem phong."
  },
  {
    title: "Giai doan 2 - Dat coc & Xac nhan thue",
    detail: "Manager lock phong tranh coc de, Accountant tao yeu cau thanh toan coc 24h, cap nhat ho so; coc thanh cong thi khoa phong."
  },
  {
    title: "Giai doan 3 - Nhan phong & Ky hop dong",
    detail: "Kiem tra giay to va thanh vien nhom, ky hop dong, thu ky dau, ban giao tai san va kich hoat trang thai dang o."
  },
  {
    title: "Giai doan 4 - Tra phong & Thanh ly",
    detail: "Tiep nhan tra phong, doi soat chi phi, thu phat sinh, hoan coc con lai, ky bien ban thanh ly va reset phong."
  }
];

const stageOrder = [
  "Tim kiem & Xem phong",
  "Dat coc & Xac nhan",
  "Nhan phong & Ky HD",
  "Tra phong & Thanh ly"
];

const screenOrder = ["overview", "sitemap", "dashboards", "roommap", "tasks", "flows"];

let activeRole = "sale";
let activeScreen = "overview";

function qs(sel) {
  return document.querySelector(sel);
}

function labelStatus(st) {
  if (st === "vacant") return "Trong";
  if (st === "hold") return "Dang coc";
  if (st === "occupied") return "Dang o";
  return "Bao tri";
}

function renderRoleData() {
  const cfg = roleConfig[activeRole];
  qs("#roleTag").textContent = `Role active: ${cfg.label}`;

  qs("#roleKpis").innerHTML = cfg.kpis
    .map(
      (k) => `
      <article class="kpi">
        <p>${k.title}</p>
        <h4>${k.value}</h4>
        <small>${k.note}</small>
      </article>
    `
    )
    .join("");

  qs("#dashboardBlocks").innerHTML = `
    <div class="dash-block">
      <h4>Header area</h4>
      <p>Xin chao ${cfg.label}. KPI strip + quick actions + bo loc chi nhanh.</p>
    </div>
    <div class="dash-block">
      <h4>Main widgets</h4>
      <p>4 widget uu tien cho role hien tai, co drill-down den ticket chi tiet.</p>
    </div>
    <div class="dash-block">
      <h4>Bottom queue</h4>
      <p>Danh sach ticket can xu ly ngay theo SLA va muc do uu tien.</p>
    </div>
  `;

  qs("#widgetDetail").innerHTML = cfg.widgets.map((x) => `<li>${x}</li>`).join("");
}

function renderGlobalStatus() {
  const items = [
    { title: "Pipeline tong", note: "41 ticket dang mo - 6 can canh bao SLA" },
    { title: "Room inventory", note: "42 trong | 15 dang coc | 167 dang o | 4 bao tri" },
    { title: "Tai chinh", note: "19 hoa don cho thu | 7 yeu cau hoan coc" }
  ];

  qs("#globalStatus").innerHTML = items
    .map(
      (i) => `
      <div class="status-item">
        <strong>${i.title}</strong>
        <span>${i.note}</span>
      </div>
    `
    )
    .join("");
}

function roomActions(room, role) {
  if (room.status === "vacant" && role === "sale") return ["Tao lich xem", "Tao de xuat phong", "Tao ticket dat coc"];
  if (room.status === "hold" && role === "manager") return ["Xac nhan lock", "Mo lock neu qua han", "Gan uu tien ticket"];
  if (room.status === "occupied" && role === "accountant") return ["Xem cong no", "Tao doi soat checkout", "Kiem tra lich su thu phi"];
  return ["Xem lich su phong", "Xem timeline ticket", "Gan ghi chu van hanh"];
}

function renderRoomDetail(room) {
  const actions = roomActions(room, activeRole);
  qs("#roomDetail").innerHTML = `
    <h4>${room.code} - ${labelStatus(room.status)}</h4>
    <p>Lien ket: ${room.guest}</p>
    <p>Ghi chu: ${room.note}</p>
    <div class="room-actions">
      ${actions.map((x) => `<button class="ghost small">${x}</button>`).join("")}
    </div>
  `;
}

function renderRoomGrid() {
  qs("#buildingGrid").innerHTML = roomData
    .map(
      (r) => `
      <button class="room-cell" data-room="${r.code}" type="button">
        <h5>${r.code}</h5>
        <span class="chip ${r.status}">${labelStatus(r.status)}</span>
        <p>${r.note}</p>
      </button>
    `
    )
    .join("");

  document.querySelectorAll(".room-cell").forEach((btn) => {
    btn.addEventListener("click", () => {
      const room = roomData.find((r) => r.code === btn.dataset.room);
      if (!room) return;
      renderRoomDetail(room);
    });
  });
}

function renderKanban() {
  const byStage = stageOrder.map((stage) => ({ stage, rows: tickets.filter((t) => t.stage === stage) }));
  qs("#kanbanView").innerHTML = byStage
    .map(
      (group) => `
      <div class="col">
        <h4>${group.stage}</h4>
        ${group.rows
          .map(
            (t) => `
              <div class="ticket">
                <strong>${t.id} - ${t.customer}</strong>
                <span>Owner: ${t.owner}</span>
                <span>SLA: ${t.sla}</span>
                <span>${t.status}</span>
              </div>
            `
          )
          .join("")}
      </div>
    `
    )
    .join("");
}

function renderList() {
  qs("#taskTable").innerHTML = tickets
    .map(
      (t) => `
      <tr>
        <td>${t.id}</td>
        <td>${t.customer}</td>
        <td>${t.stage}</td>
        <td>${t.owner}</td>
        <td>${t.sla}</td>
        <td>${t.status}</td>
      </tr>
    `
    )
    .join("");
}

function renderFlows() {
  qs("#flowSteps").innerHTML = flowSteps
    .map(
      (step, index) => `
      <div class="flow-step">
        <h4>Step ${index + 1}: ${step.title}</h4>
        <p>${step.detail}</p>
      </div>
    `
    )
    .join("");
}

function setActiveRole(role) {
  activeRole = role;
  document.querySelectorAll(".role-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.role === role);
  });
  renderRoleData();
}

function setActiveScreen(screenId) {
  activeScreen = screenId;
  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.screen === screenId);
  });
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("active", screen.id === screenId);
  });

  const titleMap = {
    overview: "Tong quan san pham",
    sitemap: "Cau truc Menu / Sitemap",
    dashboards: "Dashboard theo phan quyen",
    roommap: "Quan ly trang thai phong",
    tasks: "Task/Ticket based operations",
    flows: "User flow chi tiet"
  };
  qs("#screenTitle").textContent = titleMap[screenId];
}

function bindEvents() {
  document.querySelectorAll(".role-btn").forEach((btn) => {
    btn.addEventListener("click", () => setActiveRole(btn.dataset.role));
  });

  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.addEventListener("click", () => setActiveScreen(btn.dataset.screen));
  });

  qs("#nextScreen").addEventListener("click", () => {
    const idx = screenOrder.indexOf(activeScreen);
    const next = screenOrder[(idx + 1) % screenOrder.length];
    setActiveScreen(next);
  });

  qs("#viewKanban").addEventListener("click", () => {
    qs("#viewKanban").classList.add("active");
    qs("#viewList").classList.remove("active");
    qs("#kanbanView").classList.remove("hidden");
    qs("#listView").classList.add("hidden");
  });

  qs("#viewList").addEventListener("click", () => {
    qs("#viewList").classList.add("active");
    qs("#viewKanban").classList.remove("active");
    qs("#listView").classList.remove("hidden");
    qs("#kanbanView").classList.add("hidden");
  });
}

function init() {
  renderRoleData();
  renderGlobalStatus();
  renderRoomGrid();
  renderKanban();
  renderList();
  renderFlows();
  bindEvents();
}

init();
