/**
 * 晧脈元素庫 · Hao Element Matrix — 回航徽章 Web Component
 * 純原生、零依賴；部署網址：https://hao-element-matrix.pages.dev/badge.js
 *
 * 用法：
 *   <script src="https://hao-element-matrix.pages.dev/badge.js" defer></script>
 *   <hao-element-badge symbol="O" theme="dark" compact="false"></hao-element-badge>
 *
 * 屬性：
 *   symbol  元素符號（如 C / O / Ti），預設 C
 *   theme   dark（深色底）| light（淺色底），預設 dark
 *   compact true 時僅顯示迷你元素方塊與 ↗，預設 false
 */
(() => {
  'use strict';

  const TAG_NAME = 'hao-element-badge';
  const MATRIX_URL = 'https://hao-element-matrix.pages.dev/';
  const BRAND_NAME = '晧脈元素庫';

  if (typeof window === 'undefined' || !window.customElements || window.customElements.get(TAG_NAME)) {
    return;
  }

  // 10 大化學族主題色（與主站一致）
  const FAMILY_COLORS = {
    n: '#00e676', // 活性非金屬
    a: '#ff5252', // 鹼金屬
    e: '#ffab40', // 鹼土金屬
    t: '#40c4ff', // 過渡金屬
    p: '#536dfe', // 貧金屬
    m: '#69f0ae', // 類金屬
    h: '#ffd740', // 鹵素
    g: '#e040fb', // 惰性氣體
    l: '#ff6e40', // 鑭系元素
    c: '#b388ff'  // 錒系元素
  };

  // 已點亮元素專屬主題色（覆寫族色）
  const CUSTOM_COLORS = {
    C: '#00e676',
    O: '#38bdf8',
    Ti: '#40c4ff'
  };

  // 118 元素：符號:中文名:族代碼（依原子序排列）
  const RAW_ELEMENTS =
    'H:氫:n He:氦:g Li:鋰:a Be:鈹:e B:硼:m C:碳:n N:氮:n O:氧:n F:氟:h Ne:氖:g ' +
    'Na:鈉:a Mg:鎂:e Al:鋁:p Si:矽:m P:磷:n S:硫:n Cl:氯:h Ar:氬:g K:鉀:a Ca:鈣:e ' +
    'Sc:鈧:t Ti:鈦:t V:釩:t Cr:鉻:t Mn:錳:t Fe:鐵:t Co:鈷:t Ni:鎳:t Cu:銅:t Zn:鋅:t ' +
    'Ga:鎵:p Ge:鍺:m As:砷:m Se:硒:n Br:溴:h Kr:氪:g Rb:銣:a Sr:鍶:e Y:釔:t Zr:鋯:t ' +
    'Nb:鈮:t Mo:鉬:t Tc:鎝:t Ru:釕:t Rh:銠:t Pd:鈀:t Ag:銀:t Cd:鎘:t In:銦:p Sn:錫:p ' +
    'Sb:銻:m Te:碲:m I:碘:h Xe:氙:g Cs:銫:a Ba:鋇:e La:鑭:l Ce:鈰:l Pr:鐠:l Nd:釹:l ' +
    'Pm:鉕:l Sm:釤:l Eu:銪:l Gd:釓:l Tb:鋱:l Dy:鏑:l Ho:鈥:l Er:鉺:l Tm:銩:l Yb:鐿:l ' +
    'Lu:鎦:l Hf:鉿:t Ta:鉭:t W:鎢:t Re:錸:t Os:鋨:t Ir:銥:t Pt:鉑:t Au:金:t Hg:汞:t ' +
    'Tl:鉈:p Pb:鉛:p Bi:鉍:p Po:釙:p At:砈:h Rn:氡:g Fr:鍅:a Ra:鐳:e Ac:錒:c Th:釷:c ' +
    'Pa:鏷:c U:鈾:c Np:錼:c Pu:鈽:c Am:鋂:c Cm:鋦:c Bk:鉳:c Cf:鉲:c Es:鑀:c Fm:鐨:c ' +
    'Md:鍆:c No:鍩:c Lr:鐒:c Rf:鑪:t Db:𨧀:t Sg:𨭎:t Bh:𨨏:t Hs:𨭆:t Mt:䥑:t Ds:鐽:t ' +
    'Rg:錀:t Cn:鎶:t Nh:鉨:p Fl:鈇:p Mc:鏌:p Lv:鉝:p Ts:鿬:h Og:鿫:g';

  const ELEMENTS = {};
  const LOWER_INDEX = {};
  RAW_ELEMENTS.split(' ').forEach((token, idx) => {
    const [symbol, nameZh, fam] = token.split(':');
    ELEMENTS[symbol] = {
      number: idx + 1,
      symbol,
      nameZh,
      color: CUSTOM_COLORS[symbol] || FAMILY_COLORS[fam] || '#38bdf8'
    };
    LOWER_INDEX[symbol.toLowerCase()] = symbol;
  });

  function resolveSymbol(input) {
    const raw = String(input || '').trim();
    if (ELEMENTS[raw]) return raw;
    return LOWER_INDEX[raw.toLowerCase()] || 'C';
  }

  function shouldKeepFavicon(hostEl) {
    if (hostEl.getAttribute('data-keep-favicon') === 'true') return true;
    if (typeof document === 'undefined') return true;
    if (document.documentElement?.getAttribute('data-keep-favicon') === 'true') return true;
    if (document.body?.getAttribute('data-keep-favicon') === 'true') return true;
    return Boolean(document.querySelector('link[rel*="icon"][data-keep-favicon="true"]'));
  }

  function applyElementFavicon(el) {
    if (typeof document === 'undefined' || !document.head) return;
    const fontSize = el.symbol.length > 1 ? 14 : 17;
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
      `<rect x="1.5" y="1.5" width="29" height="29" rx="7" fill="#080d1a" stroke="${el.color}" stroke-width="2.2"/>` +
      `<text x="16" y="16.8" text-anchor="middle" dominant-baseline="central" ` +
      `fill="#ffffff" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="${fontSize}">${el.symbol}</text>` +
      `</svg>`;
    const href = `data:image/svg+xml,${encodeURIComponent(svg)}`;

    let iconLink = document.head.querySelector('link[rel="icon"][type="image/svg+xml"]');
    if (!iconLink) {
      iconLink = document.head.querySelector('link[rel="icon"]') || document.createElement('link');
      iconLink.rel = 'icon';
      iconLink.type = 'image/svg+xml';
      if (!iconLink.parentNode) {
        document.head.appendChild(iconLink);
      }
    }
    iconLink.href = href;
  }

  const STYLE = `
    *, *::before, *::after {
      box-sizing: border-box;
    }

    :host {
      display: inline-block;
      vertical-align: middle;
      line-height: 1;
      font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, -apple-system, sans-serif;
      --hb-color: #00e676;
      --hb-bg: rgba(8, 13, 26, 0.88);
      --hb-border: color-mix(in srgb, var(--hb-color) 48%, rgba(148, 163, 184, 0.32));
      --hb-text: #f1f5f9;
      --hb-sub: #94a3b8;
      --hb-cube-bg: #070c18;
      --hb-cube-text: #ffffff;
      --hb-shadow: 0 6px 18px rgba(0, 0, 0, 0.42);
    }

    :host([hidden]) { display: none; }

    :host([theme="light"]) {
      --hb-bg: rgba(255, 255, 255, 0.94);
      --hb-border: color-mix(in srgb, var(--hb-color) 56%, rgba(15, 23, 42, 0.18));
      --hb-text: #0f172a;
      --hb-sub: #475569;
      --hb-cube-bg: #0f172a;
      --hb-cube-text: #ffffff;
      --hb-shadow: 0 4px 14px rgba(15, 23, 42, 0.12);
    }

    a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 36px;
      padding: 4px 13px 4px 4px;
      border-radius: 999px;
      background: var(--hb-bg);
      border: 1px solid var(--hb-border);
      box-shadow: var(--hb-shadow);
      color: var(--hb-text);
      text-decoration: none;
      white-space: nowrap;
      overflow: hidden;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
    }

    a:hover {
      border-color: var(--hb-color);
      transform: translateY(-1px);
      box-shadow:
        var(--hb-shadow),
        0 0 16px color-mix(in srgb, var(--hb-color) 38%, transparent);
    }

    a:focus-visible {
      outline: 2px solid var(--hb-color);
      outline-offset: 2px;
    }

    :host([compact="true"]) a {
      padding: 4px 9px 4px 4px;
      gap: 5px;
    }

    /* 固定 28px × 28px 圓角微光框，完整置中於膠囊內不溢出 */
    .stage {
      width: 28px;
      height: 28px;
      flex: 0 0 28px;
      border-radius: 8px;
      background: linear-gradient(
        155deg,
        color-mix(in srgb, var(--hb-color) 30%, var(--hb-cube-bg)),
        var(--hb-cube-bg)
      );
      border: 1.2px solid var(--hb-color);
      box-shadow:
        0 0 10px color-mix(in srgb, var(--hb-color) 42%, transparent),
        inset 0 0 8px color-mix(in srgb, var(--hb-color) 20%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      perspective: 260px;
      overflow: hidden;
      position: relative;
    }

    .cube {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      animation: hb-spin 7.5s linear infinite;
    }

    a:hover .cube {
      animation-play-state: paused;
    }

    .face {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--hb-cube-text);
      font-weight: 900;
      line-height: 1;
      text-shadow: 0 0 8px color-mix(in srgb, var(--hb-color) 82%, transparent);
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      user-select: none;
    }

    .front {
      font-size: 12.5px;
      letter-spacing: -0.02em;
      transform: translateZ(1px);
    }

    .back {
      font-size: 13.5px;
      transform: rotateY(180deg) translateZ(1px);
    }

    .label {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12.5px;
      font-weight: 700;
      letter-spacing: 0.02em;
      line-height: 1;
    }

    .arrow {
      font-size: 11px;
      color: var(--hb-color);
      font-weight: 800;
    }

    :host([theme="light"]) .arrow {
      color: color-mix(in srgb, var(--hb-color) 70%, #0f172a);
    }

    :host([compact="true"]) .label-text {
      display: none;
    }

    @keyframes hb-spin {
      from { transform: rotateX(6deg) rotateY(0deg); }
      to { transform: rotateX(6deg) rotateY(360deg); }
    }

    @media (prefers-reduced-motion: reduce) {
      .cube { animation: none; transform: none; }
      a { transition: none; }
      a:hover { transform: none; }
    }
  `;

  class HaoElementBadge extends HTMLElement {
    static get observedAttributes() {
      return ['symbol', 'theme', 'compact'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>${STYLE}</style>
        <a part="badge" target="_blank" rel="noopener noreferrer">
          <span class="stage" aria-hidden="true">
            <span class="cube">
              <span class="face front"></span>
              <span class="face back"></span>
            </span>
          </span>
          <span class="label">
            <span class="label-text">${BRAND_NAME}</span>
            <span class="arrow" aria-hidden="true">↗</span>
          </span>
        </a>
      `;
      this._link = this.shadowRoot.querySelector('a');
      this._front = this.shadowRoot.querySelector('.front');
      this._back = this.shadowRoot.querySelector('.back');
    }

    connectedCallback() {
      this._render();
    }

    attributeChangedCallback() {
      this._render();
    }

    _render() {
      if (!this._link) return;
      const symbol = resolveSymbol(this.getAttribute('symbol'));
      const el = ELEMENTS[symbol];

      this.style.setProperty('--hb-color', el.color);
      this._front.textContent = el.symbol;
      this._back.textContent = el.nameZh;
      this._link.href = `${MATRIX_URL}?el=${encodeURIComponent(el.symbol)}`;

      const desc = `所屬矩陣：${BRAND_NAME} · 元素 ${el.symbol}（${el.nameZh}），第 ${el.number} 號`;
      this._link.title = desc;
      this._link.setAttribute('aria-label', `${desc}（開新分頁）`);

      if (!shouldKeepFavicon(this)) {
        applyElementFavicon(el);
      }
    }
  }

  window.customElements.define(TAG_NAME, HaoElementBadge);
})();
