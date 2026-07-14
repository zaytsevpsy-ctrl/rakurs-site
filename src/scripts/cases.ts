// Порт setupScrub() из index.html:1339–1360 (легаси x-dc Component,
// componentDidMount) + реимплементация переключения кейсов (в легаси это было
// не отдельным vanilla-скриптом, а реактивным onClick → this.setState({
// caseIndex, scrub: 0.28 }) внутри renderVals(), index.html:1636 — см.
// header-комментарий Cases.astro).
//
// setupScrub 1:1:
//  - down (mousedown/touchstart) + move (mousemove/touchmove, пока dragging) +
//    up (mouseup/touchend) на панели: v = clamp01((clientX - rect.left) / rect.width),
//    затем это применяется к [data-scrub] реактивным re-render'ом легаси —
//    здесь применяется императивно к трём узлам, которые в легаси-шаблоне были
//    забинжены на scrub/scrubPct (index.html:842,847): clip-path .rk-case-after
//    и left .rk-case-divider на scrubPct = round(v*100)+'%', и hint (opacity=0
//    при драге).
//  - ЕДИНСТВЕННОЕ отличие от 1:1: легаси вешал слушатели прямо на
//    [data-scrub-panel] (единственная панель существовала в момент времени —
//    реактивный рендер уничтожал/пересоздавал DOM при смене кейса). Здесь все
//    6 панелей существуют в DOM одновременно (Task 9), поэтому слушатели
//    подвешены с делегированием на общий контейнер .rk-case-panels; скрытые
//    панели (display:none) физически не получают mousedown/touchstart, так что
//    поведение идентично — драг работает только на видимой (активной) панели.
//
// Переключение кейсов (НЕ легаси-верифицированный vanilla-код, контракт из
// header-комментария Cases.astro): клик по [data-case-tab="i"] переключает
// .is-active на таб i и на [data-case-panel="i"], остальные гасятся. Как и в
// легаси select() (index.html:1636: `setState({caseIndex:i, scrub:0.28})`),
// при АКТИВАЦИИ любой панели (в т.ч. повторный клик по уже активному табу)
// scrub сбрасывается на 0.28 (28%) — включая возврат hint'а в видимое
// состояние (в легаси это происходило само собой: реактивный ре-рендер
// пересоздавал DOM без унаследованного opacity:0).

const RESET_SCRUB_PCT = '28%';

function applyScrubPct(curtain: HTMLElement, pct: string, hideHint: boolean): void {
  const after = curtain.querySelector<HTMLElement>('.rk-case-after');
  const divider = curtain.querySelector<HTMLElement>('.rk-case-divider');
  const hint = curtain.querySelector<HTMLElement>('.rk-case-hint');
  if (after) after.style.clipPath = `inset(0 0 0 ${pct})`;
  if (divider) divider.style.left = pct;
  if (hint) hint.style.opacity = hideHint ? '0' : '';
}

function updateScrub(curtain: HTMLElement, clientX: number): void {
  const r = curtain.getBoundingClientRect();
  const v = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
  applyScrubPct(curtain, `${Math.round(v * 100)}%`, true);
}

function resetScrub(curtain: HTMLElement): void {
  applyScrubPct(curtain, RESET_SCRUB_PCT, false);
}

function clientXOf(e: MouseEvent | TouchEvent): number | null {
  if ('touches' in e) {
    const t = e.touches[0];
    return t ? t.clientX : null;
  }
  return e.clientX;
}

function setupScrub(panelsWrap: HTMLElement): void {
  let draggingCurtain: HTMLElement | null = null;

  const down = (e: MouseEvent | TouchEvent) => {
    const target = e.target as HTMLElement | null;
    const curtain = target?.closest<HTMLElement>('.rk-case-curtain') ?? null;
    if (!curtain) return;
    draggingCurtain = curtain;
    const x = clientXOf(e);
    if (x !== null) updateScrub(curtain, x);
  };
  const move = (e: MouseEvent | TouchEvent) => {
    if (!draggingCurtain) return;
    const x = clientXOf(e);
    if (x !== null) updateScrub(draggingCurtain, x);
  };
  const up = () => {
    draggingCurtain = null;
  };

  panelsWrap.addEventListener('mousedown', down);
  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', up);
  panelsWrap.addEventListener('touchstart', down, { passive: true });
  panelsWrap.addEventListener('touchmove', move, { passive: true });
  panelsWrap.addEventListener('touchend', up);
}

function setupCaseSwitch(): void {
  const tabs = [...document.querySelectorAll<HTMLButtonElement>('[data-case-tab]')];
  if (!tabs.length) return;
  const panels = [...document.querySelectorAll<HTMLElement>('[data-case-panel]')];

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const idx = tab.getAttribute('data-case-tab');
      if (idx === null) return;

      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      panels.forEach((panel) => {
        const active = panel.getAttribute('data-case-panel') === idx;
        panel.classList.toggle('is-active', active);
        if (active) {
          const curtain = panel.querySelector<HTMLElement>('.rk-case-curtain');
          if (curtain) resetScrub(curtain);
        }
      });
    });
  });
}

export function initCases(): void {
  const panelsWrap = document.querySelector<HTMLElement>('.rk-case-panels');
  if (panelsWrap) setupScrub(panelsWrap);
  setupCaseSwitch();
}
