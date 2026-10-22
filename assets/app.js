"use strict";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const normalize = (v) =>
  String(v || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const money = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(v) || 0,
  );
const day = (v) =>
  v
    ? new Date(String(v).slice(0, 10) + "T12:00:00").toLocaleDateString(
        "es-SV",
        { day: "2-digit", month: "short", year: "numeric" },
      )
    : "—";
const paths = {
  cap: '<path d="m2 9 10-5 10 5-10 5zM6 11v6q6 5 12 0v-6M22 9v7"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  wallet:
    '<path d="M20 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0-3 3v13a2 2 0 0 0 2 2h16V8H5a2 2 0 0 1 0-4"/><path d="M16 12h6v5h-6z"/>',
  bag: '<path d="M5 7h14l2 14H3zM8 7V5a4 4 0 0 1 8 0v2"/>',
  receipt:
    '<path d="M5 2 8 4l4-2 4 2 3-2v20l-3-2-4 2-4-2-3 2zM9 8h6M9 12h6M9 16h4"/>',
  settings:
    '<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  up: '<path d="M7 17 17 7M7 7h10v10"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  shield: '<path d="m12 3 8 3v6c0 5-5 8-8 9-3-1-8-4-8-9V6zM8 12l3 3 5-6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 4 3c-1 0-1 1-1 2M12 17h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/>',
  x: '<path d="m6 6 12 12M6 18 18 6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5"/>',
  bank: '<path d="m3 8 9-5 9 5zM3 21h18M5 10v8M10 10v8M14 10v8M19 10v8"/>',
  card: '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 9h20M6 15h3"/>',
  package:
    '<path d="m3 7 9-4 9 4v11l-9 4-9-4zM3 7l9 5 9-5M12 12v10M7 5l10 5"/>',
  book: '<path d="M12 6Q7 2 2 5v15q5-3 10 0 5-3 10 0V5q-5-3-10 1zM12 6v14"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 11h18"/>',
  search: '<circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/>',
  users:
    '<circle cx="9" cy="8" r="4"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M17 4a4 4 0 0 1 0 8M22 21v-3a7 7 0 0 0-4-6"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="m15 4 5 5L8 21H3v-5zM13 6l5 5"/>',
  logout: '<path d="M9 3H3v18h6M9 12h12m-5-5 5 5-5 5"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  file: '<path d="M14 2H4v20h16V8zM14 2v6h6M8 13h8M8 17h6"/>',
};
function icon(name, size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.file}</svg>`;
}
const roleNames = {
  administrador: "Administrador",
  colecturia: "Colecturía",
  coordinacion: "Coordinación",
  cliente: "Cliente",
};
let S = {
  user: null,
  loginMode: "cliente",
  csrf: null,
  data: null,
  view: "home",
  studentId: null,
  year: 2026,
  q: "",
  reportNie: "",
  reportQuery: "",
  deliveryStatus: "Todos",


  status: "Todos",
  category: "Todos",
  adminTab: "Resumen",
  from: "2026-01-01",
  to: "2026-12-31",
  modal: null,
};
let busy = false,
  toastTimer,
  previousFocus;
const isStaff = () =>
  ["administrador", "colecturia", "coordinacion"].includes(S.user?.rol);
const canCollect = () => ["administrador", "colecturia"].includes(S.user?.rol);
const current = () =>
  S.data?.students.find((s) => s.id === Number(S.studentId));
const initials = (name) =>
  String(name || "INFRAMEN")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
const myOps = () =>
  S.data.operations.filter(
    (o) => o.estudiante_id === Number(S.studentId) && o.anio === Number(S.year),
  );
async function api(url, options = {}) { return demoApi(url, options); }
async function load() {
  S.data = await api("workspace");
  const years = [
    ...new Set([
      ...S.data.students.map((s) => s.anio)
    ]),
  ];
  if (years.length && !years.includes(Number(S.year)))
    S.year = Math.max(...years);
  const eligible = S.data.students.filter((s) => s.anio === Number(S.year));
  if (!eligible.some((s) => s.id === Number(S.studentId)))
    S.studentId = eligible[0]?.id || null;
}
async function mutate(url, method, body, message) {
  if (busy) return null;
  busy = true;
  $$('button[type="submit"], .modal .primary').forEach(
    (b) => (b.disabled = true),
  );
  try {
    const result = await api(url, { method, body });
    await load();
    closeModal(true);
    render();
    if (message)
      toast(typeof message === "function" ? message(result) : message);
    return result;
  } catch (e) {
    toast(e.message, true);
    return null;
  } finally {
    busy = false;
    $$('button[type="submit"], .modal .primary').forEach(
      (b) => (b.disabled = false),
    );
  }
}
function toast(message, error = false) {
  clearTimeout(toastTimer);
  $("#toast-root").innerHTML =
    `<div class="toast ${error ? "error" : ""}" role="status">${icon(error ? "help" : "checkCircle")}<span>${esc(message)}</span><button data-action="dismiss-toast" aria-label="Cerrar aviso">${icon("x", 16)}</button></div>`;
  toastTimer = setTimeout(() => ($("#toast-root").innerHTML = ""), 6500);
}
function setView(view) {
  S.view = view;
  S.q = "";
  S.status = "Todos";
  S.category = "Todos";
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function renderLogin(register = false, mode = S.loginMode) {
  S.loginMode = register ? "cliente" : mode;
  const personal = !register && S.loginMode === "personal";
  $("#app").innerHTML =
    `<div class="auth-shell"><section class="auth-brand-panel"><a class="brand" href="./"><img class="institution-logo" src="assets/photos/logo-inframen.png" alt="Escudo INFRAMEN"><span>INFRAMEN<small>Portal de pagos escolares</small></span></a><div class="auth-story"><span class="hero-chip">${icon("shield", 14)} TU INSTITUTO, MÁS CERCA</span><h1>Tu vida escolar.<br>Más simple.</h1><p>Menos filas y más tiempo para lo que importa.<br>Tus pagos y compras escolares, en un solo lugar.</p><div class="auth-illustration"><div class="auth-float">${icon("checkCircle", 25)}<div>Todo en orden<small>Claridad en cada paso</small></div></div><img src="assets/gown.svg" alt="Ilustración de toga de graduación"><div class="auth-float last">${icon("receipt", 24)}<div>Comprobantes digitales<small>Siempre a tu alcance</small></div></div></div><div class="auth-benefits"><span>${icon("shield", 16)} Acceso seguro</span><span>${icon("wallet", 16)} Pagos de prueba</span></div></div><p class="auth-institute">INSTITUTO NACIONAL GENERAL FRANCISCO MENÉNDEZ</p></section><section class="auth-form-panel"><div class="auth-form-wrap"><span class="eyebrow">BIENVENIDO A TU PORTAL ESTUDIANTIL</span><h2>${register ? "Crea tu cuenta" : "Qué bueno verte de nuevo"}</h2><p>${register ? "Crea tu cuenta con tu nombre, correo y NIE." : personal ? "Ingresa con tu usuario institucional y contraseña." : "Ingresa con tu NIE y contraseña."}</p>${!register ? `<div class="login-access-tabs"><button type="button" class="${!personal ? "selected" : ""}" data-action="login-mode" data-mode="cliente">Estudiantes</button><button type="button" class="${personal ? "selected" : ""}" data-action="login-mode" data-mode="personal">Personal</button></div>` : ""}<form id="${register ? "register-form" : "login-form"}" class="form-grid">${register ? `<label>Nombre completo<input name="nombre" autocomplete="name" minlength="3" maxlength="120" required placeholder="Tu nombre y apellidos"></label>` : ""}${register ? '<label>Correo electrónico<input type="email" name="correo" autocomplete="email" maxlength="150" required placeholder="tu.correo@ejemplo.com"></label>' : personal ? '<label>Usuario del personal<input name="username" autocomplete="username" required minlength="3" maxlength="60" placeholder="Ej. admin"></label>' : '<label>NIE<input name="nie" inputmode="numeric" autocomplete="username" pattern="[0-9]{7}" maxlength="7" minlength="7" required placeholder="Tu NIE de 7 dígitos"></label>'}<label>Contraseña<input type="password" name="password" autocomplete="${register ? "new-password" : "current-password"}" minlength="${register ? 8 : 1}" maxlength="128" required placeholder="${register ? "8 caracteres, mayúscula, minúscula y número" : "Tu contraseña"}"></label>${register ? '<label>NIE del estudiante<input name="nie" inputmode="numeric" pattern="[0-9]{7}" required maxlength="7" placeholder="NIE de 7 dígitos"></label>' : ""}<p class="form-error" id="auth-error" role="alert"></p><button type="submit" class="primary full">${register ? "Crear mi cuenta" : "Ingresar a mi espacio"} ${icon("arrow", 17)}</button></form><p class="auth-switch">${register ? "¿Ya tienes una cuenta?" : "¿Primera vez por aquí?"} <button data-action="${register ? "login-view" : "register-view"}">${register ? "Inicia sesión" : "Crea tu cuenta"}</button></p>${
      !register
        ? `<details class="demo-accounts" open><summary>${icon("users", 16)} Explorar con una cuenta de prueba ${icon("chevron", 14)}</summary><p>Clientes: <code>Cliente123</code><br>Administrador: <code>Campus2026!</code></p><div class="demo-account-grid">${[
            ...(personal
              ? [
                  ["admin", "Administrador", "Campus2026!"],
                  ["colecturia", "Colecturía", "Campus2026!"],
                  ["coordinacion", "Coordinación", "Campus2026!"],
                ]
              : Array.from({ length: 7 }, (_, i) => [
                  `900000${i + 1}`,
                  `NIE 900000${i + 1}`,
                  "Cliente123",
                ])),
          ]
            .map(
              ([identifier, label, password]) =>
                `<button type="button" data-action="fill-account" data-identifier="${identifier}" data-password="${password}">${label}${icon("arrow", 13)}</button>`,
            )
            .join("")}</div></details>`
        : ""
    }<div class="auth-note">${icon("shield", 17)}<p>Demostración sin base de datos · No se guarda información.<br>Usa las cuentas de prueba de arriba. Todos los datos son ficticios.</p></div></div><div class="auth-copyright">INFRAMEN © 2026</div></section></div>`;
}
function render() {
  if (!S.user) return renderLogin();
  if (!S.data) return;
  if (isStaff()) S.view = "admin";
  else if (S.view === "admin") S.view = "home";
  const u = S.user,
    c = current(),
    eligible = S.data.students.filter((s) => s.anio === Number(S.year)),
    years = [
      ...new Set([
        ...S.data.students.map((s) => s.anio)
      ]),
    ].sort((a, b) => b - a),
    ops = myOps(),
    pending = ops.filter(
      (o) => o.tipo === "OBLIGATORIO" && o.estado === "Pendiente",
    );
  const nav = isStaff()
    ? []
    : [
        ["home", "Resumen", "grid"],
        ["cobros", "Consultar cobros", "wallet"],
        ["catalog", "Catálogo opcional", "bag"],
        ["orders", "Mis compras", "package"],
        ["receipts", "Comprobantes", "receipt"],
      ];
  const label =
    S.view === "admin"
      ? "Administración"
      : nav.find((n) => n[0] === S.view)?.[1] || "Resumen";
  $("#app").innerHTML =
    `<div class="app-shell"><aside class="sidebar"><a href="./" class="brand" data-action="view" data-view="home"><img class="institution-logo" src="assets/photos/logo-inframen.png" alt="Escudo INFRAMEN"><span>INFRAMEN<small>Pagos escolares</small></span></a><div class="school-label">INSTITUTO NACIONAL<br><b>GENERAL FRANCISCO MENÉNDEZ</b></div><div class="workspace"><div class="mini-crest">${icon("cap", 22)}</div><div><strong>${isStaff() ? "Portal institucional" : "Portal estudiantil"}</strong><small>${esc(roleNames[u.rol])} · ${S.year}</small></div>${icon("chevron", 15)}</div>${!isStaff() ? '<div class="nav-label">MI ESPACIO</div>' : ""}<nav>${nav.map(([id, name, ico]) => `<button class="${S.view === id ? "active" : ""}" data-action="view" data-view="${id}">${icon(ico, 19)}${name}${id === "cobros" && pending.length ? `<span class="count">${pending.length}</span>` : ""}</button>`).join("")}</nav>${isStaff() ? `<div class="nav-label admin-label">INSTITUCIÓN</div><nav><button class="${S.view === "admin" ? "active" : ""}" data-action="view" data-view="admin">${icon("settings", 19)}Administración</button></nav>` : ""}<div class="sidebar-bottom"><div class="support-card"><div class="support-icon">${icon("help", 21)}</div><strong>¿Necesitas una mano?</strong><p>Estamos aquí para ayudarte.</p><button data-action="help">Centro de ayuda ${icon("up", 14)}</button></div><div class="sidebar-footer">${icon("shield", 14)} Tu información, protegida</div></div></aside><div class="main-shell"><header class="topbar"><button class="icon-btn mobile-menu" data-action="menu" aria-label="Abrir menú">${icon("menu", 22)}</button><div class="breadcrumb">Mi espacio <span>/</span> <b>${label}</b></div><div class="top-actions"><label class="year">${icon("calendar", 15)}<select id="year-select" aria-label="Año lectivo">${(years.length ? years : [2026]).map((y) => `<option value="${y}" ${y === Number(S.year) ? "selected" : ""}>Año lectivo ${y}</option>`).join("")}</select></label>${!isStaff() ? `<button class="notification icon-btn" data-action="notifications" aria-label="Ver notificaciones">${icon("bell", 19)}${pending.length ? "<i></i>" : ""}</button>` : ""}<span class="top-divider"></span><button class="profile" data-action="profile"><span class="avatar">${initials(u.nombre)}</span><div><strong>${esc(u.nombre.split(" ").slice(0, 2).join(" "))}</strong><small>${roleNames[u.rol]}</small></div>${icon("chevron", 14)}</button></div></header><main><div class="page-heading"><div><div class="eyebrow">TU PORTAL ESCOLAR, TODO EN UN LUGAR</div><h1>${S.view === "home" ? `Hola, ${esc((c?.nombre || u.nombre).split(" ")[0])} <span class="wave">✳</span>` : S.view === "admin" ? "Control institucional" : label}</h1><p>${{ home: "Un vistazo a tus pagos, compras y próximos pasos.", cobros: "Consulta tus pagos obligatorios y mantén tus pagos al día.", catalog: "Elige lo que necesitas. Todas las compras son voluntarias.", orders: "Tus artículos elegidos y el estado de cada pedido.", receipts: "Tus pagos confirmados, organizados y siempre a mano.", admin: "Controla las operaciones de tu instituto, con claridad." }[S.view]}</p></div>${!isStaff() ? `<label class="student-select"><span class="avatar mini">${initials(c?.nombre)}</span><div><small>ESTUDIANTE SELECCIONADO</small><select id="student-select" aria-label="Seleccionar estudiante">${eligible.length ? eligible.map((s) => `<option value="${s.id}" ${s.id === Number(S.studentId) ? "selected" : ""}>${esc(s.nombre)}</option>`).join("") : "<option>Sin expediente disponible</option>"}</select></div></label>` : `<div class="institution-summary">${icon("users", 22)}<strong>${eligible.length}</strong><span>estudiantes · ${S.year}</span></div>`}</div><div class="demo-notice"><span><span class="pulse"></span> MODO DEMOSTRACIÓN</span> Sin base de datos · No se guarda información · Año ${S.year}</div><div id="view-content">${renderView()}</div><footer><div><span class="footer-logo">${icon("cap", 18)} INFRAMEN</span><span>Una forma más simple de vivir tu instituto.</span></div><span>INFRAMEN © ${S.year} <span class="footer-dot">·</span><button data-action="help">Ayuda y soporte</button></span></footer></main></div></div>`;
  if (
    S.q &&
    S.view === "admin" &&
    ["Catálogo", "Usuarios", "Actividad"].includes(S.adminTab)
  )
    updateResults();
  if (S.view === "admin" && S.adminTab === "Cobros") updateChargeScope();
}
function stat(iconName, color, label, value, sub, view) {
  return `<article><span class="stat-icon ${color}">${icon(iconName, 21)}</span><div><span>${label}</span><strong>${value}</strong><small>${sub}</small></div>${view ? `<button data-action="view" data-view="${view}" aria-label="Ver ${label}">${icon("up")}</button>` : ""}</article>`;
}
function section(title, description, label, view) {
  return `<div class="section-heading"><div><h2>${title}</h2><p>${description}</p></div>${label ? `<button class="text-button" data-action="view" data-view="${view}">${label} ${icon("arrow", 15)}</button>` : ""}</div>`;
}
function renderView() {
  const ops = myOps(),
    pending = ops.filter(
      (o) => o.tipo === "OBLIGATORIO" && o.estado === "Pendiente",
    ),
    paid = ops.filter((o) => o.estado === "Pagado"),
    orders = ops.filter((o) => o.tipo === "COMPRA");
  if (S.view === "home") {
    const o = pending[0];
    return `<section class="hero"><div class="hero-content"><span class="hero-chip">${icon("shield", 13)} MÁS FÁCIL. MÁS CERCA.</span><h2>Menos filas.<br>Más tiempo para ti.</h2><p>Tus pagos escolares sin complicaciones.<br>Gestiona todo desde donde estés.</p><button class="white-button" data-action="view" data-view="cobros">Consultar mis cobros ${icon("arrow", 16)}</button></div><div class="hero-art"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="floating-chip chip-one">${icon("checkCircle", 20)}<span>¡Todo en orden!<small>Tu tranquilidad, primero</small></span></div><div class="illustrated-card"><div class="illus-logo"><img src="assets/photos/logo-inframen.png" alt="" class="small-logo"> INFRAMEN</div><div class="card-line"></div><div class="card-line short"></div><div class="payment-circle">${icon("check", 38)}</div><span>Pago confirmado</span><strong>$5.00 <small>USD</small></strong><div class="card-bottom"><span>PAGO INSTITUCIONAL</span>${icon("shield", 13)}</div></div><div class="floating-chip chip-two">${icon("receipt", 22)}<span>Comprobantes digitales<small>Siempre a tu alcance</small></span></div><div class="spark spark-one">✦</div><div class="spark spark-two">✧</div></div></section><section class="stats">${stat("wallet", "orange", "Pagos obligatorios pendientes", money(pending.reduce((a, o) => a + o.importe, 0)), pending.length ? pending.length + " cobro(s) por completar" : "Estás al día con tus aportes", "cobros")}${stat("bag", "blue", "Mis compras", String(orders.filter((o) => o.estado !== "Cancelado").length).padStart(2, "0"), "Artículos elegidos por ti", "orders")}${stat("receipt", "green", "Comprobantes", String(paid.length).padStart(2, "0"), "Disponibles para descargar", "receipts")}</section>${section("Un pendiente, un paso más cerca", "Mantén tus aportes escolares al día.", "Ver todos los cobros", "cobros")}<div class="pase-banner"><span class="pase-icon">${icon("book", 26)}</span><div class="pase-description"><span class="eyebrow">APORTE INSTITUCIONAL</span><h3>${esc(o?.nombre_concepto || "Tus aportes están al día")}</h3><p>${o ? "Fecha límite: " + day(o.fecha_limite) : "Consulta tu historial de aportes cuando lo necesites."}</p></div>${o ? `${badge(o)}<strong>${money(o.importe)}<small>USD</small></strong>${!isStaff() ? `<button class="primary" data-action="pay" data-id="${o.id}">Realizar pago ${icon("arrow", 15)}</button>` : ""}` : ""}</div>${section('Hecho para tu vida escolar <span class="optional-label">OPCIONAL</span>', "Artículos institucionales que puedes elegir a tu manera.", "Explorar catálogo", "catalog")}${products(3)}<div class="info-line">${icon("shield", 16)}<p>Tu elección cuenta. Los artículos del catálogo son opcionales y no generan deudas escolares.</p></div>${section("Tus últimos movimientos", "Todo claro, todo a la mano.", "Ver historial", "receipts")}<section class="panel">${table([...ops].sort((a, b) => String(b.creado_en).localeCompare(a.creado_en)).slice(0, 3))}</section>`;
  }
  if (S.view === "cobros")
    return `<div class="info-box">${icon("book", 22)}<div><strong>Pagos obligatorios</strong><p>Aquí solo aparecen los pagos obligatorios. Las compras voluntarias se consultan por separado en Mis compras. Los importes oficiales deben definirse con la institución.</p></div></div><div class="summary-strip"><div><small>SALDO pago obligatorio PENDIENTE</small><strong>${money(ops.filter((o) => o.tipo === "OBLIGATORIO" && ["Pendiente", "En revisión"].includes(o.estado)).reduce((a, o) => a + o.importe, 0))}</strong></div>${icon("shield", 36)}</div><section class="panel"><div class="panel-toolbar"><h3>Historial de aportes</h3>${statusSelect()}</div><div id="results">${table(filteredOperations())}</div></section>`;
  if (S.view === "catalog")
    return `<div class="catalog-toolbar"><div class="tabs">${["Todos", "Uniformes", "Graduación", "Distintivos", "Trámites", "Accesorios", "Banda escolar"].map((c) => `<button class="${S.category === c ? "selected" : ""}" data-action="category" data-category="${c}">${c}</button>`).join("")}</div>${search("Buscar un artículo…")}</div><div id="results">${products()}</div><div class="info-line">${icon("shield", 18)}<p>Las compras son voluntarias. Los uniformes proporcionados por el Gobierno no están a la venta en este catálogo.</p></div>`;
  if (S.view === "orders" || S.view === "receipts")
    return `<section class="panel"><div class="panel-toolbar">${S.view === "receipts" ? `<h3>${paid.length} comprobantes disponibles</h3>` : statusSelect()}${search(S.view === "orders" ? "Buscar mis compras…" : "Buscar por folio o concepto…")}</div><div id="results">${table(filteredOperations())}</div></section>`;
  if (S.view === "admin" && isStaff()) return renderAdmin();
  return empty("Sin acceso", "Tu cuenta no tiene permisos para esta vista.");
}
function statusSelect() {
  return `<select id="status-filter" aria-label="Filtrar por estado">${["Todos", "Pendiente", "En revisión", "Pagado", "Cancelado"].map((s) => `<option ${s === S.status ? "selected" : ""}>${s}</option>`).join("")}</select>`;
}
function search(placeholder) {
  return `<label class="search">${icon("search", 17)}<input id="search-input" placeholder="${placeholder}" value="${esc(S.q)}" aria-label="Buscar"></label>`;
}
function empty(
  title = "No hay movimientos aquí",
  description = "Los registros aparecerán cuando realices una operación.",
) {
  return `<div class="empty">${icon("receipt", 28)}<h3>${esc(title)}</h3><p>${esc(description)}</p></div>`;
}
const specialties = [
  "General",
  "Salud",
  "Hostelería y Turismo",
  "Desarrollo de Software",
  "Comercio",
];
function productVisual(p) {
  if (p.arte === "fisica")
    return '<div class="uniform-pair"><img src="assets/photos/camisa-fisica.jpg" alt="Camisa de educación física"><img src="assets/photos/pantalon-fisica.jpg" alt="Pantalón de educación física"></div>';
  if (p.arte === "salud" || p.arte === "turismo")
    return `<img class="product-art actual-uniform" src="assets/photos/uniforme-${p.arte}.png" alt="${esc(p.nombre)}">`;
  if (p.arte === "pin")
    return '<div class="pin-display"><img class="pins-photo" src="assets/photos/pines.jpg" alt="Pines institucionales de los distintos bachilleratos"></div>';
  if (p.arte === "mug")
    return `<div class="mug-display"><div class="mug-body"><img src="assets/photos/logo-inframen.png" alt="Escudo INFRAMEN"></div><div class="mug-handle"></div></div>`;
  if (p.arte === "card")
    return `<div class="id-card-display"><img src="assets/photos/logo-inframen.png" alt="Escudo INFRAMEN"><div><b>INFRAMEN</b><span>CARNET ESTUDIANTIL</span><i></i><i></i></div></div>`;
  return `<img class="product-art" src="assets/${["shirt", "gown", "plaque"].includes(p.arte) ? p.arte : "plaque"}.svg" alt="${esc(p.nombre)}">`;
}
function products(limit) {
  const list = S.data.catalog
    .filter(
      (p) =>
        p.activo &&
        p.tipo === "COMPRA" &&
        (S.category === "Todos" || p.categoria === S.category) &&
        p.nombre.toLowerCase().includes(S.q.toLowerCase()),
    )
    .slice(0, limit);
  return list.length
    ? `<div class="products">${list.map((p) => `<article class="product"><button class="product-image ${esc(p.arte)}" data-action="buy" data-id="${p.id}" aria-label="Ver ${esc(p.nombre)}"><span class="product-tag">${esc(p.categoria)}</span>${productVisual(p)}<span class="product-circle">${icon("up")}</span></button><div class="product-info"><h3>${esc(p.nombre)}</h3><p>${p.requiere_especialidad ? "Elige tu bachillerato" : p.requiere_talla ? "Tallas XS a XXL disponibles" : p.arte === "card" ? "Solicita una nueva impresión" : "Artículo institucional opcional"}</p><div><strong>${money(p.precio)} <small>USD</small></strong><button data-action="buy" data-id="${p.id}">Ver artículo ${icon("arrow", 14)}</button></div></div></article>`).join("")}</div>`
    : empty("No encontramos artículos", "Prueba con otro nombre o categoría.");
}
function folioUI(folio) {
  return folio
    ? `<span class="folio-control"><code>${esc(folio)}</code><button type="button" class="copy-folio" data-action="copy-folio" data-folio="${esc(folio)}" aria-label="Copiar folio ${esc(folio)}" title="Copiar folio">${icon("copy", 14)}<span>Copiar</span></button></span>`
    : "";
}
async function copyFolio(folio) {
  try {
    if (!navigator.clipboard?.writeText) throw Error();
    await navigator.clipboard.writeText(folio);
  } catch {
    const field = document.createElement("textarea");
    field.value = folio;
    field.className = "clipboard-helper";
    field.setAttribute("readonly", "");
    document.body.append(field);
    field.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } finally {
      field.remove();
    }
    if (!copied) {
      openModal(
        `<h2 id="dialog-title">Copia tu folio</h2><p>Selecciona el texto y presiona Ctrl + C.</p><input class="manual-folio" readonly value="${esc(folio)}" aria-label="Folio para copiar">`,
      );
      return;
    }
  }
  toast("Folio copiado.");
}
function userStudentText(u) {
  return String(u.estudiante_ids || "")
    .split(",")
    .map((id) => S.data.students.find((s) => s.id === Number(id)))
    .filter(Boolean)
    .map((s) => `${s.nombre} · NIE ${s.nie}`)
    .join(" · ");
}
function adminMatches(values) {
  return normalize(values.join(" ")).includes(normalize(S.q).trim());
}
function badge(o) {
  const cls = {
    Pagado: "green",
    "En revisión": "blue",
    Cancelado: "gray",
    Pendiente: "amber",
  }[o.estado];
  return `<span class="badge ${cls}">${icon(o.estado === "Pagado" ? "checkCircle" : "clock", 12)} ${esc(o.estado)}</span>`;
}
function filteredOperations() {
  let ops =
    S.view === "admin"
      ? S.data.operations.filter((o) => o.anio === Number(S.year))
      : myOps();
  if (S.view === "cobros") ops = ops.filter((o) => o.tipo === "OBLIGATORIO");
  if (S.view === "orders") ops = ops.filter((o) => o.tipo === "COMPRA");
  if (S.view === "receipts") ops = ops.filter((o) => o.estado === "Pagado");
  if (S.view === "admin" && S.adminTab === "Transferencias")
    ops = ops.filter((o) => o.estado === "En revisión");
  if (S.view === "admin" && S.adminTab === "Entregas")
    ops = ops.filter(
      (o) =>
        o.tipo === "COMPRA" &&
        o.estado === "Pagado" &&
        (S.deliveryStatus === "Todos" ||
          (S.deliveryStatus === "Entregado"
            ? !!o.entregado_en
            : !o.entregado_en)),
    );
  if (S.view === "admin" && S.adminTab === "Reportes") ops = reportRows();
  return ops.filter(
    (o) =>
      (S.status === "Todos" || o.estado === S.status) &&
      [o.nombre_concepto, o.estudiante, o.folio, o.nie]
        .join(" ")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .includes(normalize(S.q)),
  );
}
function table(ops, admin = false) {
  return `<div class="table-wrap"><table><thead><tr><th>CONCEPTO / DETALLE</th>${admin ? "<th>ESTUDIANTE</th>" : ""}<th>FECHA</th><th>MONTO</th><th>ESTADO</th><th></th></tr></thead><tbody>${ops.map((o) => `<tr><td><div class="cell-title"><span class="table-icon ${o.tipo === "OBLIGATORIO" ? "blue" : "sand"}">${icon(o.tipo === "OBLIGATORIO" ? "book" : "bag", 18)}</span><div><strong>${esc(o.nombre_concepto)}</strong><small>${o.tipo === "OBLIGATORIO" ? "Cobro obligatorio" : o.cantidad + " artículo(s)" + (o.talla ? " · Talla " + esc(o.talla) : "")}${o.especialidad_producto ? " · " + esc(o.especialidad_producto) : ""}${o.entregado_en ? " · Entregado" : ""}</small>${o.folio ? folioUI(o.folio) : ""}${o.pago_estado === "Rechazado" ? `<small class="rejection">Transferencia rechazada: ${esc(o.motivo)}</small>` : ""}</div></div></td>${admin ? `<td>${esc(o.estudiante)}<small>NIE ${esc(o.nie)}</small></td>` : ""}<td>${day(o.confirmado_en || o.creado_en)}</td><td class="amount">${money(o.importe)}</td><td>${badge(o)}</td><td><div class="row-actions">${admin && S.adminTab === "Entregas" && o.folio ? `<button class="text-button" data-action="lookup-delivery" data-folio="${esc(o.folio)}">${o.entregado_en ? "Ver entrega" : "Registrar entrega"}</button>` : ""}${o.carnet_nombre ? `<button class="text-button" data-action="card-request" data-id="${o.id}">Datos de carnet</button>` : ""}${o.estado === "Pagado" ? `<button class="text-button" data-action="receipt" data-id="${o.id}">Ver recibo ${icon("up", 14)}</button>` : o.estado === "En revisión" ? (admin && canCollect() ? `<button class="text-button" data-action="review" data-id="${o.id}">Revisar ${icon("arrow", 14)}</button>` : '<span class="muted">En validación</span>') : o.estado === "Pendiente" ? `${!isStaff() ? `<button class="text-button" data-action="pay" data-id="${o.id}">Pagar ${icon("arrow", 14)}</button>` : ""}${o.tipo === "COMPRA" && S.user.rol === "cliente" ? `<button class="icon-btn" data-action="cancel" data-id="${o.id}" aria-label="Cancelar pedido">${icon("x", 14)}</button>` : ""}` : ""}</div></td></tr>`).join("")}</tbody></table>${!ops.length ? empty() : ""}</div>`;
}
function reportRows() {
  return S.data.operations.filter(
    (o) =>
      o.anio === Number(S.year) &&
      o.estado === "Pagado" &&
      (!S.reportNie || o.nie === S.reportNie) &&
      (!S.reportQuery ||
        normalize(
          [o.folio, o.estudiante, o.nie, o.nombre_concepto].join(
            " ",
          ),
        ).includes(normalize(S.reportQuery))) &&
      String(o.confirmado_en).slice(0, 10) >= S.from &&
      String(o.confirmado_en).slice(0, 10) <= S.to,
  );
}
function renderAdmin() {
  const admin = S.user.rol === "administrador",
    tabs = [
      "Resumen",
      ...(canCollect() ? ["Transferencias", "Reportes"] : []),
      "Entregas",
      ...(admin
        ? [
            "Catálogo",
            "Cobros",
            "Estudiantes",
            "Usuarios",
            "Actividad",
          ]
        : []),
    ];
  if (!tabs.includes(S.adminTab)) S.adminTab = "Resumen";
  let html = `<div class="admin-access-note">${icon("shield", 16)} Acceso institucional: <strong>${roleNames[S.user.rol]}</strong><span>Gestión de pagos y atención estudiantil.</span></div><div class="tabs admin-tabs">${tabs.map((t) => `<button class="${S.adminTab === t ? "selected" : ""}" data-action="admin-tab" data-tab="${t}">${t}${t === "Transferencias" && S.data.operations.some((o) => o.estado === "En revisión") ? " •" : ""}</button>`).join("")}</div>`;
  if (S.adminTab === "Resumen") {
    const ops = S.data.operations.filter((o) => o.anio === Number(S.year));
    html += `<section class="stats">${stat("book", "blue", "Cobros obligatorios", money(ops.filter((o) => o.tipo === "OBLIGATORIO" && o.estado === "Pagado").reduce((a, o) => a + o.importe, 0)), "Solo pagos confirmados")}${stat("bag", "green", "Ventas opcionales", money(ops.filter((o) => o.tipo === "COMPRA" && o.estado === "Pagado").reduce((a, o) => a + o.importe, 0)), "Compras elegidas por el estudiante")}${stat("bank", "orange", "Por revisar", ops.filter((o) => o.estado === "En revisión").length, "Transferencias de prueba")}</section><section class="panel"><div class="panel-toolbar"><h3>Movimientos institucionales</h3>${search("Buscar concepto, NIE o nombre…")}</div><div id="results">${table(filteredOperations(), true)}</div></section>`;
  }
  if (S.adminTab === "Transferencias")
    html += `<section class="panel"><div class="panel-toolbar"><h3>Conciliación de transferencias</h3>${search("Buscar estudiante o concepto…")}</div><div id="results">${table(filteredOperations(), true)}</div></section>`;
  if (S.adminTab === "Entregas")
    html += `<section class="panel delivery-panel"><span class="stat-icon blue">${icon("package", 25)}</span><h2>Una entrega, un comprobante</h2><p>Ingresa el folio de una compra confirmada. El sistema impide entregar el mismo artículo dos veces.</p><form id="delivery-search" class="folio-search"><input name="folio" required maxlength="40" aria-label="Folio del comprobante" placeholder="CMP-XXXXXXXX"><button class="primary" type="submit">Buscar folio ${icon("search", 17)}</button></form><div id="delivery-result"></div></section><section class="panel"><div class="panel-toolbar"><h3>Compras para entrega · ${S.year}</h3>${search("Buscar NIE, nombre, folio o artículo…")}<select id="delivery-status" aria-label="Estado de entrega">${["Todos", "Pendiente de entrega", "Entregado"].map((status) => `<option ${S.deliveryStatus === status ? "selected" : ""}>${status}</option>`).join("")}</select></div><div id="results">${table(filteredOperations(), true)}</div></section>`;
  if (S.adminTab === "Catálogo")
    html += `<section class="panel"><div class="panel-toolbar"><h3>Conceptos y artículos</h3>${search("Buscar producto, categoría o estado…")}<button class="primary" data-action="new-concept">${icon("plus", 16)} Nuevo concepto</button></div><div class="table-wrap"><table><thead><tr><th>CONCEPTO</th><th>TIPO</th><th>PRECIO</th><th>ESTADO</th><th></th></tr></thead><tbody>${S.data.catalog.map((p) => `<tr data-admin-row data-search="${esc([p.nombre, p.categoria, p.tipo === "OBLIGATORIO" ? "obligatorio" : "opcional", p.activo ? "activo" : "inactivo"].join(" "))}"><td><strong>${esc(p.nombre)}</strong><small>${esc(p.categoria)}</small></td><td>${p.tipo === "OBLIGATORIO" ? "Pago obligatorio" : "Compra opcional"}</td><td>${money(p.precio)}</td><td><span class="badge ${p.activo ? "green" : "gray"}">${p.activo ? "Activo" : "Inactivo"}</span></td><td><button class="text-button" data-action="edit-concept" data-id="${p.id}">${icon("edit", 14)} Editar</button><button class="text-button danger-text" data-action="delete-concept" data-id="${p.id}">Eliminar</button></td></tr>`).join("")}</tbody></table></div></section>`;
  if (S.adminTab === "Cobros") html += chargeForm();
  if (S.adminTab === "Reportes") {
    const rows = reportRows();
    html += `<form id="report-form" class="report-filters"><label>Desde<input name="from" type="date" required value="${S.from}"></label><label>Hasta<input name="to" type="date" required value="${S.to}"></label><label>Buscar nombre, folio o concepto<input name="query" maxlength="120" value="${esc(S.reportQuery)}" placeholder="Todos los movimientos"></label><label>NIE (opcional)<input name="nie" inputmode="numeric" pattern="[0-9]{7}" maxlength="7" placeholder="Todos los estudiantes" value="${esc(S.reportNie)}"></label><button class="secondary" type="submit">Aplicar filtros</button><a class="primary" href="${reportURL("xlsx")}">${icon("download", 16)} Excel</a><a class="secondary" href="${reportURL("csv")}">CSV</a><a class="secondary" href="${reportURL("pdf")}">${icon("file", 16)} PDF</a></form><div class="report-totals"><div><small>PAGOS OBLIGATORIOS</small><strong>${money(rows.filter((o) => o.tipo === "OBLIGATORIO").reduce((a, o) => a + o.importe, 0))}</strong></div><div><small>COMPRAS OPCIONALES</small><strong>${money(rows.filter((o) => o.tipo === "COMPRA").reduce((a, o) => a + o.importe, 0))}</strong></div></div><section class="panel">${table(rows, true)}</section>`;
  }
  if (S.adminTab === "Estudiantes")
    html += `<section class="panel"><div class="panel-toolbar"><h3>Control de estudiantes · ${S.year}</h3><div class="row-actions"><button class="primary" data-action="new-student">${icon("plus", 14)} Estudiante</button></div></div><div class="student-search">${search("Filtrar por NIE o nombre…")}</div><div id="results">${studentsTable()}</div></section>`;
  if (S.adminTab === "Usuarios")
    html += `<section class="panel"><div class="panel-toolbar"><h3>Usuarios y permisos</h3>${search("Buscar nombre, correo, NIE o rol…")}<button class="primary" data-action="new-user">${icon("plus", 16)} Nuevo usuario</button></div><div class="table-wrap"><table><thead><tr><th>USUARIO</th><th>ROL</th><th>ESTADO</th><th></th></tr></thead><tbody>${S.data.users.map((u) => `<tr data-admin-row data-search="${esc([u.nombre, u.correo, u.nie_acceso, u.acceso_personal, roleNames[u.rol], userStudentText(u), u.activo ? "activo" : "inactivo"].join(" "))}"><td><strong>${esc(u.nombre)}</strong><small>${esc(u.correo)}</small><small>Acceso: ${esc(u.nie_acceso || u.acceso_personal || "Pendiente de asignar NIE")}</small><small>${esc(userStudentText(u))}</small></td><td>${roleNames[u.rol]}</td><td><span class="badge ${u.activo ? "green" : "gray"}">${u.activo ? "Activo" : "Inactivo"}</span></td><td><button class="text-button" data-action="edit-user" data-id="${u.id}">${icon("edit", 14)} Editar</button></td></tr>`).join("")}</tbody></table></div></section>`;
  if (S.adminTab === "Actividad")
    html += `<section class="panel"><div class="panel-toolbar"><h3>Registro de actividad</h3>${search("Buscar usuario o acción…")}<span class="muted">Últimas 200 acciones</span></div>${S.data.activity.length ? S.data.activity.map((a) => `<div class="audit-row" data-admin-row data-search="${esc([a.accion, a.detalle, a.usuario, a.creado_en].join(" "))}">${icon("shield", 18)}<span><b>${esc(a.accion)}</b> · ${esc(a.detalle)}<small>${esc(a.usuario)} · ${esc(a.creado_en)}</small></span></div>`).join("") : empty("Todo listo para empezar", "Las acciones administrativas y los pagos se registrarán aquí.")}</section>`;
  if (
    ["Catálogo", "Usuarios", "Actividad"].includes(S.adminTab)
  )
    html +=
      '<p id="admin-search-empty" class="search-empty" hidden>No hay resultados para esta búsqueda.</p>';
  return html;
}
function studentsTable() {
  const students = S.data.students.filter(
    (s) =>
      s.anio === Number(S.year) &&
      normalize(`${s.nie} ${s.nombre} ${s.especialidad}`).includes(
        normalize(S.q).trim(),
      ),
  );
  return `<div class="table-wrap"><table><thead><tr><th>ESTUDIANTE / NIE</th><th>BACHILLERATO</th><th>PAGADO</th><th>PENDIENTE</th><th></th></tr></thead><tbody>${students
    .map((s) => {
      const ops = S.data.operations.filter((o) => o.estudiante_id === s.id),
        paid = ops
          .filter((o) => o.estado === "Pagado")
          .reduce((a, o) => a + o.importe, 0),
        pending = ops
          .filter((o) => ["Pendiente", "En revisión"].includes(o.estado))
          .reduce((a, o) => a + o.importe, 0);
      return `<tr><td><strong>${esc(s.nombre)}</strong><small>NIE ${esc(s.nie)}</small></td><td>${esc(s.especialidad)}</td><td class="amount">${money(paid)}</td><td>${money(pending)}</td><td><div class="row-actions"><button class="text-button" data-action="student-history" data-id="${s.id}">Ver pagos ${icon("arrow", 14)}</button><button class="text-button" data-action="edit-student" data-id="${s.id}">Editar</button></div></td></tr>`;
    })
    .join(
      "",
    )}</tbody></table>${students.length ? "" : empty("Sin estudiantes con ese NIE", "Prueba otro NIE o nombre.")}</div>`;
}
function studentHistory(id) {
  const s = S.data.students.find((s) => s.id === id),
    ops = S.data.operations.filter((o) => o.estudiante_id === id);
  const paid = ops.filter((o) => o.estado === "Pagado"),
    pending = ops.filter((o) =>
      ["Pendiente", "En revisión"].includes(o.estado),
    );
  openModal(
    `<span class="stat-icon blue">${icon("users", 24)}</span><h2 id="dialog-title">${esc(s.nombre)}</h2><p>NIE ${esc(s.nie)} · ${esc(s.especialidad)}</p><div class="student-payment-summary"><div><small>PAGADO · ${paid.length} pagos</small><strong>${money(paid.reduce((a, o) => a + o.importe, 0))}</strong></div><div><small>PENDIENTE / EN REVISIÓN</small><strong>${money(pending.reduce((a, o) => a + o.importe, 0))}</strong></div></div>${table(ops, true)}`,
    "history",
  );
}
function studentOptions(
  name = "studentId",
  selected = S.studentId,
  optional = false,
  yearOnly = false,
) {
  const students = S.data.students.filter(
    (s) => !yearOnly || s.anio === Number(S.year),
  );
  return `<div class="student-picker"><input type="search" data-student-filter placeholder="Buscar por NIE, nombre…" aria-label="Buscar estudiante por NIE, nombre"><select name="${name}" ${optional ? "" : "required"}>${optional ? '<option value="">Sin expediente asignado</option>' : ""}${students.map((s) => `<option value="${s.id}" ${Number(selected) === s.id ? "selected" : ""}>${esc(s.nombre)} · NIE ${esc(s.nie)} · ${s.anio}</option>`).join("")}</select><small class="picker-count">${students.length} estudiantes</small></div>`;
}
function chargeForm() {
  const students = S.data.students.filter((s) => s.anio === Number(S.year));
  return `<section class="panel charge-panel"><span class="stat-icon blue">${icon("book", 25)}</span><h2>Asignar cobros, sin ir uno por uno</h2><p>Elige los destinatarios del año ${S.year}. Los cobros ya asignados para el mismo concepto y período se omiten.</p><form id="charge-form" class="form-grid"><div class="charge-grid"><div><label>¿A quién se asignará?<select name="scope" id="charge-scope"><option value="student">Un estudiante</option><option value="selected">Varios estudiantes seleccionados</option><option value="all">Todos los estudiantes del año ${S.year}</option></select></label><div id="charge-single"><label>Estudiante${studentOptions("studentId", S.studentId, false, true)}</label></div><div id="charge-selected" hidden><label>Buscar estudiantes<input type="search" id="charge-student-search" placeholder="NIE, nombre"></label><div class="selection-toolbar"><button type="button" class="text-button" data-action="select-visible-students">Seleccionar resultados</button><button type="button" class="text-button" data-action="clear-selected-students">Limpiar selección</button></div><div class="charge-student-list">${students.map((s) => `<label class="charge-student-row" data-student-row data-search="${esc([s.nombre, s.nie, s.especialidad].join(" "))}"><input type="checkbox" name="studentIds" value="${s.id}"><span><strong>${esc(s.nombre)}</strong><small>NIE ${esc(s.nie)} · ${esc(s.especialidad)}</small></span></label>`).join("")}</div><small id="charge-selection-count">0 seleccionados</small><p id="charge-no-matches" hidden>No hay estudiantes con esa búsqueda.</p></div><div id="charge-all" class="info-box" hidden><p>Se revisarán los <strong>${students.length} estudiantes activos</strong> del año ${S.year}. Otros años no se incluyen.</p></div></div><div><label>Concepto obligatorio<select name="conceptId" required>${S.data.catalog
    .filter((p) => p.activo && p.tipo === "OBLIGATORIO")
    .map(
      (p) =>
        `<option value="${p.id}">${esc(p.nombre)} · ${money(p.precio)}</option>`,
    )
    .join(
      "",
    )}</select></label><label>Período o referencia<input name="period" required maxlength="20" value="${S.year}" placeholder="Ej. ${S.year}-11"></label><label>Fecha límite<input type="date" name="due" required value="${S.year}-11-30"></label><button class="primary full" type="submit">Revisar asignación ${icon("arrow", 17)}</button><p class="fine-print">Verás los destinatarios y el importe antes de confirmar.</p></div></div></form></section>`;
}
function updateChargeScope() {
  const scope = $("#charge-scope").value;
  for (const [key, id] of [
    ["student", "single"],
    ["selected", "selected"],
    ["all", "all"],
  ]) {
    const box = $("#charge-" + id);
    box.hidden = scope !== key;
    box
      .querySelectorAll("input,select,button")
      .forEach((el) => (el.disabled = scope !== key));
  }
}
function updateSelectionCount() {
  if ($("#charge-selection-count"))
    $("#charge-selection-count").textContent =
      $$("#charge-selected input[type=checkbox]:checked").length +
      " seleccionados";
}
function reportURL(format) {
  return (
    "api/reports?" +
    new URLSearchParams({
      format,
      from: S.from,
      to: S.to,
      year: S.year,
      nie: S.reportNie,
      q: S.reportQuery,
    })
  );
}
function openModal(content, kind = "normal") {
  previousFocus = document.activeElement;
  $("#modal-root").innerHTML =
    `<div class="modal-backdrop"><section class="modal ${kind === "receipt" ? "receipt-modal" : kind === "history" ? "history-modal" : kind === "carnet" ? "carnet-modal" : ""}" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button class="close-modal icon-btn" data-action="close-modal" aria-label="Cerrar ventana">${icon("x", 21)}</button>${content}</section></div>`;
  document.body.classList.add("has-modal");
  setTimeout(
    () =>
      $(
        '.modal input:not([type="checkbox"]), .modal select, .modal button',
      )?.focus(),
    50,
  );
}
function closeModal(force = false) {
  if (busy && !force) return;
  $("#modal-root").innerHTML = "";
  document.body.classList.remove("has-modal");
  S.modal = null;
  previousFocus?.focus();
}
function majorPicker(name, selected, required = false) {
  const major = S.data.majors.find(m => m.id === Number(selected));
  return `<label class="block-label">Bachillerato<select name="${name}" ${required ? 'required' : ''}><option value="">${required ? 'Selecciona tu bachillerato' : 'Sin especificar'}</option>${S.data.majors.filter(m => m.activo).map(m => `<option value="${name === 'majorId' ? m.id : esc(m.nombre)}" ${m.id === major?.id ? 'selected' : ''}>${esc(m.nombre)}</option>`).join('')}</select></label>`;
}
function carnetFields(p) {
  if (p.clave_catalogo !== "reposicion") return "";
  const student = current();
  return `<fieldset class="carnet-fields"><legend>Datos para tu nuevo carnet</legend><p>Revisa tus datos antes de confirmar la solicitud.</p><label class="block-label">Nombre completo<input name="carnetNombre" required minlength="3" maxlength="120" autocomplete="name" value="${esc(student.nombre)}"></label><label class="block-label">NIE<input name="carnetNie" inputmode="numeric" pattern="[0-9]{7}" maxlength="7" required value="${esc(student.nie)}"></label>${majorPicker("carnetBachillerato", student.bachillerato_id, true)}</fieldset>`;
}
function carnetDetails(o) {
  return o.carnet_nombre
    ? [
        ["Nombre para carnet", o.carnet_nombre],
        ["NIE del carnet", o.carnet_nie],
        ["Bachillerato del carnet", o.carnet_bachillerato],
      ]
    : [];
}
function purchaseModal(p) {
  if (S.user.rol !== "cliente")
    return toast(
      "Tu rol permite consultar el catálogo. Las compras se realizan con una cuenta de cliente.",
      true,
    );
  if (!current())
    return toast(
      "Tu cuenta necesita un expediente de estudiante para realizar compras.",
      true,
    );
  S.modal = { kind: "buy", id: p.id };
  const max = p.categoria === "Uniformes" ? 3 : 1;
  openModal(
    `<div class="modal-product ${esc(p.arte)}">${productVisual(p)}</div><span class="eyebrow">${esc(p.categoria)} · COMPRA OPCIONAL</span><h2 id="dialog-title">${esc(p.nombre)}</h2><p>${esc(p.descripcion)}</p><div class="buy-price">${money(p.precio)} <small>USD / unidad</small></div><form id="order-form"><input type="hidden" name="conceptId" value="${p.id}">${carnetFields(p)}${
      p.requiere_especialidad
        ? `<label class="block-label">Pin de tu bachillerato<select name="specialty" required><option value="">Elige el bachillerato de tu pin</option>${specialties
            .filter((x) =>
              S.data.majors.some((m) => m.activo && m.nombre === x),
            )
            .map((x) => `<option>${x}</option>`)
            .join("")}</select></label>`
        : ""
    }<div class="form-row">${p.requiere_talla ? '<label>Talla<select name="size"><option>XS</option><option>S</option><option selected>M</option><option>L</option><option>XL</option><option>XXL</option></select></label>' : ""}${max === 3 ? '<label>Cantidad (máximo 3 por pedido)<input type="number" name="qty" id="buy-qty" min="1" max="3" required value="1"></label>' : '<input type="hidden" name="qty" value="1">'}</div><div class="checkout-student">${icon("users")}<div><small>PARA EL ESTUDIANTE</small><strong>${esc(current().nombre)}</strong><span>NIE ${esc(current().nie)}</span></div></div><div class="total"><span>Total del pedido</span><strong id="buy-total">${money(p.precio)}</strong></div><button type="submit" class="primary full">Confirmar pedido ${icon("arrow", 17)}</button></form><p class="fine-print">${max === 3 ? "Puedes elegir de 1 a 3 uniformes por pedido." : "Se solicita una unidad por pedido."} Puedes volver a comprar este artículo cuando lo necesites.</p>`,
    p.clave_catalogo === "reposicion" ? "carnet" : "normal",
  );
}
function payModal(o) {
  S.modal = { kind: "pay", id: o.id };
  openModal(
    `<span class="stat-icon blue">${icon("wallet", 24)}</span><h2 id="dialog-title">Un paso y listo</h2><p>Revisa los datos y elige cómo realizar tu pago de prueba.</p><div class="payment-summary"><strong>${esc(o.nombre_concepto)}</strong><small>${esc(o.estudiante)}</small><span>${money(o.importe)} <small>USD</small></span></div><form id="payment-form"><input type="hidden" name="operationId" value="${o.id}"><div class="method-grid"><label class="payment-option chosen"><input type="radio" name="method" value="Simulación" checked>${icon("card", 22)}<strong>Pago simulado</strong><small>Confirmación inmediata</small></label><label class="payment-option"><input type="radio" name="method" value="Transferencia">${icon("bank", 22)}<strong>Transferencia</strong><small>Validación manual de prueba</small></label></div><div id="transfer-fields" hidden><label class="block-label">Referencia de prueba<input name="reference" id="transfer-reference" maxlength="120" placeholder="Ej. TRANS-2026-001"></label><label class="block-label">Evidencia de prueba (PDF, PNG o JPG; máx. 5 MB)<input type="file" name="evidencia" id="transfer-file" accept=".pdf,.png,.jpg,.jpeg"></label></div><div class="info-box compact">${icon("shield", 20)}<p>Modo de prueba: no se realiza ningún cargo bancario. No ingreses datos de tarjetas ni información bancaria real.</p></div><button type="submit" class="primary full" id="pay-submit">Confirmar pago de prueba ${icon("arrow", 17)}</button></form>`,
  );
}
function receiptModal(o) {
  S.modal = { kind: "receipt", id: o.id };
  openModal(
    `<div class="receipt-top"><span class="receipt-check">${icon("check", 29)}</span><span class="eyebrow">TODO EN ORDEN</span><h2 id="dialog-title">Pago confirmado</h2><p>Tu comprobante está listo.</p></div><div class="receipt-paper"><div class="receipt-brand"><img src="assets/photos/logo-inframen.png" alt="Escudo INFRAMEN" class="receipt-logo">INFRAMEN</div><small>INSTITUTO NACIONAL GENERAL FRANCISCO MENÉNDEZ</small><div class="receipt-amount">${money(o.importe)} <small>USD</small></div><dl>${[
      ["Folio", o.folio],
      ["Fecha", day(o.confirmado_en)],
      ["Estudiante", o.estudiante],
      ["NIE", o.nie],
      ["Concepto", o.nombre_concepto],
      ["Cantidad", o.cantidad + (o.talla ? " · Talla " + o.talla : "")],
      ...(o.especialidad_producto
        ? [["Bachillerato", o.especialidad_producto]]
        : []),
      ...carnetDetails(o),
      ["Medio", o.medio],
      [
        "Entrega",
        o.tipo === "COMPRA"
          ? o.entregado_en
            ? "Entregado el " + day(o.entregado_en)
            : "Retira con tu comprobante en horario de atención"
          : "No aplica",
      ],
    ]
      .map(
        ([l, v]) =>
          `<div><dt>${l}</dt><dd>${l === "Folio" ? folioUI(v) : esc(v)}</dd></div>`,
      )
      .join(
        "",
      )}</dl><p class="fine-print">COMPROBANTE DE PRUEBA · SIN VALIDEZ FISCAL</p></div><a class="primary full" href="api/receipts/${encodeURIComponent(o.folio)}">${icon("download", 17)} Descargar comprobante PDF</a>`,
    "receipt",
  );
}
function reviewModal(o) {
  S.modal = { kind: "review", id: o.pago_id };
  openModal(
    `<span class="stat-icon blue">${icon("bank", 23)}</span><h2 id="dialog-title">Revisar transferencia</h2><p>Verifica la evidencia antes de aprobar o rechazar el pago de prueba.</p><div class="payment-summary"><strong>${esc(o.nombre_concepto)}</strong><small>${esc(o.estudiante)} · NIE ${esc(o.nie)}</small><span>${money(o.importe)}</span><p>Referencia: ${esc(o.referencia)}</p></div><a class="secondary full" href="api/payments/${o.pago_id}/evidence" target="_blank" rel="noopener">${icon("file", 17)} Abrir evidencia adjunta ${icon("up", 16)}</a><form id="review-form" class="form-grid"><label>Motivo de rechazo (necesario solo si rechazas)<input name="reason" maxlength="255" placeholder="Ej. Evidencia ilegible"></label><div class="form-row"><button type="submit" name="decision" value="reject" class="secondary">Rechazar</button><button type="submit" name="decision" value="approve" class="primary">Confirmar ${icon("check", 16)}</button></div></form>`,
  );
}
function conceptModal(p) {
  p = p || {
    nombre: "",
    categoria: "Uniformes",
    tipo: "COMPRA",
    precio: 1,
    descripcion: "",
    arte: "shirt",
    activo: 1,
    requiere_talla: 1,
  };
  S.modal = { kind: "concept", id: p.id };
  openModal(
    `<h2 id="dialog-title">${p.id ? "Editar" : "Nuevo"} concepto</h2><p>Los cambios de precio no modifican pedidos ya creados.</p><form id="concept-form" class="form-grid"><label>Nombre<input name="name" required minlength="3" maxlength="100" value="${esc(p.nombre)}"></label><div class="form-row"><label>Tipo<select name="type" ${p.id ? "disabled" : ""}><option value="COMPRA" ${p.tipo === "COMPRA" ? "selected" : ""}>Compra opcional</option><option value="OBLIGATORIO" ${p.tipo === "OBLIGATORIO" ? "selected" : ""}>Pago obligatorio</option></select></label><label>Precio (USD)<input name="price" type="number" step="0.01" min="0.01" max="9999" required value="${p.precio}"></label></div><label>Categoría<select name="category">${["Uniformes", "Graduación", "Distintivos", "Banda escolar", "Accesorios", "Trámites", "Pagos obligatorios"].map((c) => `<option ${c === p.categoria ? "selected" : ""}>${c}</option>`).join("")}</select></label><label>Descripción<textarea name="description" rows="3" maxlength="1000">${esc(p.descripcion)}</textarea></label><label>Ilustración<select name="art">${[
      ["fisica", "Uniforme de educación física"],
      ["salud", "Uniforme de Salud"],
      ["turismo", "Uniforme de Hostelería y Turismo"],
      ["mug", "Taza"],
      ["card", "Carnet"],
      ["gown", "Toga"],
      ["pin", "Pin"],
      ["plaque", "Placa"],
    ]
      .map(
        ([v, l]) =>
          `<option value="${v}" ${v === p.arte ? "selected" : ""}>${l}</option>`,
      )
      .join(
        "",
      )}</select></label><label class="checkbox-label"><input name="size" type="checkbox" ${p.requiere_talla ? "checked" : ""}> Requiere talla</label><label class="checkbox-label"><input name="specialty" type="checkbox" ${p.requiere_especialidad ? "checked" : ""}> Solicitar bachillerato (pines)</label><p class="fine-print">Uniformes: hasta 3 por pedido. Otros artículos: una unidad por pedido.</p><label class="checkbox-label"><input name="active" type="checkbox" ${p.activo ? "checked" : ""}> Activo y visible</label><button type="submit" class="primary">Guardar concepto ${icon("check", 16)}</button></form>`,
  );
}
function studentModal(s) {
  S.modal = { kind: "student", id: s?.id };
  openModal(
    `<h2 id="dialog-title">${s ? "Editar" : "Nuevo"} estudiante</h2><p>Completa los datos del estudiante.</p><form id="student-form" class="form-grid"><label>Nombre completo<input name="name" minlength="3" maxlength="120" required value="${esc(s?.nombre || "")}"></label><label>NIE<input name="nie" inputmode="numeric" pattern="[0-9]{7}" maxlength="7" required value="${esc(s?.nie || "")}"></label><label>Año lectivo<input type="number" name="year" required min="2020" max="2100" value="${s?.anio || S.year}"></label>${majorPicker("majorId", s?.bachillerato_id)}<button type="submit" class="primary">Guardar estudiante ${icon("check", 16)}</button></form>`,
  );
}
function userModal(u) {
  S.modal = { kind: "user", id: u?.id };
  const ids = String(u?.estudiante_ids || "").split(",");
  openModal(
    `<h2 id="dialog-title">${u ? "Editar" : "Nuevo"} usuario</h2><p>El rol controla los permisos y las funciones disponibles.</p><form id="user-form" class="form-grid"><label>Nombre completo<input name="name" required minlength="3" maxlength="120" value="${esc(u?.nombre || "")}"></label><label>Correo electrónico<input type="email" name="email" required maxlength="150" value="${esc(u?.correo || "")}"></label><label>Usuario de acceso (solo personal)<input name="username" maxlength="60" value="${esc(u?.acceso_personal || "")}" placeholder="Ej. admin; clientes ingresan con su NIE"></label><label>${u ? "Nueva contraseña (opcional)" : "Contraseña"}<input type="password" name="password" minlength="8" maxlength="128" ${u ? "" : "required"} autocomplete="new-password" placeholder="Mayúscula, minúscula y número"></label><label>Rol<select name="role">${Object.entries(
      roleNames,
    )
      .map(
        ([k, v]) =>
          `<option value="${k}" ${k === (u?.rol || "cliente") ? "selected" : ""}>${v}</option>`,
      )
      .join(
        "",
      )}</select></label>${ids.filter(Boolean).length > 1 ? '<p class="fine-print">Esta cuenta heredada conserva varios expedientes de estudiante.</p>' : `<label>Estudiante y NIE${studentOptions("studentId", ids[0] || "", true)}</label>`}<label class="checkbox-label"><input type="checkbox" name="active" ${!u || u.activo ? "checked" : ""}> Cuenta activa</label><button type="submit" class="primary">Guardar usuario ${icon("check", 16)}</button></form>`,
  );
}
function helpModal() {
  openModal(
    `<span class="stat-icon blue">${icon("help", 24)}</span><h2 id="dialog-title">Estamos para ayudarte</h2><p>Encuentra el siguiente paso en tu portal.</p>${[
      [
        "¿Cómo consulto mis cobros?",
        "En Consultar cobros aparecen únicamente los pagos obligatorios del estudiante y año seleccionados.",
      ],
      [
        "¿Es obligatorio comprar artículos?",
        "No. Uniformes, togas, pines y placas son opcionales. Solo se crea un pedido cuando tú lo confirmas.",
      ],
      [
        "¿Cómo pruebo un pago?",
        "Elige Pago simulado para confirmación inmediata, o Transferencia con referencia y evidencia de prueba. Administración o colecturía revisan estas transferencias.",
      ],
      [
        "¿Cómo descargo un comprobante?",
        "Abre Comprobantes después de confirmar el pago. El botón de descarga genera un archivo PDF.",
      ],
      [
        "¿Cómo registro una entrega?",
        "Con una cuenta de coordinación, colecturía o administración, abre Entregas e ingresa el folio de una compra pagada.",
      ],
      [
        "¿Cómo creo una cuenta?",
        "Completa tu nombre, correo, contraseña y NIE. Si ya existe un expediente con ese NIE, administración confirmará el vínculo.",
      ],
    ]
      .map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`)
      .join(
        "",
      )}<div class="info-box compact">${icon("shield", 18)}<p>Proyecto académico. No se procesa dinero real. Los importes oficiales deben definirse con la institución.</p></div>`,
  );
}
document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action,
    id = Number(el.dataset.id);
  if (el.tagName === "A") e.preventDefault();
  try {
    switch (action) {
      case "view":
        setView(el.dataset.view);
        break;
      case "menu":
        $(".sidebar")?.classList.toggle("open");
        break;
      case "dismiss-toast":
        $("#toast-root").innerHTML = "";
        break;
      case "close-modal":
        closeModal();
        break;
      case "help":
        helpModal();
        break;
      case "login-view":
        renderLogin(false);
        break;
      case "register-view":
        renderLogin(true);
        break;
      case "login-mode":
        renderLogin(false, el.dataset.mode);
        break;
      case "fill-account": {
        const f = $("#login-form");
        f.elements[S.loginMode === "personal" ? "username" : "nie"].value =
          el.dataset.identifier;
        f.elements.password.value = el.dataset.password;
        f.querySelector('button[type="submit"]').focus();
        break;
      }
      case "copy-folio":
        await copyFolio(el.dataset.folio);
        break;
      case "lookup-delivery":
        $("#delivery-search").elements.folio.value = el.dataset.folio;
        $("#delivery-search").requestSubmit();
        $("#delivery-result").scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        break;
      case "select-visible-students":
        $$(
          "#charge-selected [data-student-row]:not([hidden]) input[type=checkbox]",
        ).forEach((box) => (box.checked = true));
        updateSelectionCount();
        break;
      case "clear-selected-students":
        $$("#charge-selected input[type=checkbox]").forEach(
          (box) => (box.checked = false),
        );
        updateSelectionCount();
        break;
      case "category":
        S.category = el.dataset.category;
        render();
        break;
      case "admin-tab":
        S.adminTab = el.dataset.tab;
        S.q = "";
        S.status = "Todos";
        render();
        break;
      case "buy":
        purchaseModal(S.data.catalog.find((p) => p.id === id));
        break;
      case "pay":
        payModal(S.data.operations.find((o) => o.id === id));
        break;
      case "card-request": {
        const o = S.data.operations.find((o) => o.id === id);
        openModal(
          `<span class="stat-icon blue">${icon("card", 24)}</span><h2 id="dialog-title">Solicitud de reposición</h2><p>Datos guardados al crear el pedido.</p><dl class="card-request-details">${carnetDetails(
            o,
          )
            .map(
              ([label, value]) =>
                `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`,
            )
            .join("")}</dl><p>${badge(o)}</p>`,
        );
        break;
      }
      case "receipt":
        receiptModal(S.data.operations.find((o) => o.id === id));
        break;
      case "review":
        reviewModal(S.data.operations.find((o) => o.id === id));
        break;
      case "cancel": {
        const o = S.data.operations.find((x) => x.id === id);
        S.modal = { kind: "cancel", id };
        openModal(
          `<h2 id="dialog-title">Cancelar pedido</h2><p>¿Deseas cancelar el pedido de ${esc(o.nombre_concepto)}? No se ha confirmado ningún pago para esta compra.</p><form id="cancel-form"><div class="form-row"><button type="button" class="secondary" data-action="close-modal">Volver</button><button type="submit" class="primary">Cancelar pedido</button></div></form>`,
        );
        break;
      }
      case "profile":
        openModal(
          `<span class="avatar large">${initials(S.user.nombre)}</span><h2 id="dialog-title">Tu cuenta INFRAMEN</h2><p>${esc(S.user.correo)}</p><div class="profile-detail"><strong>${esc(S.user.nombre)}</strong><span>${roleNames[S.user.rol]}</span>${!isStaff() && current() ? `<span>Estudiante: ${esc(current().nombre)}</span><span>NIE ${esc(current().nie)}</span>` : ""}</div><p class="fine-print">Los permisos de tu cuenta son asignados por administración.</p><button class="secondary full" data-action="logout">${icon("logout", 16)} Cerrar sesión</button>`,
        );
        break;
      case "logout":
        if (busy) return;
        await api("logout", { method: "POST" });
        S.user = null;
        S.data = null;
        closeModal(true);
        renderLogin();
        break;
      case "notifications": {
        const pending = myOps().filter(
          (o) => o.tipo === "OBLIGATORIO" && o.estado === "Pendiente",
        );
        openModal(
          `<span class="stat-icon blue">${icon("bell", 23)}</span><h2 id="dialog-title">Al día contigo</h2><div class="notice-item">${icon("clock", 20)}<div><strong>${pending.length ? "Tienes " + pending.length + " aporte(s) Pagos obligatorios pendientes(s)" : "Tus aportes están al día"}</strong><p>Consulta tu historial y revisa las fechas de tus próximos aportes.</p><button class="text-button" data-action="notify-cobros">Consultar cobros ${icon("arrow", 15)}</button></div></div><div class="notice-item">${icon("bag", 20)}<div><strong>El catálogo está disponible</strong><p>Uniformes, togas y distintivos. Todas las compras son opcionales.</p></div></div>`,
        );
        break;
      }
      case "notify-cobros":
        closeModal();
        setView("cobros");
        break;
      case "new-concept":
        conceptModal();
        break;
      case "student-history":
        studentHistory(id);
        break;
      case "delete-concept": {
        const p = S.data.catalog.find((p) => p.id === id),
          history = S.data.operations.some((o) => o.concepto_id === id);
        S.modal = { kind: "delete-concept", id };
        openModal(
          `<h2 id="dialog-title">${history ? "Desactivar concepto" : "Eliminar concepto"}</h2><p><strong>${esc(p.nombre)}</strong></p><p>${history ? "Este concepto tiene pedidos asociados. Se desactivará para conservar los pagos y comprobantes." : "Este concepto no tiene pedidos asociados. Se eliminará definitivamente del catálogo."}</p><form id="delete-concept-form"><div class="form-row"><button type="button" class="secondary" data-action="close-modal">Volver</button><button type="submit" class="primary">${history ? "Desactivar" : "Eliminar definitivamente"}</button></div></form>`,
        );
        break;
      }
      case "edit-concept":
        conceptModal(S.data.catalog.find((p) => p.id === id));
        break;
      case "new-student":
        studentModal();
        break;
      case "edit-student":
        studentModal(S.data.students.find((s) => s.id === id));
        break;
      case "new-user":
        userModal();
        break;
      case "edit-user":
        userModal(S.data.users.find((u) => u.id === id));
        break;
    }
  } catch (error) {
    toast(error.message, true);
  }
});
document.addEventListener("change", (e) => {
  const el = e.target;
  if (el.id === "charge-scope") {
    updateChargeScope();
    return;
  }
  if (el.name === "studentIds") {
    updateSelectionCount();
    return;
  }
  if (el.id === "delivery-status") {
    S.deliveryStatus = el.value;
    updateResults();
    return;
  }
  if (el.id === "student-select") {
    S.studentId = Number(el.value);
    render();
  } else if (el.id === "year-select") {
    S.year = Number(el.value);
    S.from = S.year + "-01-01";
    S.to = S.year + "-12-31";
    S.studentId =
      S.data.students.find((s) => s.anio === Number(S.year))?.id || null;
    render();
  } else if (el.id === "status-filter") {
    S.status = el.value;
    updateResults();
  } else if (el.name === "method") {
    const transfer = el.value === "Transferencia";
    $("#transfer-fields").hidden = !transfer;
    $("#transfer-reference").required = transfer;
    $("#transfer-file").required = transfer;
    $$(".payment-option").forEach((l) =>
      l.classList.toggle("chosen", l.contains(el)),
    );
    $("#pay-submit").innerHTML =
      (transfer ? "Enviar a revisión" : "Confirmar pago de prueba") +
      " " +
      icon("arrow", 17);
  } else if (el.name === "type" && $("#concept-form")) {
    $("#concept-form").elements.category.value =
      el.value === "OBLIGATORIO" ? "Pagos obligatorios" : "Uniformes";
  }
});
document.addEventListener("input", (e) => {
  if (e.target.matches("[data-student-filter]")) {
    const wrapper = e.target.closest(".student-picker"),
      select = wrapper.querySelector("select"),
      q = normalize(e.target.value);
    for (const option of select.options)
      option.hidden =
        !!option.value && !normalize(option.textContent).includes(q);
    if (select.selectedOptions[0]?.hidden)
      select.value = [...select.options].find((o) => !o.hidden)?.value || "";
    const count = [...select.options].filter(
      (o) => o.value && !o.hidden,
    ).length;
    wrapper.querySelector(".picker-count").textContent =
      count + " estudiantes encontrados";
  }
  if (e.target.id === "charge-student-search") {
    let count = 0;
    for (const row of $$("#charge-selected [data-student-row]")) {
      row.hidden = !normalize(row.dataset.search).includes(
        normalize(e.target.value),
      );
      if (!row.hidden) count++;
    }
    $("#charge-no-matches").hidden = count !== 0;
  }

  if (e.target.id === "search-input") {
    S.q = e.target.value;
    updateResults();
  }
  if (e.target.id === "buy-qty") {
    const p = S.data.catalog.find((p) => p.id === S.modal.id);
    $("#buy-total").textContent = money(p.precio * Number(e.target.value));
  }
});
function updateResults() {
  if (
    S.view === "admin" &&
    ["Catálogo", "Usuarios", "Actividad"].includes(S.adminTab)
  ) {
    let count = 0;
    for (const row of $$("[data-admin-row]")) {
      row.hidden = !normalize(row.dataset.search).includes(
        normalize(S.q).trim(),
      );
      if (!row.hidden) count++;
    }
    if ($("#admin-search-empty")) $("#admin-search-empty").hidden = count > 0;
    return;
  }
  if (!$("#results")) return;
  $("#results").innerHTML =
    S.view === "admin" && S.adminTab === "Estudiantes"
      ? studentsTable()
      : S.view === "catalog"
        ? products()
        : table(filteredOperations(), S.view === "admin");
}
document.addEventListener("submit", async (e) => {
  const f = e.target;
  if (!f.id) return;
  e.preventDefault();
  if (busy) return;
  const d = Object.fromEntries(new FormData(f));
  try {
    switch (f.id) {
      case "login-form": {
        busy = true;
        f.querySelector('button[type="submit"]').disabled = true;
        $("#auth-error").textContent = "";
        try {
          const session = await api("login", {
            method: "POST",
            body: { ...d, mode: S.loginMode },
          });
          S.user = session.user;
          S.csrf = session.csrf;
          S.view = isStaff() ? "admin" : "home";
          S.adminTab = "Resumen";
          await load();
          render();
        } catch (err) {
          if ($("#auth-error")) $("#auth-error").textContent = err.message;
          else throw err;
        } finally {
          busy = false;
          f.querySelector('button[type="submit"]').disabled = false;
        }
        break;
      }
      case "register-form": {
        busy = true;
        f.querySelector('button[type="submit"]').disabled = true;
        $("#auth-error").textContent = "";
        try {
          const result = await api("register", { method: "POST", body: d });
          renderLogin(false, "cliente");
          $("#login-form").elements.nie.value = d.nie;
          toast(
            "Cuenta creada. Ya puedes iniciar sesión.",
          );
        } catch (err) {
          $("#auth-error").textContent = err.message;
        } finally {
          busy = false;
          f.querySelector('button[type="submit"]').disabled = false;
        }
        break;
      }
      case "order-form": {
        const result = await mutate(
          "orders",
          "POST",
          {
            studentId: S.studentId,
            conceptId: d.conceptId,
            qty: Number(d.qty),
            size: d.size,
            specialty: d.specialty,
            carnet: d.carnetNombre
              ? {
                  nombre: d.carnetNombre,
                  nie: d.carnetNie,
                  bachillerato: d.carnetBachillerato,
                }
              : undefined,
          },
          "Pedido creado. Continúa con el pago.",
        );
        if (result) payModal(S.data.operations.find((o) => o.id === result.id));
        break;
      }
      case "payment-form": {
        const operationId = Number(d.operationId);
        const formData = new FormData(f);
        if (d.method === "Simulación") {
          formData.delete("evidencia");
          formData.delete("reference");
        }
        const result = await mutate(
          "payments",
          "POST",
          formData,
          d.method === "Transferencia"
            ? "Transferencia enviada a revisión."
            : "Pago de prueba confirmado.",
        );
        if (result?.folio)
          receiptModal(S.data.operations.find((o) => o.id === operationId));
        break;
      }
      case "review-form": {
        const approve = e.submitter?.value === "approve";
        if (!approve && String(d.reason).trim().length < 3)
          return toast("Escribe el motivo del rechazo.", true);
        await mutate(
          "payments/" + S.modal.id + "/review",
          "POST",
          { approve, reason: d.reason },
          approve
            ? "Transferencia confirmada."
            : "Transferencia rechazada. El estudiante puede reintentar el pago.",
        );
        break;
      }
      case "cancel-form":
        await mutate(
          "orders/" + S.modal.id + "/cancel",
          "POST",
          {},
          "Pedido cancelado.",
        );
        break;
      case "concept-form": {
        const p = S.data.catalog.find((p) => p.id === S.modal.id);
        await mutate(
          "concepts" + (S.modal.id ? "/" + S.modal.id : ""),
          S.modal.id ? "PUT" : "POST",
          {
            ...d,
            type: p?.tipo || d.type,
            price: Number(d.price),
            size: d.size === "on",
            specialty: d.specialty === "on",
            active: d.active === "on",
          },
          "Concepto guardado.",
        );
        break;
      }
      case "delete-concept-form": {
        const result = await api("concepts/" + S.modal.id, {
          method: "DELETE",
        });
        await load();
        closeModal(true);
        render();
        toast(
          result.deleted
            ? "Concepto eliminado definitivamente."
            : "Concepto desactivado. Su historial se conserva.",
        );
        break;
      }
      case "student-form":
        await mutate(
          "students" + (S.modal.id ? "/" + S.modal.id : ""),
          S.modal.id ? "PUT" : "POST",
          d,
          "Estudiante guardado.",
        );
        break;
      case "user-form": {
        const editingSelf = S.modal.id === S.user.id;
        if (editingSelf) {
          await api("users/" + S.modal.id, {
            method: "PUT",
            body: { ...d, active: d.active === "on" },
          });
          S.user = null;
          S.data = null;
          closeModal();
          renderLogin();
          toast("Tu cuenta fue actualizada. Inicia sesión nuevamente.");
        } else {
          await mutate(
            "users" + (S.modal.id ? "/" + S.modal.id : ""),
            S.modal.id ? "PUT" : "POST",
            { ...d, active: d.active === "on" },
            "Usuario guardado.",
          );
        }
        break;
      }
      case "charge-form": {
        const body = {
          ...d,
          year: Number(S.year),
          studentIds: new FormData(f).getAll("studentIds").map(Number),
        };
        busy = true;
        const button = f.querySelector("button[type=submit]");
        button.disabled = true;
        try {
          const preview = await api("charges/preview", {
            method: "POST",
            body,
          });
          S.modal = {
            kind: "charge-confirm",
            payload: { ...body, expectedPrice: preview.price },
          };
          openModal(
            `<span class="stat-icon blue">${icon("book", 24)}</span><h2 id="dialog-title">Revisar asignación</h2><p><strong>${esc(preview.conceptName)}</strong> · Período ${esc(d.period)} · Año ${S.year}</p><div class="student-payment-summary"><div><small>COBROS NUEVOS</small><strong>${preview.created}</strong></div><div><small>YA ASIGNADOS · SE OMITEN</small><strong>${preview.skipped}</strong></div></div><p>Importe por estudiante: <strong>${money(preview.price)}</strong><br>Total de nuevos cobros: <strong>${money(preview.total)}</strong><br>Fecha límite: ${day(d.due)}</p><div class="charge-preview-list">${preview.recipients.map((s) => `<div>${esc(s.nombre)}<small>NIE ${esc(s.nie)}</small></div>`).join("")}${preview.created > 30 ? `<p>Y ${preview.created - 30} estudiantes más.</p>` : ""}</div><form id="charge-confirm-form"><div class="form-row"><button type="button" class="secondary" data-action="close-modal">Volver</button><button class="primary" type="submit" ${preview.created ? "" : "disabled"}>Asignar ${preview.created} cobro(s)</button></div></form>`,
          );
        } finally {
          busy = false;
          button.disabled = false;
        }
        break;
      }
      case "charge-confirm-form":
        await mutate(
          "charges",
          "POST",
          S.modal.payload,
          (r) =>
            `${r.created} cobro(s) asignados. ${r.skipped} existentes omitidos.`,
        );
        break;
      case "delivery-search": {
        busy = true;
        f.querySelector("button").disabled = true;
        try {
          const o = await api("delivery?folio=" + encodeURIComponent(d.folio));
          $("#delivery-result").innerHTML =
            `<div class="delivery-result">${folioUI(o.folio)}<h3>${esc(o.nombre_concepto)}</h3><p>${esc(o.estudiante)} · NIE ${esc(o.nie)}</p><p>${o.cantidad} artículo(s) ${o.talla ? "· Talla " + esc(o.talla) : ""} ${o.especialidad_producto ? " · " + esc(o.especialidad_producto) : ""}</p>${o.delivery ? `<span class="badge green">${icon("check", 14)} Entregado el ${day(o.delivery.fecha)}</span>` : `<form id="delivery-form"><input type="hidden" name="folio" value="${esc(o.folio)}"><label class="block-label">Observación (opcional)<input name="observation" maxlength="255" placeholder="Ej. Retira el estudiante"></label><button type="submit" class="primary">Registrar entrega ${icon("check", 16)}</button></form>`}</div>`;
        } catch (err) {
          $("#delivery-result").innerHTML = empty(
            "No se encontró una compra pagada",
            err.message,
          );
        } finally {
          busy = false;
          f.querySelector("button").disabled = false;
        }
        break;
      }
      case "delivery-form":
        await mutate(
          "delivery",
          "POST",
          d,
          "Entrega registrada. Este pedido no puede entregarse nuevamente.",
        );
        break;
      case "report-form":
        if (d.from > d.to)
          return toast(
            "La fecha inicial no puede ser posterior a la final.",
            true,
          );
        S.from = d.from;
        S.reportNie = d.nie?.trim() || "";
        S.reportQuery = d.query?.trim() || "";
        S.to = d.to;

        render();
        break;
    }
  } catch (err) {
    toast(err.message, true);
  }
});
document.addEventListener("keydown", (e) => {
  if (!$(".modal")) return;
  if (e.key === "Escape") closeModal();
  if (e.key === "Tab") {
    const focusable = $$(
      '.modal a[href], .modal button:not([disabled]), .modal input:not([hidden]):not([type="hidden"]), .modal select, .modal textarea',
    ).filter((el) => el.offsetParent !== null);
    const first = focusable[0],
      last = focusable.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
document.addEventListener("mousedown", (e) => {
  if (e.target.classList.contains("modal-backdrop")) closeModal();
});
(async () => {
  try {
    const session = await api("session");
    S.user = session.user;
    S.csrf = session.csrf;
    if (S.user) {
      S.view = isStaff() ? "admin" : "home";
      await load();
      render();
    } else renderLogin();
  } catch (e) {
    renderLogin();
    $("#auth-error").textContent = e.message;
  }
})();
