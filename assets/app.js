/**
 * 晧脈元素庫 · Hao Element Matrix
 * 主程式：週期表渲染、點擊鎖定邏輯、10 色領域色環、即時搜尋、清單切換與元素探勘區互動
 */

import { initConstellation } from './constellation.js';

const FAMILY_META = {
  'reactive-nonmetal': {
    label: '活性非金屬',
    sector: '碳足跡與永續系統',
    color: '#00e676'
  },
  'alkali-metal': {
    label: '鹼金屬',
    sector: '環境政策與治理',
    color: '#ff5252'
  },
  'alkaline-earth': {
    label: '鹼土金屬',
    sector: '能源與淨零轉型',
    color: '#ffab40'
  },
  'transition-metal': {
    label: '過渡金屬',
    sector: '工程模擬與運算',
    color: '#40c4ff'
  },
  'post-transition': {
    label: '貧金屬',
    sector: '開放資料與工具',
    color: '#536dfe'
  },
  metalloid: {
    label: '類金屬',
    sector: '互動教學與視覺化',
    color: '#69f0ae'
  },
  halogen: {
    label: '鹵素',
    sector: '檢測驗證與合規',
    color: '#ffd740'
  },
  'noble-gas': {
    label: '惰性氣體',
    sector: '知識圖譜與研究',
    color: '#e040fb'
  },
  lanthanide: {
    label: '鑭系元素',
    sector: 'AI 協作與自動化',
    color: '#ff6e40'
  },
  actinide: {
    label: '錒系元素',
    sector: '前瞻實驗室',
    color: '#b388ff'
  }
};

const FAMILY_ORDER = [
  'reactive-nonmetal',
  'alkali-metal',
  'alkaline-earth',
  'transition-metal',
  'post-transition',
  'metalloid',
  'halogen',
  'noble-gas',
  'lanthanide',
  'actinide'
];

const MINING_STORAGE_KEY = 'hao_element_matrix_mining_energy_v1';
const THEME_STORAGE_KEY = 'hao_theme_pref';

const LIGHT_FAMILY_COLORS = {
  'reactive-nonmetal': '#0284C7',
  'alkali-metal': '#A21CAF',
  'alkaline-earth': '#6D28D9',
  'transition-metal': '#0369A1',
  metalloid: '#047857',
  'post-transition': '#C2410C',
  halogen: '#B45309',
  'noble-gas': '#D97706',
  lanthanide: '#4D7C0F',
  actinide: '#B91C1C'
};

const state = {
  elements: [],
  elementsBySymbol: new Map(),
  projects: {},
  veins: [],
  lockedSymbol: null,
  activeSymbol: 'C',
  selectedFamily: null,
  litOnly: false,
  searchQuery: '',
  viewMode: 'matrix', // 'matrix' | 'list'
  userToggledView: false,
  isRadarScanning: false,
  miningClicks: {},
  themePref: 'system', // 'system' | 'dark' | 'light'
  resolvedTheme: 'dark'
};

const dom = {};

function cacheDom() {
  dom.periodicGrid = document.getElementById('periodic-grid');
  dom.matrixView = document.getElementById('matrix-view');
  dom.listView = document.getElementById('list-view');
  dom.listFeaturedGrid = document.getElementById('list-featured-grid');
  dom.listDormantGrid = document.getElementById('list-dormant-grid');
  dom.listDormantHeading = document.getElementById('list-dormant-heading');

  dom.spotlightCard = document.getElementById('spotlight-card');
  dom.spotHoloTile = document.getElementById('spot-holo-tile');
  dom.spotNumber = document.getElementById('spot-number');
  dom.spotLockBadge = document.getElementById('spot-lock-badge');
  dom.spotSymbol = document.getElementById('spot-symbol');
  dom.spotLayer1 = document.getElementById('spot-layer-1');
  dom.spotLayer3 = document.getElementById('spot-layer-3');
  dom.spotBackZh = document.getElementById('spot-back-zh');
  dom.spotNameZh = document.getElementById('spot-name-zh');
  dom.spotNameEn = document.getElementById('spot-name-en');
  dom.spotFamilyShort = document.getElementById('spot-family-short');
  dom.spotMass = document.getElementById('spot-mass');
  dom.spotEmblem = document.getElementById('spot-emblem');
  dom.spotStatusPill = document.getElementById('spot-status-pill');
  dom.spotSectorPill = document.getElementById('spot-sector-pill');
  dom.spotTitle = document.getElementById('spot-title');
  dom.spotSubtitle = document.getElementById('spot-subtitle');
  dom.spotDesc = document.getElementById('spot-desc');
  dom.spotWhy = document.getElementById('spot-why');
  dom.spotWhyTitle = document.getElementById('spot-why-title');
  dom.spotWhyText = document.getElementById('spot-why-text');
  dom.spotTags = document.getElementById('spot-tags');
  dom.spotDomain = document.getElementById('spot-domain');
  dom.spotLaunchBtn = document.getElementById('spot-launch-btn');
  dom.spotLitOnlyBtn = document.getElementById('spot-lit-only-btn');
  dom.spotListViewBtn = document.getElementById('spot-list-view-btn');

  dom.searchInput = document.getElementById('search-input');
  dom.searchClearBtn = document.getElementById('search-clear-btn');
  dom.litCount = document.getElementById('lit-count');
  dom.veinCount = document.getElementById('vein-count');
  dom.unlockProgressFill = document.getElementById('unlock-progress-fill');
  dom.headerViewToggle = document.getElementById('header-view-toggle');
  dom.themeSwitcher = document.getElementById('theme-switcher');
  dom.listBackMatrixBtn = document.getElementById('list-back-matrix-btn');
  dom.filterBanner = document.getElementById('filter-banner');
  dom.filterBannerText = document.getElementById('filter-banner-text');
  dom.filterResetBtn = document.getElementById('filter-reset-btn');

  dom.wheelSvg = document.getElementById('family-wheel-svg');
  dom.wheelLegendTitle = document.getElementById('wheel-legend-title');
  dom.wheelLegendSub = document.getElementById('wheel-legend-sub');

  dom.miningGrid = document.getElementById('mining-grid');
  dom.radarScanBtn = document.getElementById('radar-scan-btn');

  dom.hoverPill = document.getElementById('hover-pill');
  dom.hoverPillDot = document.getElementById('hover-pill-dot');
  dom.hoverPillMain = document.getElementById('hover-pill-main');
  dom.hoverPillHint = document.getElementById('hover-pill-hint');

  dom.toastContainer = document.getElementById('toast-container');
}

function getFamilyInfo(familyKey) {
  const base =
    FAMILY_META[familyKey] || {
      label: '未分類',
      sector: '探索領域',
      color: '#38bdf8'
    };

  if (state.resolvedTheme === 'light' && LIGHT_FAMILY_COLORS[familyKey]) {
    return { ...base, color: LIGHT_FAMILY_COLORS[familyKey] };
  }
  return base;
}

function buildLaunchUrl(rawUrl) {
  if (!rawUrl || rawUrl === '#') return '#';
  if (state.themePref !== 'light' && state.themePref !== 'dark') {
    return rawUrl;
  }
  try {
    const parsed = new URL(rawUrl, window.location.href);
    parsed.searchParams.set('theme', state.themePref);
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

function resolveTheme(pref) {
  if (pref === 'light' || pref === 'dark') return pref;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(pref, persist = false) {
  const validPref = pref === 'light' || pref === 'dark' || pref === 'system' ? pref : 'system';
  const resolved = resolveTheme(validPref);
  const changed = state.resolvedTheme !== resolved || state.themePref !== validPref;

  state.themePref = validPref;
  state.resolvedTheme = resolved;

  document.documentElement.dataset.themePref = validPref;
  document.documentElement.dataset.theme = resolved;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', resolved === 'light' ? '#F4F7FA' : '#050811');
  }

  if (persist) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, validPref);
    } catch {
      // 隱私模式或儲存受限時略過
    }
  }

  if (dom.themeSwitcher) {
    dom.themeSwitcher.querySelectorAll('.theme-seg-btn').forEach((btn) => {
      const isMatch = btn.dataset.themePref === validPref;
      btn.classList.toggle('is-active', isMatch);
      btn.setAttribute('aria-pressed', String(isMatch));
    });
  }

  if (changed && state.elements.length > 0) {
    renderPeriodicGrid();
    renderFamilyWheel();
    renderSpotlight();
  }
}

function showToast(message, duration = 3000) {
  const item = document.createElement('div');
  item.className = 'toast-item';
  item.textContent = message;
  dom.toastContainer.appendChild(item);

  window.setTimeout(() => {
    item.classList.add('is-leaving');
    item.addEventListener(
      'animationend',
      () => {
        item.remove();
      },
      { once: true }
    );
  }, duration);
}

/* ==========================================================================
   localStorage 安全讀寫（包覆 try/catch）
   ========================================================================== */
function loadMiningClicks() {
  try {
    const raw = window.localStorage.getItem(MINING_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveMiningClicks(map) {
  try {
    window.localStorage.setItem(MINING_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // 隱私模式或儲存空間受限時優雅降級
  }
}

/* ==========================================================================
   分子 SVG 徽章（44px 動態旋轉）
   ========================================================================== */
function buildEmblemSvg(emblemType, color) {
  if (emblemType === 'carbon') {
    return `
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <g class="emblem-orbit">
          <polygon
            points="24,6 39,15 39,33 24,42 9,33 9,15"
            stroke="${color}"
            stroke-width="1.8"
            stroke-opacity="0.85"
            fill="${color}"
            fill-opacity="0.08"
          />
          <circle cx="24" cy="6" r="2.6" fill="${color}" />
          <circle cx="39" cy="15" r="2.2" fill="#e2e8f0" />
          <circle cx="39" cy="33" r="2.6" fill="${color}" />
          <circle cx="24" cy="42" r="2.2" fill="#e2e8f0" />
          <circle cx="9" cy="33" r="2.6" fill="${color}" />
          <circle cx="9" cy="15" r="2.2" fill="#e2e8f0" />
        </g>
        <g class="emblem-orbit-rev">
          <circle cx="24" cy="24" r="10" stroke="${color}" stroke-width="1.2" stroke-dasharray="3 3" stroke-opacity="0.7" />
        </g>
        <circle cx="24" cy="24" r="4.5" fill="${color}" />
      </svg>
    `;
  }

  if (emblemType === 'oxygen') {
    const techBlue = '#38bdf8';
    const techCyan = '#00e5ff';
    const techLight = '#bae6fd';
    return `
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <g class="emblem-orbit">
          <ellipse cx="24" cy="24" rx="19" ry="8.5" transform="rotate(-24 24 24)" stroke="${techBlue}" stroke-width="1.5" stroke-opacity="0.88" />
          <circle cx="41.5" cy="16.4" r="2.2" fill="${techCyan}" />
          <circle cx="6.5" cy="31.6" r="2.0" fill="${techLight}" />
        </g>
        <g class="emblem-orbit-rev">
          <ellipse cx="24" cy="24" rx="19" ry="8.5" transform="rotate(24 24 24)" stroke="${techCyan}" stroke-width="1.35" stroke-dasharray="3 2.5" stroke-opacity="0.72" />
          <circle cx="41.5" cy="31.6" r="2.0" fill="${techBlue}" />
        </g>
        <line x1="17" y1="22.1" x2="31" y2="22.1" stroke="${techCyan}" stroke-width="1.8" stroke-linecap="round" />
        <line x1="17" y1="25.9" x2="31" y2="25.9" stroke="${techBlue}" stroke-width="1.8" stroke-linecap="round" />
        <circle cx="17" cy="24" r="5.2" fill="rgba(56, 189, 248, 0.24)" stroke="${techCyan}" stroke-width="1.6" />
        <circle cx="17" cy="24" r="2.2" fill="${techLight}" />
        <circle cx="31" cy="24" r="5.2" fill="rgba(56, 189, 248, 0.24)" stroke="${techBlue}" stroke-width="1.6" />
        <circle cx="31" cy="24" r="2.2" fill="${techLight}" />
      </svg>
    `;
  }

  if (emblemType === 'titanium') {
    const tiBlue = '#40c4ff';
    const tiSilver = '#e2e8f0';
    return `
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <g class="emblem-orbit">
          <circle cx="24" cy="24" r="18" stroke="${tiBlue}" stroke-width="1.4" stroke-dasharray="6 4" stroke-opacity="0.82" />
          <circle cx="24" cy="6" r="2.2" fill="${tiSilver}" />
          <circle cx="42" cy="24" r="2.2" fill="${tiBlue}" />
        </g>
        <g class="emblem-orbit-rev">
          <ellipse cx="24" cy="24" rx="16" ry="7" transform="rotate(-35 24 24)" stroke="${tiSilver}" stroke-width="1.2" stroke-opacity="0.6" />
        </g>
        <path
          d="M24 12 L27.5 22 L36 25.5 L27.5 27.5 L26 35 L24 32 L22 35 L20.5 27.5 L12 25.5 L20.5 22 Z"
          fill="rgba(64, 196, 255, 0.22)"
          stroke="${tiBlue}"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
        <circle cx="24" cy="24" r="2.1" fill="${tiSilver}" />
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <g class="emblem-orbit">
        <ellipse cx="24" cy="24" rx="18" ry="7.5" stroke="${color}" stroke-width="1.5" stroke-opacity="0.8" />
        <circle cx="42" cy="24" r="2.4" fill="${color}" />
      </g>
      <g class="emblem-orbit-rev">
        <ellipse cx="24" cy="24" rx="18" ry="7.5" transform="rotate(60 24 24)" stroke="${color}" stroke-width="1.3" stroke-opacity="0.55" />
        <ellipse cx="24" cy="24" rx="18" ry="7.5" transform="rotate(120 24 24)" stroke="${color}" stroke-width="1.3" stroke-opacity="0.55" />
      </g>
      <circle cx="24" cy="24" r="4" fill="${color}" />
    </svg>
  `;
}

/* ==========================================================================
   上方中央放大資訊卡渲染
   ========================================================================== */
function renderSpotlight() {
  const symbol = state.activeSymbol || 'C';
  const el = state.elementsBySymbol.get(symbol) || state.elements[0];
  if (!el) return;

  const family = getFamilyInfo(el.family);
  const project = state.projects[el.symbol] || null;
  const isLocked = state.lockedSymbol === el.symbol;

  dom.spotlightCard.style.setProperty('--spot-color', family.color);

  // 左欄：全息元素磚（僅在已點亮元素啟用 3D 雙面全息旋轉；雙字母符號套用 is-multi-char）
  dom.spotHoloTile.classList.toggle('is-lit-3d', Boolean(project));
  dom.spotHoloTile.classList.toggle('is-multi-char', el.symbol.length > 1);
  dom.spotNumber.textContent = `#${String(el.number).padStart(2, '0')}`;
  dom.spotSymbol.textContent = el.symbol;
  dom.spotLayer1.textContent = el.symbol;
  dom.spotLayer3.textContent = el.nameZh;
  dom.spotBackZh.textContent = el.nameZh;
  dom.spotNameZh.textContent = el.nameZh;
  dom.spotNameEn.textContent = el.nameEn;
  dom.spotFamilyShort.textContent = family.label;
  dom.spotMass.textContent = el.mass;

  if (isLocked) {
    dom.spotLockBadge.textContent = '🔒 已鎖定 · ✕';
    dom.spotLockBadge.classList.add('is-locked');
    dom.spotLockBadge.title = '點擊解除鎖定（或按 ESC）';
  } else {
    dom.spotLockBadge.textContent = '👁 預覽中';
    dom.spotLockBadge.classList.remove('is-locked');
    dom.spotLockBadge.title = '點擊鎖定此元素';
  }

  // 中欄：徽章、標題、完整介紹、為何是這個元素彩蛋欄、標籤與網域
  dom.spotEmblem.innerHTML = buildEmblemSvg(project?.emblemType || 'default', family.color);
  dom.spotSectorPill.textContent = family.sector;

  if (project) {
    dom.spotStatusPill.textContent = `● ${project.statusLabel || 'LIVE 上線中'}`;
    dom.spotStatusPill.className = 'status-pill is-live';
    dom.spotTitle.textContent = project.title;
    dom.spotSubtitle.textContent = project.subtitle || '';
    dom.spotDesc.textContent = project.description;

    if (project.whyElement) {
      dom.spotWhyTitle.textContent = `✦ 為何是 ${el.symbol}（${el.nameZh}）？`;
      dom.spotWhyText.textContent = project.whyElement;
      dom.spotWhy.hidden = false;
    } else {
      dom.spotWhy.hidden = true;
    }

    dom.spotTags.innerHTML = (project.tags || [])
      .map((tag) => `<span class="spot-tag">${escapeHtml(tag)}</span>`)
      .join('');
    dom.spotDomain.textContent = project.domainLabel || project.url;

    // 右欄按鈕：已上線
    dom.spotLaunchBtn.textContent = '前往系統 ↗';
    dom.spotLaunchBtn.href = buildLaunchUrl(project.url);
    dom.spotLaunchBtn.classList.remove('is-disabled');
    dom.spotLaunchBtn.dataset.live = 'true';
  } else {
    dom.spotStatusPill.textContent = '○ 休眠座標 · 待點亮';
    dom.spotStatusPill.className = 'status-pill is-dormant';
    dom.spotTitle.textContent = `${el.nameZh}（${el.symbol}）— 尚未點亮`;
    dom.spotSubtitle.textContent = `${el.nameEn} · Atomic #${el.number} · ${family.label}`;
    dom.spotDesc.textContent = `此座標歸屬「${family.sector}」規劃領域，目前處於休眠待探勘狀態。未來完成新系統後，僅需於 data/projects.json 新增「${el.symbol}」條目即可立即點亮。`;
    dom.spotWhy.hidden = true;

    dom.spotTags.innerHTML = [family.label, `第 ${el.row <= 7 ? el.row : el.row === 9 ? 6 : 7} 週期`, `原子量 ${el.mass}`]
      .map((tag) => `<span class="spot-tag">${escapeHtml(tag)}</span>`)
      .join('');
    dom.spotDomain.textContent = 'status: awaiting-illumination';

    // 右欄按鈕：尚未上線
    dom.spotLaunchBtn.textContent = '尚未上線';
    dom.spotLaunchBtn.href = '#';
    dom.spotLaunchBtn.classList.add('is-disabled');
    dom.spotLaunchBtn.dataset.live = 'false';
  }

  dom.spotLitOnlyBtn.classList.toggle('is-active', state.litOnly);
  dom.spotLitOnlyBtn.setAttribute('aria-pressed', String(state.litOnly));

  syncTileLockedState();
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/* ==========================================================================
   週期表渲染（118 元素 + 鑭系/錒系佔位指示）
   ========================================================================== */
function renderPeriodicGrid() {
  // 清除既有動態元素（保留中央資訊卡與左下角色環）
  dom.periodicGrid
    .querySelectorAll('.el-tile, .series-marker')
    .forEach((node) => node.remove());

  const frag = document.createDocumentFragment();

  for (const el of state.elements) {
    const family = getFamilyInfo(el.family);
    const project = state.projects[el.symbol] || null;
    const isLit = Boolean(project);
    const bottomLabel = project?.shortName || el.nameZh;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `el-tile ${isLit ? 'is-lit is-active' : 'is-dormant'}`;
    btn.dataset.symbol = el.symbol;
    btn.dataset.family = el.family;
    btn.style.gridColumn = String(el.col);
    btn.style.gridRow = String(el.row);
    btn.style.setProperty('--el-color', family.color);
    btn.setAttribute(
      'aria-label',
      `${el.number} 號元素 ${el.nameZh} ${el.symbol}${isLit ? `，已點亮：${project.title}` : '，休眠中'}`
    );

    btn.innerHTML = `
      <div class="el-tile-top">
        <span class="el-num">${el.number}</span>
        ${isLit ? '<span class="el-live-indicator" title="LIVE 上線中"></span>' : ''}
      </div>
      <div class="el-symbol">${el.symbol}</div>
      <div class="el-zh">${escapeHtml(bottomLabel)}</div>
    `;

    btn.addEventListener('click', () => handleTileClick(el.symbol));
    btn.addEventListener('mouseenter', (evt) => handleTileEnter(el, evt));
    btn.addEventListener('mousemove', (evt) => handleTileMove(el, evt));
    btn.addEventListener('mouseleave', () => hideHoverPill());

    frag.appendChild(btn);
  }

  // 鑭系 / 錒系週期表佔位指示格
  const markers = [
    { col: 3, row: 6, range: '57–71', label: '鑭系', family: 'lanthanide' },
    { col: 3, row: 7, range: '89–103', label: '錒系', family: 'actinide' }
  ];

  for (const m of markers) {
    const fam = getFamilyInfo(m.family);
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'series-marker';
    marker.style.gridColumn = String(m.col);
    marker.style.gridRow = String(m.row);
    marker.style.setProperty('--el-color', fam.color);
    marker.innerHTML = `${m.range}<span>${m.label}</span>`;
    marker.title = `點擊篩選「${fam.label} · ${fam.sector}」`;
    marker.addEventListener('click', () => toggleFamilyFilter(m.family));
    frag.appendChild(marker);
  }

  dom.periodicGrid.appendChild(frag);
  syncTileLockedState();
  applyFilters();
}

function syncTileLockedState() {
  const tiles = dom.periodicGrid.querySelectorAll('.el-tile');
  tiles.forEach((tile) => {
    tile.classList.toggle('is-locked', tile.dataset.symbol === state.lockedSymbol);
  });
}

/* ==========================================================================
   點擊鎖定 & 移入預覽邏輯
   ========================================================================== */
function handleTileClick(symbol) {
  hideHoverPill();
  if (state.lockedSymbol === symbol) {
    // 再次點擊已鎖定元素 → 解除鎖定
    state.lockedSymbol = null;
    state.activeSymbol = symbol;
    renderSpotlight();
    showToast('已解除鎖定，移動滑鼠即可自由預覽元素。', 2000);
    return;
  }

  state.lockedSymbol = symbol;
  state.activeSymbol = symbol;
  renderSpotlight();
}

function handleTileEnter(el, evt) {
  if (state.lockedSymbol) {
    if (state.lockedSymbol !== el.symbol) {
      showHoverPill(el, evt);
    }
    return;
  }

  // 未鎖定時：移入即時預覽
  state.activeSymbol = el.symbol;
  renderSpotlight();
}

function handleTileMove(el, evt) {
  if (state.lockedSymbol && state.lockedSymbol !== el.symbol) {
    positionHoverPill(evt);
  }
}

function showHoverPill(el, evt) {
  const family = getFamilyInfo(el.family);
  const project = state.projects[el.symbol];
  dom.hoverPillDot.style.background = family.color;
  dom.hoverPillMain.textContent = `${el.number} ${el.symbol} ${el.nameZh}`;
  dom.hoverPillHint.textContent = project ? `· ${project.title}（點擊鎖定）` : '· 點擊鎖定檢視';
  positionHoverPill(evt);
  dom.hoverPill.classList.add('is-visible');
}

function positionHoverPill(evt) {
  const offset = 16;
  const maxX = window.innerWidth - 260;
  const x = Math.min(evt.clientX + offset, Math.max(12, maxX));
  const y = Math.max(12, evt.clientY - 38);
  dom.hoverPill.style.left = `${x}px`;
  dom.hoverPill.style.top = `${y}px`;
}

function hideHoverPill() {
  dom.hoverPill.classList.remove('is-visible');
}

/* ==========================================================================
   10 色互動領域色環（SVG Donut）
   ========================================================================== */
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  };
}

function describeDonutArc(cx, cy, rOuter, rInner, startAngle, endAngle) {
  const p1 = polarToCartesian(cx, cy, rOuter, endAngle);
  const p2 = polarToCartesian(cx, cy, rOuter, startAngle);
  const p3 = polarToCartesian(cx, cy, rInner, startAngle);
  const p4 = polarToCartesian(cx, cy, rInner, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 1 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    'Z'
  ].join(' ');
}

function renderFamilyWheel() {
  const cx = 60;
  const cy = 60;
  const rOuter = 54;
  const rInner = 31;
  const step = 360 / FAMILY_ORDER.length;
  const gap = 2.6;

  const segmentsHtml = FAMILY_ORDER.map((familyKey, idx) => {
    const info = getFamilyInfo(familyKey);
    const start = idx * step + gap / 2;
    const end = (idx + 1) * step - gap / 2;
    const d = describeDonutArc(cx, cy, rOuter, rInner, start, end);
    return `
      <path
        class="wheel-segment"
        data-family="${familyKey}"
        d="${d}"
        fill="${info.color}"
        style="color: ${info.color};"
        tabindex="0"
        role="button"
        aria-label="篩選 ${info.sector}（${info.label}）"
      >
        <title>${info.sector}（${info.label}）</title>
      </path>
    `;
  }).join('');

  dom.wheelSvg.innerHTML = `
    ${segmentsHtml}
    <g id="wheel-center-btn" class="wheel-center-btn" tabindex="0" role="button" aria-label="顯示全部領域">
      <circle class="wheel-center-circle" cx="${cx}" cy="${cy}" r="25" />
      <text class="wheel-center-text" x="${cx}" y="${cy}">全部</text>
    </g>
  `;

  dom.wheelSvg.querySelectorAll('.wheel-segment').forEach((seg) => {
    const famKey = seg.dataset.family;
    const info = getFamilyInfo(famKey);

    seg.addEventListener('mouseenter', () => {
      dom.wheelLegendTitle.textContent = info.sector;
      dom.wheelLegendTitle.style.color = info.color;
      dom.wheelLegendSub.textContent = `${info.label} · 點擊篩選`;
    });

    seg.addEventListener('mouseleave', () => {
      syncWheelLegend();
    });

    seg.addEventListener('click', () => toggleFamilyFilter(famKey));
    seg.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFamilyFilter(famKey);
      }
    });
  });

  const centerBtn = dom.wheelSvg.querySelector('#wheel-center-btn');
  if (centerBtn) {
    centerBtn.addEventListener('click', () => {
      state.selectedFamily = null;
      applyFilters();
    });
    centerBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        state.selectedFamily = null;
        applyFilters();
      }
    });
  }

  syncWheelLegend();
}

function toggleFamilyFilter(familyKey) {
  state.selectedFamily = state.selectedFamily === familyKey ? null : familyKey;
  applyFilters();
}

function syncWheelLegend() {
  const segs = dom.wheelSvg.querySelectorAll('.wheel-segment');
  segs.forEach((seg) => {
    const fam = seg.dataset.family;
    seg.classList.toggle('is-active', state.selectedFamily === fam);
    seg.classList.toggle('is-dimmed', Boolean(state.selectedFamily && state.selectedFamily !== fam));
  });

  if (state.selectedFamily) {
    const info = getFamilyInfo(state.selectedFamily);
    dom.wheelLegendTitle.textContent = info.sector;
    dom.wheelLegendTitle.style.color = info.color;
    dom.wheelLegendSub.textContent = `${info.label}（篩選中）`;
  } else {
    dom.wheelLegendTitle.textContent = '全部領域';
    dom.wheelLegendTitle.style.color = '#f8fafc';
    dom.wheelLegendSub.textContent = '點擊色段篩選週期表';
  }
}

/* ==========================================================================
   篩選與搜尋邏輯（支援原子序、符號、中英文名、系統名稱、標籤與領域）
   ========================================================================== */
function matchesElement(el) {
  const project = state.projects[el.symbol] || null;
  const family = getFamilyInfo(el.family);

  if (state.litOnly && !project) return false;
  if (state.selectedFamily && el.family !== state.selectedFamily) return false;

  const q = state.searchQuery.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    String(el.number),
    el.symbol,
    el.nameZh,
    el.nameEn,
    family.label,
    family.sector,
    project?.shortName || '',
    project?.title || '',
    project?.subtitle || '',
    project?.description || '',
    project?.whyElement || '',
    ...(project?.tags || [])
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(q);
}

function applyFilters() {
  const hasFilter = Boolean(state.litOnly || state.selectedFamily || state.searchQuery.trim());
  let matchCount = 0;

  dom.periodicGrid.classList.toggle('is-family-filtered', Boolean(state.selectedFamily));

  dom.periodicGrid.querySelectorAll('.el-tile').forEach((tile) => {
    const el = state.elementsBySymbol.get(tile.dataset.symbol);
    const matched = el ? matchesElement(el) : false;
    if (matched) matchCount += 1;
    tile.classList.toggle('is-dimmed', hasFilter && !matched);
  });

  // 更新篩選狀態條
  if (hasFilter) {
    const parts = [];
    if (state.litOnly) parts.push('僅顯示已點亮系統');
    if (state.selectedFamily) {
      const fam = getFamilyInfo(state.selectedFamily);
      parts.push(`領域：${fam.sector}（${fam.label}）`);
    }
    if (state.searchQuery.trim()) parts.push(`關鍵字：「${state.searchQuery.trim()}」`);
    dom.filterBannerText.textContent = `目前篩選：${parts.join(' · ')} — 共符合 ${matchCount} 顆元素`;
    dom.filterBanner.classList.add('is-visible');
  } else {
    dom.filterBanner.classList.remove('is-visible');
  }

  dom.spotLitOnlyBtn.classList.toggle('is-active', state.litOnly);
  dom.spotLitOnlyBtn.setAttribute('aria-pressed', String(state.litOnly));
  dom.searchClearBtn.classList.toggle('is-visible', Boolean(state.searchQuery));

  syncWheelLegend();
  renderListView();
}

/* ==========================================================================
   清單視圖與手機版自動切換
   ========================================================================== */
function setViewMode(mode, isManual = false) {
  state.viewMode = mode;
  if (isManual) state.userToggledView = true;

  const isList = mode === 'list';
  dom.listView.classList.toggle('is-active', isList);
  dom.matrixView.classList.toggle('is-hidden', isList);

  dom.headerViewToggle.textContent = isList ? '🧬 週期表視圖' : '📋 清單視圖';
  dom.headerViewToggle.classList.toggle('is-active', isList);
  dom.headerViewToggle.setAttribute('aria-pressed', String(isList));

  if (isList) {
    renderListView();
  }
}

function renderListView() {
  const matched = state.elements.filter((el) => matchesElement(el));
  const litList = matched.filter((el) => Boolean(state.projects[el.symbol]));
  const dormantList = matched.filter((el) => !state.projects[el.symbol]);

  if (litList.length === 0) {
    dom.listFeaturedGrid.innerHTML = `
      <div class="list-project-card" style="--el-color: #38bdf8;">
        <div style="color: #94a3b8; font-size: 0.86rem;">
          目前篩選條件下無已點亮系統，可點擊「重置所有篩選」檢視全部元素。
        </div>
      </div>
    `;
  } else {
    dom.listFeaturedGrid.innerHTML = litList
      .map((el) => {
        const fam = getFamilyInfo(el.family);
        const proj = state.projects[el.symbol];
        const tagsHtml = (proj.tags || [])
          .map((t) => `<span class="spot-tag">${escapeHtml(t)}</span>`)
          .join('');
        return `
          <article class="list-project-card" style="--el-color: ${fam.color};">
            <div class="list-project-head">
              <div class="list-symbol-badge">
                <strong>${el.symbol}</strong>
                <span>#${el.number} ${el.nameZh}</span>
              </div>
              <div style="min-width: 0; flex: 1;">
                <div class="spot-badges">
                  <span class="status-pill is-live">● ${escapeHtml(proj.statusLabel || 'LIVE 上線中')}</span>
                  <span class="sector-pill">${escapeHtml(fam.sector)}</span>
                </div>
                <h3 class="spot-title" style="font-size: 1.04rem;">${escapeHtml(proj.title)}</h3>
                <div class="spot-subtitle">${escapeHtml(proj.subtitle || '')}</div>
              </div>
            </div>
            <p class="spot-desc">${escapeHtml(proj.description)}</p>
            ${
              proj.whyElement
                ? `<div class="spot-why" style="--spot-color: ${fam.color};">
                     <span class="spot-why-title">✦ 為何是 ${escapeHtml(el.symbol)}（${escapeHtml(el.nameZh)}）？</span>
                     <span class="spot-why-text">${escapeHtml(proj.whyElement)}</span>
                   </div>`
                : ''
            }
            <div class="spot-footer">
              <div class="spot-tags">${tagsHtml}</div>
              <a
                class="action-btn action-btn-primary"
                style="width: auto; flex: none; padding: 7px 14px;"
                href="${escapeHtml(buildLaunchUrl(proj.url))}"
                target="_blank"
                rel="noopener noreferrer"
              >
                前往系統 ↗
              </a>
            </div>
          </article>
        `;
      })
      .join('');
  }

  dom.listDormantHeading.textContent = `休眠元素一覽（${dormantList.length} 顆）`;

  dom.listDormantGrid.innerHTML = dormantList
    .map((el) => {
      const fam = getFamilyInfo(el.family);
      return `
        <button
          type="button"
          class="list-dormant-card"
          data-symbol="${el.symbol}"
          style="--el-color: ${fam.color};"
        >
          <span class="list-mini-sym">${el.symbol}</span>
          <span style="min-width: 0;">
            <div style="font-size: 0.82rem; font-weight: 700; color: #f8fafc;">#${el.number} ${el.nameZh}</div>
            <div style="font-size: 0.68rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${escapeHtml(fam.sector)}
            </div>
          </span>
        </button>
      `;
    })
    .join('');

  dom.listDormantGrid.querySelectorAll('.list-dormant-card').forEach((card) => {
    card.addEventListener('click', () => {
      const sym = card.dataset.symbol;
      state.lockedSymbol = sym;
      state.activeSymbol = sym;
      setViewMode('matrix', true);
      renderSpotlight();
      dom.spotlightCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}

/* ==========================================================================
   Phase 4：元素探勘區（Mining Zone）與雷達隨機探勘
   ========================================================================== */
function renderMiningZone() {
  dom.miningGrid.innerHTML = state.veins
    .map((vein) => {
      const clicks = Number(state.miningClicks[vein.id] || 0);
      const totalEnergy = vein.baseEnergy + clicks;
      const bonusProgress = Math.floor(clicks / 5);
      const effectiveProgress = Math.min(99, vein.progress + bonusProgress);

      return `
        <article class="vein-card" style="--vein-color: ${vein.color};">
          <div>
            <div class="vein-top">
              <span class="vein-codename">${escapeHtml(vein.codename)}</span>
              <span class="vein-stage">${escapeHtml(vein.stage)}</span>
            </div>
            <h3 class="vein-sector">${escapeHtml(vein.sector)}</h3>
            <p class="vein-hint">${escapeHtml(vein.hint)}</p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div class="vein-progress-wrap">
              <div class="vein-progress-meta">
                <span>開採純度</span>
                <strong>${effectiveProgress}%</strong>
              </div>
              <div class="vein-bar-track">
                <div class="vein-bar-fill" style="width: ${effectiveProgress}%;"></div>
              </div>
            </div>

            <div class="vein-footer">
              <span class="vein-energy">期待能量 <strong>${totalEnergy}</strong></span>
              <button
                type="button"
                class="mine-btn"
                data-vein-id="${escapeHtml(vein.id)}"
              >
                ⛏️ 敲礦集氣 +1
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  dom.miningGrid.querySelectorAll('.mine-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleMineClick(btn.dataset.veinId));
  });
}

function handleMineClick(veinId) {
  const vein = state.veins.find((v) => v.id === veinId);
  if (!vein) return;

  const prevClicks = Number(state.miningClicks[veinId] || 0);
  const nextClicks = prevClicks + 1;
  state.miningClicks[veinId] = nextClicks;
  saveMiningClicks(state.miningClicks);

  renderMiningZone();

  if (nextClicks % 5 === 0) {
    showToast(`⚡ ${vein.codename} 能量共鳴！開採純度微微推進 +1%（累積集氣 ${nextClicks} 次）`);
  } else {
    showToast(`⛏️ 已為「${vein.sector}」敲礦集氣 +1（期待能量 ${vein.baseEnergy + nextClicks}）`, 2200);
  }
}

function runRadarScan() {
  if (state.isRadarScanning) return;
  const dormant = state.elements.filter((el) => !state.projects[el.symbol]);
  if (dormant.length === 0) {
    showToast('🎉 所有 118 顆元素皆已點亮！');
    return;
  }

  // 若在清單視圖則先切換回週期表並重置過濾
  if (state.viewMode !== 'matrix') {
    setViewMode('matrix', true);
  }
  if (state.litOnly || state.selectedFamily || state.searchQuery) {
    state.litOnly = false;
    state.selectedFamily = null;
    state.searchQuery = '';
    dom.searchInput.value = '';
    applyFilters();
  }

  state.isRadarScanning = true;
  dom.radarScanBtn.disabled = true;
  dom.radarScanBtn.textContent = '📡 雷達掃描中...';

  dom.matrixView.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const totalSteps = 16;
  let step = 0;
  let lastTile = null;

  function tick() {
    if (lastTile) {
      lastTile.classList.remove('is-radar-ping');
    }

    const pick = dormant[Math.floor(Math.random() * dormant.length)];
    const tile = dom.periodicGrid.querySelector(`.el-tile[data-symbol="${pick.symbol}"]`);
    if (tile) {
      tile.classList.add('is-radar-ping');
      lastTile = tile;
    }

    step += 1;
    if (step < totalSteps) {
      const delay = 55 + step * 14;
      window.setTimeout(tick, delay);
    } else {
      window.setTimeout(() => {
        if (lastTile) lastTile.classList.remove('is-radar-ping');
        state.lockedSymbol = pick.symbol;
        state.activeSymbol = pick.symbol;
        state.isRadarScanning = false;
        dom.radarScanBtn.disabled = false;
        dom.radarScanBtn.textContent = '📡 雷達隨機探勘元素';
        renderSpotlight();
        dom.spotlightCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const fam = getFamilyInfo(pick.family);
        showToast(`📡 雷達鎖定候選座標：#${pick.number} ${pick.symbol}（${pick.nameZh} · ${fam.sector}）`);
      }, 260);
    }
  }

  tick();
}

/* ==========================================================================
   事件綁定與初始化
   ========================================================================== */
function bindEvents() {
  // 鎖定徽章：已鎖定時點擊解除，預覽時點擊鎖定
  dom.spotLockBadge.addEventListener('click', () => {
    if (state.lockedSymbol) {
      state.lockedSymbol = null;
      renderSpotlight();
      showToast('已解除鎖定，移動滑鼠即可自由預覽元素。', 2000);
    } else if (state.activeSymbol) {
      state.lockedSymbol = state.activeSymbol;
      renderSpotlight();
    }
  });

  // 前往系統按鈕：休眠元素點擊不跳轉並顯示 Toast
  dom.spotLaunchBtn.addEventListener('click', (evt) => {
    if (dom.spotLaunchBtn.dataset.live !== 'true') {
      evt.preventDefault();
      const el = state.elementsBySymbol.get(state.activeSymbol);
      showToast(`🧪 ${el ? `${el.nameZh}（${el.symbol}）` : '此元素'} 尚未上線，敬請期待後續點亮！`);
    }
  });

  // 只看已點亮
  dom.spotLitOnlyBtn.addEventListener('click', () => {
    state.litOnly = !state.litOnly;
    applyFilters();
  });

  // 清單視圖切換
  dom.spotListViewBtn.addEventListener('click', () => setViewMode('list', true));
  dom.headerViewToggle.addEventListener('click', () => {
    setViewMode(state.viewMode === 'list' ? 'matrix' : 'list', true);
  });
  dom.listBackMatrixBtn.addEventListener('click', () => setViewMode('matrix', true));

  // 即時搜尋
  dom.searchInput.addEventListener('input', (evt) => {
    state.searchQuery = evt.target.value;
    applyFilters();
  });

  dom.searchClearBtn.addEventListener('click', () => {
    state.searchQuery = '';
    dom.searchInput.value = '';
    dom.searchInput.focus();
    applyFilters();
  });

  // 重置所有篩選
  dom.filterResetBtn.addEventListener('click', () => {
    state.litOnly = false;
    state.selectedFamily = null;
    state.searchQuery = '';
    dom.searchInput.value = '';
    applyFilters();
  });

  // 雷達隨機探勘
  dom.radarScanBtn.addEventListener('click', runRadarScan);

  // ESC 鍵解除鎖定
  window.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape' && state.lockedSymbol) {
      state.lockedSymbol = null;
      hideHoverPill();
      renderSpotlight();
      showToast('已透過 ESC 解除元素鎖定。', 1800);
    }
  });

  // 主題三段切換控制（跟隨系統 / 深色 / 淺色）
  if (dom.themeSwitcher) {
    dom.themeSwitcher.querySelectorAll('.theme-seg-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        applyTheme(btn.dataset.themePref, true);
      });
    });
  }

  if (window.matchMedia) {
    const colorSchemeMq = window.matchMedia('(prefers-color-scheme: dark)');
    colorSchemeMq.addEventListener('change', () => {
      if (state.themePref === 'system') {
        applyTheme('system', false);
      }
    });
  }

  // 手機寬度 < 680px 自動切換清單視圖（僅在使用者未手動覆寫時）
  const mq = window.matchMedia('(max-width: 680px)');
  const applyResponsiveView = () => {
    if (!state.userToggledView) {
      setViewMode(mq.matches ? 'list' : 'matrix', false);
    }
  };
  applyResponsiveView();
  mq.addEventListener('change', applyResponsiveView);
}

/**
 * 讀取網址參數 ?el=...，若為合法元素符號（大小寫不敏感）則回傳標準符號，否則回傳 null
 */
function resolveUrlElementSymbol() {
  try {
    const raw = new URLSearchParams(window.location.search).get('el');
    if (!raw) return null;
    const query = raw.trim();
    if (state.elementsBySymbol.has(query)) return query;
    const lower = query.toLowerCase();
    const match = state.elements.find((el) => el.symbol.toLowerCase() === lower);
    return match ? match.symbol : null;
  } catch {
    return null;
  }
}

async function init() {
  cacheDom();
  const initialPref = document.documentElement.dataset.themePref || 'system';
  applyTheme(initialPref, false);
  initConstellation('constellation-canvas');
  state.miningClicks = loadMiningClicks();

  try {
    const [baseRes, projRes, veinsRes] = await Promise.all([
      fetch('data/periodic_base.json'),
      fetch('data/projects.json'),
      fetch('data/mining_veins.json')
    ]);

    if (!baseRes.ok || !projRes.ok || !veinsRes.ok) {
      throw new Error('資料檔載入失敗');
    }

    state.elements = await baseRes.json();
    state.projects = await projRes.json();
    state.veins = await veinsRes.json();

    state.elements.forEach((el) => state.elementsBySymbol.set(el.symbol, el));

    const litSymbols = Object.keys(state.projects).filter((s) => state.elementsBySymbol.has(s));
    dom.litCount.textContent = String(litSymbols.length);
    if (dom.veinCount) {
      dom.veinCount.textContent = String(state.veins.length);
    }
    if (dom.unlockProgressFill) {
      const pct = Math.min(100, Math.max(2, (litSymbols.length / 118) * 100));
      dom.unlockProgressFill.style.width = `${pct.toFixed(2)}%`;
    }

    // 網址參數 ?el=... 優先鎖定指定元素，否則預設鎖定 C（碳）
    const urlSym = resolveUrlElementSymbol();
    const defaultSym = urlSym || (state.projects.C ? 'C' : litSymbols[0] || 'C');
    state.lockedSymbol = defaultSym;
    state.activeSymbol = defaultSym;

    renderPeriodicGrid();
    renderFamilyWheel();
    renderSpotlight();
    renderMiningZone();
    bindEvents();

    // 由回航徽章帶入指定元素時：切回週期表視圖並捲動至資訊卡
    if (urlSym) {
      if (state.viewMode !== 'matrix') setViewMode('matrix', true);
      window.requestAnimationFrame(() => {
        dom.spotlightCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  } catch (err) {
    console.error('[Hao Element Matrix] 初始化錯誤：', err);
    showToast('⚠️ 無法載入元素資料，請確認以靜態伺服器開啟頁面。', 5000);
  }
}

document.addEventListener('DOMContentLoaded', init);
