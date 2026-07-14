// Порт «Rakurs spotlight showcase controller (delegated, re-render-proof)»
// из index.html:1789–1844.
//
// Упрощение относительно легаси (аналогично nav.ts/report.ts/cases.ts):
// в оригинале [data-spot] мог быть уничтожен и пересоздан реактивным
// re-render'ом x-dc Component'а в любой момент — отсюда setInterval-поиск
// контейнера (90 попыток по 160мс), MutationObserver(childList,subtree) для
// повторного decorate() и флаг spot.__rkspot от повторной подписки. В этом
// статическом Astro-рендере [data-spot]/[data-spot-card] существуют один раз
// и никогда не пересоздаются на клиенте, поэтому опрос и MutationObserver
// убраны — init вызывается один раз при загрузке страницы (как и
// initNav/initCases/initReport/initCalculator), без ретрай-цикла.
// decorate() тоже не портируется буквально: её работа (role="button"/
// tabindex="0"/aria-expanded на карточках + гарантия «если ни одна карточка
// не открыта — открыть первую») здесь УЖЕ выполнена статически при рендере
// (ProductCard.astro ставит role/tabindex/aria-expanded на каждой [data-spot-head];
// Storefront.astro передаёт isOpen={i===0} первому продукту и сразу вешает
// класс has-open на контейнер) — см. комментарии в начале тех файлов.
//
// Семантика аккордеона — 1:1 из toggle() (index.html:1816–1823):
//  - открыта максимум ОДНА карточка одновременно: перед открытием кликнутой
//    карточки все остальные .is-open схлопываются;
//  - повторный клик по уже открытой карточке её ЗАКРЫВАЕТ — это toggle, а не
//    «нельзя закрыть всё»: валидное состояние — ни одна карточка не открыта;
//  - открытие дополнительно доскролливает страницу под карточку (keepInView),
//    закрытие — не скроллит.
//
// Высота тела карточки и сосуществование со статическим CSS-фолбэком
// `.rk-spot-card.is-open .rk-spot-body{height:auto}` (Storefront.astro,
// нужен, чтобы открытая-по-умолчанию первая карточка не была обрезана до
// первого запуска этого скрипта):
//
//   collapse() — портирован 1:1 без изменений и с фолбэком не конфликтует:
//     height сначала явно выставляется в px через scrollHeight (на случай,
//     если сейчас 'auto' — от статического фолбэка или от отработавшего
//     expand()), затем принудительный reflow (чтение offsetHeight), затем
//     height='0px' — оба значения инлайновые, поэтому фолбэк-правило для
//     .rk-spot-body тут вообще не участвует (инлайн-стиль всегда побеждает
//     правило из стилевого листа для одного и того же свойства независимо от
//     специфичности/порядка, если только правило не помечено !important — тут
//     не помечено). .is-open снимается СРАЗУ, не дожидаясь transitionend: это
//     безопасно, т.к. переходы .rk-spot-body-in/шеврона всё равно безусловны и
//     просто доиграют к своему новому конечному состоянию; легаси убирает
//     класс именно в этот момент, поэтому 1:1.
//
//   expand() — ЗДЕСЬ фолбэк реально конфликтует с легаси-версией анимации, и
//     это пришлось найти и исправить (не 1:1), а не просто скопировать.
//     Легаси-код (index.html:1798): `c.classList.add('is-open');
//     b.style.height=b.scrollHeight+'px';` — работал, потому что в легаси НЕТ
//     правила, привязывающего height к .is-open: при добавлении класса
//     computed-height не менялся (оставался тем, что явно поставил предыдущий
//     JS-вызов, обычно 0), поэтому последующее присваивание scrollHeight было
//     настоящим изменением значения, и CSS-transition/transitionend по
//     'height' срабатывали надёжно. У нас же есть ДОБАВЛЕННЫЙ фолбэк-рулет
//     `.rk-spot-card.is-open .rk-spot-body{height:auto}` — если скопировать
//     легаси-порядок буквально (add is-open → читать/писать scrollHeight),
//     то к моменту чтения scrollHeight (это принудительно флашит layout)
//     браузер уже применил фолбэк (высокоспецифичное CSS-правило) и computed
//     height уже стал auto→resolved в тот же scrollHeight, который мы
//     собираемся присвоить инлайном — то есть присваивание НЕ меняет видимое
//     значение, CSS Transitions не видят изменения между «до» и «после»,
//     transitionend по 'height' никогда не срабатывает, и высота НАВСЕГДА
//     остаётся зафиксированной в px вместо 'auto' (проверено вживую: клик по
//     карточке в браузере — высота действительно так и остаётся числом в px
//     сколько ни жди). Исправление: зафиксировать текущую (0, свёрнутую)
//     высоту инлайном И принудительно форснуть reflow ДО добавления .is-open —
//     тогда инлайн-стиль (уже выставленный) продолжает побеждать фолбэк-правило
//     и после появления класса, реальное «до»-состояние остаётся 0, и
//     последующее присваивание целевой scrollHeight-высоты — настоящее
//     изменение значения, transition и transitionend работают как в легаси.
//     Использован offsetHeight, а не scrollHeight, для «пина» текущего
//     состояния: scrollHeight игнорирует overflow:hidden-клип и всегда
//     возвращает полную высоту контента (то есть уже сейчас, до .is-open,
//     равен будущей целевой высоте) — им нельзя запинить именно «свёрнутое»
//     0; offsetHeight же честно учитывает текущий обрезанный бокс.
//
// keepInView (index.html:1801–1815) — 1:1: rAF-петля с экспоненциальным
// приближением (delta*0.3 за кадр, максимум 48 кадров) к позиции карточки
// под nav (высота nav + 12px), плюс setTimeout(900мс) страховка на случай
// троттлинга rAF (фоновая вкладка/слабое устройство) — гарантированно доводит
// до точного значения прямым прыжком (snap), если rAF-петля к этому моменту
// сама не «осела».
//
// Клавиатура (index.html:1833) — 1:1: Enter / Space / 'Spacebar' (легаси
// совместимость со старыми браузерами, отдающими 'Spacebar' в
// KeyboardEvent.key вместо ' ') на [data-spot-head] — preventDefault + toggle.
//
// resize (index.html:1836) — 1:1: если карточка открыта, снять инлайновый
// px-height обратно на 'auto' — иначе после ресайза (смена ориентации,
// перенос текста) зафиксированная в px высота может обрезать контент.

function getBody(card: HTMLElement): HTMLElement | null {
  return card.querySelector<HTMLElement>('[data-spot-body]');
}

function collapse(card: HTMLElement): void {
  const b = getBody(card);
  if (!b) return;
  b.style.height = `${b.scrollHeight}px`;
  void b.offsetHeight; // принудительный reflow — фиксируем px-высоту перед переходом к 0
  b.style.height = '0px';
  card.classList.remove('is-open');
  const h = card.querySelector<HTMLElement>('[data-spot-head]');
  if (h) h.setAttribute('aria-expanded', 'false');
}

function expand(card: HTMLElement): void {
  const b = getBody(card);
  if (!b) return;
  // Зафиксировать текущую (свёрнутую) высоту инлайном ДО добавления .is-open —
  // см. подробный разбор конфликта со статическим CSS-фолбэком выше
  // (обнаружено и исправлено верификацией в браузере, не 1:1 из легаси: там
  // этой строки не было, потому что не было и самого фолбэк-правила).
  // Читаем offsetHeight, а не scrollHeight: scrollHeight игнорирует
  // overflow:hidden-клип и уже сейчас (до .is-open) возвращает полную высоту
  // контента — им нельзя запинить «свёрнутое» состояние, оно всегда равно
  // будущей целевой высоте. offsetHeight же честно отражает текущий обрезанный
  // бокс (0, пока класс не добавлен).
  b.style.height = `${b.offsetHeight}px`;
  void b.offsetHeight; // принудительный reflow — фиксируем «до» для перехода
  card.classList.add('is-open');
  const target = b.scrollHeight;
  const h = card.querySelector<HTMLElement>('[data-spot-head]');
  if (h) h.setAttribute('aria-expanded', 'true');
  b.style.height = `${target}px`;
  const onEnd = (e: TransitionEvent): void => {
    if (e.propertyName === 'height' && card.classList.contains('is-open')) {
      b.style.height = 'auto';
      b.removeEventListener('transitionend', onEnd);
    }
  };
  b.addEventListener('transitionend', onEnd);
}

function navOffset(): number {
  const n = document.querySelector('nav');
  return (n ? Math.round(n.getBoundingClientRect().height) : 0) + 12;
}

function pageScroller(): Element {
  const b = document.body;
  const d = document.documentElement;
  if (b && b.scrollHeight > b.clientHeight + 4 && /(auto|scroll|overlay)/.test(getComputedStyle(b).overflowY)) {
    return b;
  }
  if (d && d.scrollHeight > d.clientHeight + 4 && /(auto|scroll|overlay)/.test(getComputedStyle(d).overflowY)) {
    return d;
  }
  return document.scrollingElement ?? d;
}

function keepInView(card: HTMLElement): void {
  const sc = pageScroller();
  const off = navOffset();
  let settled = false;

  const snap = (): void => {
    const d = card.getBoundingClientRect().top - off;
    const f = sc.scrollTop + d;
    sc.scrollTop = f < 0 ? 0 : f;
  };

  let frames = 0;
  const step = (): void => {
    if (settled) return;
    const delta = card.getBoundingClientRect().top - off;
    let ns = sc.scrollTop + delta * 0.3;
    if (ns < 0) ns = 0;
    sc.scrollTop = ns; // smooth ease (foreground rAF)
    if (++frames < 48 && Math.abs(delta) > 1) {
      requestAnimationFrame(step);
    } else {
      settled = true;
      snap();
    }
  };
  step();

  // fallback: guarantee alignment even if rAF is throttled/paused (background/slow devices)
  setTimeout(() => {
    if (settled) return;
    settled = true;
    const d = card.getBoundingClientRect().top - off;
    if (Math.abs(d) > 2) snap();
  }, 900);
}

function toggle(spot: HTMLElement, card: HTMLElement | null): void {
  if (!card) return;
  const list = [...spot.querySelectorAll<HTMLElement>('[data-spot-card]')];
  const isOpen = card.classList.contains('is-open');
  list.forEach((c) => {
    if (c !== card && c.classList.contains('is-open')) collapse(c);
  });
  if (isOpen) {
    collapse(card);
    spot.classList.remove('has-open');
  } else {
    expand(card);
    spot.classList.add('has-open');
    keepInView(card);
  }
}

export function initSpotlight(): void {
  const spot = document.querySelector<HTMLElement>('[data-spot]');
  if (!spot) return;
  if (!spot.querySelector('[data-spot-card]')) return;

  spot.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    const head = target?.closest<HTMLElement>('[data-spot-head]');
    if (head && spot.contains(head)) toggle(spot, head.closest<HTMLElement>('[data-spot-card]'));
  });
  spot.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement | null;
    const head = target?.closest<HTMLElement>('[data-spot-head]');
    if (head && (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar')) {
      e.preventDefault();
      toggle(spot, head.closest<HTMLElement>('[data-spot-card]'));
    }
  });
  window.addEventListener('resize', () => {
    const openBody = spot.querySelector<HTMLElement>('.is-open [data-spot-body]');
    if (openBody) openBody.style.height = 'auto';
  });
}
