// Порт setupReport() из index.html:1391–1457 (легаси x-dc Component,
// componentDidMount). Живой хук — см. header-комментарий Pain.astro
// (в отличие от setupPipe() в Hero.astro, который мёртвый код).
//
// Два режима, оба портированы 1:1:
//
// Desktop (matchMedia('(hover: none)').matches === false):
//  - mousemove по [data-report]: [data-report-true] получает opacity=1 и
//    круглую маску-прожектор (mask-image: radial-gradient, диаметр 150px,
//    центр = курсор относительно карточки), [data-report-ring] следует за
//    курсором (left/top = координаты курсора, opacity=1), [data-report-status]
//    меняет текст на '● the real picture'.
//  - mouseleave: true-слой и кольцо гаснут (opacity=0), статус возвращается
//    к '● goals met'.
//
// Touch (matchMedia('(hover: none)').matches === true) — принципиально другой
// сценарий, НЕ просто desktop без hover: весь true-слой сразу видим на весь
// экран (opacity=1, маска снята), а поверх карточки динамически создаются три
// DOM-узла (полоса-разделитель, широкая hit-зона 58px, "рукоятка"-кружок с
// CSS-анимацией rk-nudge, см. @keyframes в Storefront.astro — имя не
// скоуп-переименовывается Astro, поэтому работает и отсюда), которые двигают
// clip-path true-слоя через pointer-events (setPointerCapture). Статус
// переключается по порогу P<0.92. Хинт (соседний элемент после [data-report]
// в разметке, см. .rk-pain-hint в Pain.astro) получает ЖЁСТКО ЗАШИТУЮ
// русскую строку — это легаси-баг/особенность (support.js не смотрит на
// текущий язык при подмене этого текста), сохранён как есть — не наша отсебятина.
function setupReportDesktop(card: HTMLElement, trueLayer: HTMLElement, ring: HTMLElement | null, status: HTMLElement | null): void {
  const R = 150; // диаметр прожектора
  const setMask = (x: number, y: number) => {
    const m = `radial-gradient(circle ${R / 2}px at ${x}px ${y}px, #000 60%, transparent 72%)`;
    trueLayer.style.webkitMaskImage = m;
    trueLayer.style.maskImage = m;
  };
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    trueLayer.style.opacity = '1';
    setMask(x, y);
    if (ring) {
      ring.style.opacity = '1';
      ring.style.left = `${x}px`;
      ring.style.top = `${y}px`;
    }
    if (status) status.textContent = '● the real picture';
  });
  card.addEventListener('mouseleave', () => {
    trueLayer.style.opacity = '0';
    if (ring) ring.style.opacity = '0';
    if (status) status.textContent = '● goals met';
  });
}

function setupReportTouch(card: HTMLElement, trueLayer: HTMLElement, ring: HTMLElement | null, status: HTMLElement | null): void {
  card.style.cursor = 'ew-resize';
  if (ring) ring.style.display = 'none';
  trueLayer.style.opacity = '1';
  trueLayer.style.webkitMaskImage = 'none';
  trueLayer.style.maskImage = 'none';

  const hint = card.nextElementSibling as HTMLElement | null;
  if (hint) hint.textContent = 'Тяните за кружок ← дашборд покажет реальные цифры.';

  const bar = document.createElement('div');
  bar.style.cssText =
    'position:absolute;top:0;bottom:0;width:2px;background:#F0653F;z-index:6;pointer-events:none;box-shadow:0 0 16px rgba(240,101,63,.6);';
  const hit = document.createElement('div');
  hit.style.cssText =
    'position:absolute;top:0;bottom:0;width:58px;transform:translateX(-29px);z-index:7;touch-action:none;cursor:ew-resize;';
  const grip = document.createElement('div');
  grip.style.cssText =
    'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:46px;height:46px;border-radius:50%;background:#F0653F;box-shadow:0 6px 20px rgba(240,101,63,.55);display:flex;align-items:center;justify-content:center;color:#fff;font-size:17px;animation:rk-nudge 2.2s ease-in-out infinite;';
  grip.textContent = '⇆';
  hit.appendChild(grip);
  card.appendChild(bar);
  card.appendChild(hit);

  let P = 0.6;
  const apply = () => {
    const pct = `${(P * 100).toFixed(1)}%`;
    trueLayer.style.setProperty('-webkit-clip-path', `inset(0 0 0 ${pct})`);
    trueLayer.style.clipPath = `inset(0 0 0 ${pct})`;
    bar.style.left = pct;
    hit.style.left = pct;
    if (status) status.textContent = P < 0.92 ? '● the real picture' : '● goals met';
  };
  apply();

  const fromX = (clientX: number) => {
    const r = card.getBoundingClientRect();
    const v = (clientX - r.left) / r.width;
    P = Math.max(0, Math.min(1, v));
    apply();
    grip.style.animation = 'none';
    if (hint) hint.style.opacity = '0.55';
  };

  let pid: number | null = null;
  hit.addEventListener('pointerdown', (e) => {
    pid = e.pointerId;
    try {
      hit.setPointerCapture(pid);
    } catch {
      // ignore — как в легаси, pointer capture может бросить исключение
      // (например, если pointerId уже невалиден), это не критично
    }
    fromX(e.clientX);
    e.preventDefault();
  });
  hit.addEventListener('pointermove', (e) => {
    if (pid !== null) {
      fromX(e.clientX);
      e.preventDefault();
    }
  });
  const end = () => {
    pid = null;
  };
  hit.addEventListener('pointerup', end);
  hit.addEventListener('pointercancel', end);
}

export function initReport(): void {
  const card = document.querySelector<HTMLElement>('[data-report]');
  if (!card) return;
  const trueLayer = card.querySelector<HTMLElement>('[data-report-true]');
  if (!trueLayer) return;
  const ring = card.querySelector<HTMLElement>('[data-report-ring]');
  const status = card.querySelector<HTMLElement>('[data-report-status]');

  const touch = matchMedia('(hover: none)').matches;
  if (touch) {
    setupReportTouch(card, trueLayer, ring, status);
  } else {
    setupReportDesktop(card, trueLayer, ring, status);
  }
}
