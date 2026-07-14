// Порт setupNav() из index.html:1292–1337 (легаси x-dc Component).
// Легаси искал элементы внутри this.el.root (единый рутовый div всей страницы);
// в Astro такого обёрточного div нет, поэтому здесь те же селекторы применяются
// к document — семантически то же самое (реестр один на страницу).
//
// Порт 1:1:
// - nav-progress: [data-navprog] scaleX = scrollTop / (scrollHeight - clientHeight)
// - scrollspy: секция активна, если её top <= 35% высоты вьюпорта (последняя такая
//   в порядке DOM выигрывает — секции идут сверху вниз, поэтому это самая нижняя
//   секция, уже показавшая свой верх)
// - burger: toggles [data-nav-menu].open + aria-expanded + иконка (крестик/бургер)
// - клик по ссылке в мобильном меню закрывает меню
// - .rk-case-tabs: клик по табу центрирует его скроллом (smooth)
//
// Smooth-scroll для якорных nav-ссылок в легаси НЕ было вообще: ни JS, ни
// `scroll-behavior: smooth` в CSS (index.html/global.css его не объявляют) —
// переход по #hash — обычный, мгновенный. Единственное место со smooth-скроллом
// в setupNav — .rk-case-tabs (см. setupCaseTabsScroll ниже), которое и портируется.

function getScroller(): Element {
  const b = document.body;
  const d = document.documentElement;
  if (
    b &&
    b.scrollHeight > b.clientHeight + 4 &&
    /(auto|scroll|overlay)/.test(getComputedStyle(b).overflowY)
  ) {
    return b;
  }
  return document.scrollingElement || d;
}

function setupNavProgressAndScrollspy(nav: HTMLElement): void {
  const prog = nav.querySelector<HTMLElement>('[data-navprog]');
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-navlink]')];
  const secs = links
    .map((a) => {
      const href = a.getAttribute('href');
      return href ? document.querySelector<HTMLElement>(href) : null;
    })
    .filter((el): el is HTMLElement => el !== null);

  const onScroll = () => {
    const sc = getScroller();
    if (prog) {
      const max = sc.scrollHeight - sc.clientHeight || 1;
      const frac = Math.min(1, Math.max(0, sc.scrollTop / max));
      prog.style.transform = `scaleX(${frac})`;
    }
    const vh = window.innerHeight;
    let cur: string | null = null;
    secs.forEach((sec) => {
      if (sec.getBoundingClientRect().top <= vh * 0.35) cur = `#${sec.id}`;
    });
    links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === cur));
  };

  document.addEventListener('scroll', onScroll, { capture: true, passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
}

function setupBurger(nav: HTMLElement): void {
  const burger = nav.querySelector<HTMLButtonElement>('[data-nav-burger]');
  const menu = document.querySelector<HTMLElement>('[data-nav-menu]');
  if (!burger || !menu) return;

  const ICO_OPEN =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#241F1B" stroke-width="2.2" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>';
  const ICO_BURGER =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#241F1B" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

  const set = (open: boolean) => {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.innerHTML = open ? ICO_OPEN : ICO_BURGER;
  };

  burger.addEventListener('click', () => set(!menu.classList.contains('open')));
  menu.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('a')) set(false);
  });
}

function setupCaseTabsScroll(): void {
  const tabs = document.querySelector<HTMLElement>('.rk-case-tabs');
  if (!tabs) return;
  tabs.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    const b = target?.closest('button');
    if (!b) return;
    const left = b.offsetLeft - (tabs.clientWidth - b.offsetWidth) / 2;
    tabs.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  });
}

export function initNav(): void {
  const nav = document.querySelector<HTMLElement>('nav');
  if (!nav) return;

  setupNavProgressAndScrollspy(nav);
  setupBurger(nav);
  setupCaseTabsScroll();
}
