// 吳承恩 Darien — Steam 商店頁介面版作品集（《已讀 READ》主視覺 × 8 尺寸工具 × 四季手繪證明）

// =========================================================
// 1. Steamworks 8 尺寸即時自動排版＋真 PNG 匯出工具
// =========================================================
const STEAM_SPECS = [
  { id: 'header',   name: '商店頁首 Header',   w: 920,  h: 430,  span: '',     logo: 'mid',  note: '商店頁與收藏庫共用頁首' },
  { id: 'main',     name: '首頁大圖 Main',     w: 1232, h: 706,  span: '',     logo: 'low',  note: '首頁精選與輪播主圖' },
  { id: 'small',    name: '搜尋小圖 Small',    w: 462,  h: 174,  span: '',     logo: 'fill', note: '縮到 120×45 字仍要清楚' },
  { id: 'bg',       name: '商店頁背景 BG',     w: 1438, h: 810,  span: '',     logo: null,   note: '降低對比、不搶文字閱讀', ambient: true },
  { id: 'vertical', name: '直式特賣 Vertical', w: 748,  h: 896,  span: '',     logo: 'low',  note: '特賣頁直式推薦位' },
  { id: 'library',  name: '收藏庫封面 Library',w: 600,  h: 900,  span: '',     logo: 'low',  note: '玩家遊戲庫 2:3 封面' },
  { id: 'logo',     name: '收藏庫 Logo',       w: 1280, h: 720,  span: 'full', logo: 'only', note: '透明底 PNG，疊於 Hero 上' },
  { id: 'hero',     name: '收藏庫主視覺 Hero', w: 3840, h: 1240, span: 'full', logo: null,   note: '官方規範：不可放文字，焦點避開左下 Logo 區' },
];

const PRESET_SOURCES = {
  sfw1: 'assets/sfw-1.webp',
  sfw3: 'assets/sfw-3.webp',
  sfw4: 'assets/sfw-4.webp',
  sfw5: 'assets/sfw-5.webp',
  sfw7: 'assets/sfw-7.webp',
  sfw8: 'assets/sfw-8.webp',
};

const SLICE_FOCAL = {
  sfw1: { fx: 0.55, fy: 0.27 },
  sfw5: { fx: 0.50, fy: 0.25 },
  sfw4: { fx: 0.48, fy: 0.26 },
  sfw8: { fx: 0.50, fy: 0.34 },
};

const loadedImgs = {};
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const toolState = {
  preset: 'four',
  customImg: null,
  title: '已讀',
  sub: 'READ',
  fx: 0.50,
  fy: 0.26,
  zoom: 1.22,
  safe: true,
};

function drawCoverFocal(ctx, img, dx, dy, dw, dh, fx, fy, zoom) {
  if (!img || !img.naturalWidth) return;
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const baseScale = Math.max(dw / iw, dh / ih) * zoom;
  const sw = iw * baseScale, sh = ih * baseScale;
  let ox = dx + dw * 0.5 - sw * fx;
  let oy = dy + dh * 0.34 - sh * fy;
  ox = Math.min(dx, Math.max(dx + dw - sw, ox));
  oy = Math.min(dy, Math.max(dy + dh - sh, oy));
  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.drawImage(img, ox, oy, sw, sh);
  ctx.restore();
}

function drawCapsule(canvas, spec, forExport = false) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (spec.logo === 'only') {
    drawTitleBlock(ctx, w, h, 'only');
    if (toolState.safe && !forExport) drawSafeOverlay(ctx, w, h, spec);
    return;
  }

  if (toolState.customImg) {
    drawCoverFocal(ctx, toolState.customImg, 0, 0, w, h, toolState.fx, toolState.fy, toolState.zoom);
  } else if (toolState.preset === 'four' && w / h > 1.35) {
    const keys = ['sfw1', 'sfw5', 'sfw4', 'sfw8'];
    const sliceW = w / 4;
    const dxShift = toolState.fx - 0.50;
    const dyShift = toolState.fy - 0.26;
    keys.forEach((k, i) => {
      const f = SLICE_FOCAL[k];
      drawCoverFocal(
        ctx,
        loadedImgs[k],
        i * sliceW,
        0,
        sliceW + 1,
        h,
        Math.min(0.85, Math.max(0.15, f.fx + dxShift)),
        Math.min(0.75, Math.max(0.10, f.fy + dyShift)),
        toolState.zoom
      );
      if (i > 0) {
        ctx.fillStyle = '#0e1722';
        ctx.fillRect(i * sliceW - Math.max(1, w * 0.002), 0, Math.max(2, w * 0.004), h);
      }
    });
  } else {
    const key = toolState.preset === 'four' ? 'sfw1' : toolState.preset;
    drawCoverFocal(ctx, loadedImgs[key], 0, 0, w, h, toolState.fx, toolState.fy, toolState.zoom);
  }

  if (spec.ambient) {
    ctx.fillStyle = 'rgba(20, 32, 46, 0.68)';
    ctx.fillRect(0, 0, w, h);
    const rg = ctx.createRadialGradient(w * 0.5, h * 0.4, w * 0.1, w * 0.5, h * 0.5, w * 0.65);
    rg.addColorStop(0, 'rgba(20, 32, 46, 0.12)');
    rg.addColorStop(1, 'rgba(13, 21, 31, 0.88)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h);
  }

  if (spec.logo) {
    const g = ctx.createLinearGradient(0, h * 0.26, 0, h);
    g.addColorStop(0, 'rgba(13, 21, 31, 0)');
    g.addColorStop(0.65, 'rgba(13, 21, 31, 0.56)');
    g.addColorStop(1, 'rgba(13, 21, 31, 0.92)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    drawTitleBlock(ctx, w, h, spec.logo);
  }

  if (toolState.safe && !forExport) drawSafeOverlay(ctx, w, h, spec);
}

function drawTitleBlock(ctx, w, h, mode) {
  const title = (toolState.title || '已讀').trim();
  const sub = (toolState.sub || '').trim();
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let size = mode === 'fill' ? h * 0.36 : mode === 'only' ? h * 0.26 : Math.min(w * 0.14, h * 0.22);
  ctx.font = `900 ${size}px "Noto Sans TC", "Microsoft JhengHei", sans-serif`;
  while (ctx.measureText(title).width > w * 0.84 && size > 12) {
    size *= 0.92;
    ctx.font = `900 ${size}px "Noto Sans TC", "Microsoft JhengHei", sans-serif`;
  }

  const y = mode === 'only' ? h * 0.46 : mode === 'mid' ? h * 0.72 : mode === 'fill' ? h * 0.54 : h * 0.79;

  ctx.shadowColor = 'rgba(0, 0, 0, 0.88)';
  ctx.shadowBlur = Math.max(6, size * 0.24);
  ctx.shadowOffsetY = Math.max(2, size * 0.05);

  ctx.lineWidth = Math.max(2.5, size * 0.09);
  ctx.strokeStyle = 'rgba(13, 21, 31, 0.95)';
  ctx.strokeText(title, w / 2, y);

  ctx.fillStyle = '#ffffff';
  ctx.fillText(title, w / 2, y);

  if (sub && mode !== 'fill') {
    const subSize = Math.max(10, size * 0.27);
    ctx.font = `700 ${subSize}px "JetBrains Mono", "Noto Sans TC", sans-serif`;
    ctx.fillStyle = '#66c0f4';
    ctx.fillText(sub, w / 2, y + size * 0.72);
  }
  ctx.restore();
}

function drawSafeOverlay(ctx, w, h, spec) {
  ctx.save();
  const padX = w * 0.06, padY = h * 0.08;
  ctx.strokeStyle = 'rgba(102, 192, 244, 0.75)';
  ctx.lineWidth = Math.max(1.5, w * 0.003);
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(padX, padY, w - padX * 2, h - padY * 2);

  if (spec.id === 'hero') {
    ctx.fillStyle = 'rgba(102, 192, 244, 0.22)';
    ctx.strokeStyle = '#66c0f4';
    const lx = w * 0.04, ly = h * 0.54, lw = w * 0.30, lh = h * 0.38;
    ctx.fillRect(lx, ly, lw, lh);
    ctx.strokeRect(lx, ly, lw, lh);
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.max(12, h * 0.046)}px "Noto Sans TC", sans-serif`;
    ctx.fillText('Logo 疊加區（Hero 不可有字）', lx + 12, ly + h * 0.14);
  }
  ctx.restore();
}

const capsGrid = document.getElementById('caps-grid');
const capCanvases = new Map();

// 頂部展示輪播用的 Main Capsule 畫布 ＋ 右側 Header Capsule 畫布
const heroCapWrap = document.getElementById('hero-cap-wrap');
const heroBigCanvas = document.createElement('canvas');
heroBigCanvas.width = 1232; heroBigCanvas.height = 706;
heroCapWrap.append(heroBigCanvas);

const glanceCap = document.getElementById('glance-cap');
const glanceCanvas = document.createElement('canvas');
glanceCanvas.width = 920; glanceCanvas.height = 430;
glanceCap.append(glanceCanvas);

const tinyCanvas = document.getElementById('tiny-check');

function buildCapsuleCards() {
  for (const spec of STEAM_SPECS) {
    const card = document.createElement('article');
    card.className = 'cap-card' + (spec.span ? ' ' + spec.span : '');

    const scale = Math.min(1, 900 / spec.w);
    const cv = document.createElement('canvas');
    cv.width = Math.round(spec.w * scale);
    cv.height = Math.round(spec.h * scale);

    const view = document.createElement('div');
    view.className = 'cap-view';
    view.append(cv);

    const info = document.createElement('div');
    info.className = 'cap-info';
    info.innerHTML = `<div><b>${spec.name}</b><small>${spec.w} × ${spec.h}px · ${spec.note}</small></div>`;

    const dlBtn = document.createElement('button');
    dlBtn.type = 'button';
    dlBtn.className = 'cap-dl';
    dlBtn.textContent = '匯出 PNG';
    dlBtn.addEventListener('click', () => exportRealPNG(spec));
    info.append(dlBtn);

    card.append(view, info);
    capsGrid.append(card);
    capCanvases.set(spec.id, { cv, spec });
  }
}

function exportRealPNG(spec) {
  const out = document.createElement('canvas');
  out.width = spec.w;
  out.height = spec.h;
  drawCapsule(out, spec, true);
  out.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `steam_${spec.id}_${spec.w}x${spec.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }, 'image/png');
}

function renderAllCapsules() {
  for (const { cv, spec } of capCanvases.values()) {
    drawCapsule(cv, spec, false);
  }
  drawCapsule(heroBigCanvas, STEAM_SPECS[1], true);
  drawCapsule(glanceCanvas, STEAM_SPECS[0], true);
  const smallObj = capCanvases.get('small');
  if (smallObj) {
    const tctx = tinyCanvas.getContext('2d');
    tctx.clearRect(0, 0, 120, 45);
    tctx.drawImage(smallObj.cv, 0, 0, 120, 45);
  }
}

buildCapsuleCards();

// =========================================================
// 2B. STEAM 頂部主視覺輪播切換
// =========================================================
const STAGE_ITEMS = [
  { type: 'canvas', thumb: 'assets/sfw-1.webp', label: '主視覺' },
  { type: 'img',    src: 'assets/sfw-1.webp',   thumb: 'assets/sfw-1.webp', label: '月台' },
  { type: 'img',    src: 'assets/sfw-5.webp',   thumb: 'assets/sfw-5.webp', label: '巷弄' },
  { type: 'img',    src: 'assets/sfw-3.webp',   thumb: 'assets/sfw-3.webp', label: '夜市' },
  { type: 'img',    src: 'assets/sfw-8.webp',   thumb: 'assets/sfw-8.webp', label: '深夜' },
  { type: 'video',  thumb: 'assets/video-reel-poster.webp', label: '▶ 影片集' },
];
const stageStrip = document.getElementById('stage-strip');
const stageImg = document.getElementById('stage-img');
const stageVid = document.getElementById('stage-vid');

function selectStage(idx) {
  const it = STAGE_ITEMS[idx];
  heroCapWrap.hidden = it.type !== 'canvas';
  stageImg.hidden = it.type !== 'img';
  stageVid.hidden = it.type !== 'video';
  if (it.type === 'img') stageImg.src = it.src;
  if (it.type === 'video') { stageVid.play().catch(() => {}); }
  else { stageVid.pause(); }
  stageStrip.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-pressed', i === idx));
}

STAGE_ITEMS.forEach((it, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.innerHTML = `<img src="${it.thumb}" alt="${it.label}"><span class="st-lbl">${it.label}</span>`;
  b.addEventListener('click', () => selectStage(i));
  stageStrip.append(b);
});
selectStage(0);

// 綁定工具控制項
document.getElementById('tool-presets').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-preset]');
  if (!b) return;
  toolState.preset = b.dataset.preset;
  toolState.customImg = null;
  document.querySelectorAll('#tool-presets button').forEach((x) => x.setAttribute('aria-pressed', x === b));
  renderAllCapsules();
});

const uploadInput = document.getElementById('tool-upload');
const dropzone = document.getElementById('tool-dropzone');
function handleCustomFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = async () => {
    const img = await loadImage(reader.result);
    if (img) {
      toolState.customImg = img;
      document.querySelectorAll('#tool-presets button').forEach((x) => x.setAttribute('aria-pressed', 'false'));
      renderAllCapsules();
    }
  };
  reader.readAsDataURL(file);
}
uploadInput.addEventListener('change', () => handleCustomFile(uploadInput.files[0]));
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag'));
dropzone.addEventListener('drop', (e) => {
  e.preventDefault(); dropzone.classList.remove('drag');
  handleCustomFile(e.dataTransfer.files[0]);
});

document.getElementById('tool-title').addEventListener('input', (e) => { toolState.title = e.target.value; renderAllCapsules(); });
document.getElementById('tool-sub').addEventListener('input', (e) => { toolState.sub = e.target.value; renderAllCapsules(); });
document.getElementById('tool-fx').addEventListener('input', (e) => {
  toolState.fx = Number(e.target.value) / 100;
  document.getElementById('val-fx').textContent = e.target.value + '%';
  renderAllCapsules();
});
document.getElementById('tool-fy').addEventListener('input', (e) => {
  toolState.fy = Number(e.target.value) / 100;
  document.getElementById('val-fy').textContent = e.target.value + '%';
  renderAllCapsules();
});
document.getElementById('tool-zoom').addEventListener('input', (e) => {
  toolState.zoom = Number(e.target.value) / 100;
  document.getElementById('val-zoom').textContent = toolState.zoom.toFixed(2) + '×';
  renderAllCapsules();
});
document.getElementById('tool-safe').addEventListener('change', (e) => {
  toolState.safe = e.target.checked;
  renderAllCapsules();
});

Promise.all(Object.entries(PRESET_SOURCES).map(async ([k, src]) => {
  loadedImgs[k] = await loadImage(src);
})).then(() => {
  renderAllCapsules();
  document.fonts?.ready.then(renderAllCapsules);
});

// =========================================================
// 3. 四語系特賣 Banner 切換
// =========================================================
const BANNER_DATA = {
  winter: {
    label: '冬季特賣', bg: 'assets/sfw-1.webp', pos: '78% 22%', badge: '-60%',
    copy: {
      'zh-Hant': { k: 'STEAM WINTER SALE', big: '冬季特賣', small: '全系列最低 4 折起' },
      'zh-Hans': { k: 'STEAM WINTER SALE', big: '冬季特卖', small: '全系列低至 4 折' },
      'en':      { k: 'STEAM WINTER SALE', big: 'WINTER SALE', small: 'UP TO 60% OFF CATALOG' },
      'ja':      { k: 'STEAM WINTER SALE', big: 'ウィンターセール', small: '最大 60% OFF 開催中' },
    },
  },
  nextfest: {
    label: '新品節試玩', bg: 'assets/sfw-5.webp', pos: '72% 20%', badge: 'DEMO',
    copy: {
      'zh-Hant': { k: 'STEAM NEXT FEST', big: '免費試玩版開放', small: '立即加入願望清單，發售日搶先通知' },
      'zh-Hans': { k: 'STEAM NEXT FEST', big: '免费试玩版开放', small: '立即添加愿望单，发售日抢先通知' },
      'en':      { k: 'STEAM NEXT FEST', big: 'PLAY THE FREE DEMO', small: 'WISHLIST NOW FOR LAUNCH DAY' },
      'ja':      { k: 'STEAM NEXT FEST', big: '体験版 配信中', small: 'ウィッシュリスト登録受付中' },
    },
  },
  publisher: {
    label: '發行商特賣', bg: 'assets/sfw-8.webp', pos: '75% 32%', badge: 'BUNDLE',
    copy: {
      'zh-Hant': { k: 'PUBLISHER WEEKEND', big: '發行商週年慶', small: '人氣作品組合包限時加碼優惠' },
      'zh-Hans': { k: 'PUBLISHER WEEKEND', big: '发行商周年庆', small: '人气作品捆绑包限时加码优惠' },
      'en':      { k: 'PUBLISHER WEEKEND', big: 'PUBLISHER SALE', small: 'BUNDLE & SAVE ALL WEEKEND' },
      'ja':      { k: 'PUBLISHER WEEKEND', big: 'パブリッシャーセール', small: '人気タイトル期間限定バンドル' },
    },
  },
};
const LANGS = [['zh-Hant', '繁中'], ['zh-Hans', '簡中'], ['en', 'English'], ['ja', '日本語']];
let curLang = 'zh-Hant', curTheme = 'winter';

const langBtns = document.getElementById('lang-btns');
const themeBtns = document.getElementById('theme-btns');
const saleBanner = document.getElementById('sale-banner');

function renderBanner() {
  const th = BANNER_DATA[curTheme];
  const cp = th.copy[curLang];
  saleBanner.dataset.theme = curTheme;
  saleBanner.lang = curLang;
  const bgImg = saleBanner.querySelector('.sale-bg');
  bgImg.src = th.bg;
  bgImg.style.objectPosition = th.pos;
  document.getElementById('sale-kicker').textContent = cp.k;
  document.getElementById('sale-big').textContent = cp.big;
  document.getElementById('sale-small').textContent = cp.small;
  document.getElementById('sale-badge').textContent = th.badge;
  langBtns.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === curLang));
  themeBtns.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === curTheme));
}

LANGS.forEach(([code, label]) => {
  const b = document.createElement('button');
  b.type = 'button'; b.dataset.v = code; b.textContent = label;
  b.addEventListener('click', () => { curLang = code; renderBanner(); });
  langBtns.append(b);
});
Object.entries(BANNER_DATA).forEach(([id, th]) => {
  const b = document.createElement('button');
  b.type = 'button'; b.dataset.v = id; b.textContent = th.label;
  b.addEventListener('click', () => { curTheme = id; renderBanner(); });
  themeBtns.append(b);
});
renderBanner();

// =========================================================
// 4. 《已讀》互動試玩
// =========================================================
window.addEventListener('DOMContentLoaded', () => {
  const S = window.STORY;
  if (!S) return;
  const phone = document.getElementById('phone');
  let save = { last: 'none', history: [] };
  try { save = JSON.parse(localStorage.getItem('mp-read-save')) || save; } catch {}
  const keep = () => { try { localStorage.setItem('mp-read-save', JSON.stringify(save)); } catch {} };
  let run = null, timer = null;
  const NAMES = { none: '（尚未通關）', meet: '下個月見', miss: '錯過', read: '已讀' };

  function showState() {
    document.getElementById('state').innerHTML =
      `<dt>上一輪結局</dt><dd>${NAMES[save.last]}</dd>` +
      `<dt>累計通關</dt><dd>${save.history.length} 輪</dd>` +
      (run ? `<dt>親近值</dt><dd>${run.near}</dd><dt>疏離值</dt><dd>${run.far}</dd>` : '');
  }
  function screen(html) { clearTimeout(timer); phone.innerHTML = html; }
  function opening() {
    run = null;
    const o = S.openings[save.last];
    screen(`<div class="ph-scene"><img src="${o.img}" alt=""></div>
      <div class="ph-open"><p>${o.text}</p><button type="button" class="ph-btn" id="go">開始試玩</button></div>`);
    phone.querySelector('#go').addEventListener('click', () => { run = { near: 0, far: 0 }; node(S.start); });
    showState();
  }
  function node(id) {
    const n = S.nodes[id];
    const msgs = [...n.msgs];
    const v = n.text_variants?.find((x) => x.when === save.last);
    if (v) msgs[0] = v.msg;
    screen(`<div class="ph-top"><img src="assets/read-icon.webp" alt=""><b>${S.who}</b></div>
      <div class="ph-scene small"><img src="${n.img}" alt=""></div>
      <div class="ph-chat"></div><div class="ph-choices"></div>`);
    const chat = phone.querySelector('.ph-chat'), box = phone.querySelector('.ph-choices');
    let i = 0;
    const step = () => {
      if (i < msgs.length) {
        chat.insertAdjacentHTML('beforeend', `<p class="bub">${msgs[i++]}</p>`);
        chat.scrollTop = chat.scrollHeight;
        timer = setTimeout(step, 520);
        return;
      }
      const valid = n.choices.filter((c) => !c.requires || (c.requires === 'near >= 2' && run.near >= 2));
      for (const c of valid) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'ph-btn'; b.textContent = c.label;
        b.addEventListener('click', () => {
          run.near += c.near || 0; run.far += c.far || 0;
          box.innerHTML = '';
          chat.insertAdjacentHTML('beforeend', c.silent ? `<p class="seen">已讀</p>` : `<p class="bub me">${c.label}</p>`);
          chat.scrollTop = chat.scrollHeight;
          showState();
          timer = setTimeout(() => (S.nodes[c.next] ? node(c.next) : ending(c.next === 'auto' ? S.auto(run) : c.next)), 580);
        });
        box.append(b);
      }
    };
    step();
    showState();
  }
  function ending(id) {
    const e = S.endings[id];
    save.last = id; save.history.push(id); keep();
    screen(`<div class="ph-end"><small>ENDING</small><h4>${e.title}</h4><p>${e.text}</p>
      <p class="ph-note">已寫入本機存檔，再玩一次開場與台詞會改變。</p>
      <button type="button" class="ph-btn" id="again">回到開場</button></div>`);
    phone.querySelector('#again').addEventListener('click', opening);
    run = null; showState();
  }
  document.getElementById('wipe').addEventListener('click', () => { save = { last: 'none', history: [] }; keep(); opening(); });
  opening();
});

// =========================================================
// 5. 燈箱放大檢視（支援《已讀》場景與四季純手繪原畫）
// =========================================================
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
document.querySelectorAll('[data-zoom-group]').forEach((group) => {
  group.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    const img = btn?.querySelector('img');
    if (!img) return;
    lbImg.src = img.src;
    lbImg.alt = img.alt || '';
    lb.showModal();
  });
});
document.getElementById('lb-close').addEventListener('click', () => lb.close());
lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
