// Порт setupReveal()/setupMagnet()/setupLens() из index.html:1516–1593
// (легаси x-dc Component). Все три вешаются на весь документ (как и в легаси —
// там это тоже был this.el.root, единый div на всю страницу), поэтому собраны
// в одну точку входа initReveal(), которую подключает src/layouts/Base.astro —
// один раз на страницу, для RU и EN одинаково.
//
// Курсор-линза: в легаси элемент [ref=lens]/[ref=lensDot] был статической
// разметкой (index.html:310–319), а не создавался JS-ом. Эквивалент заведён в
// src/layouts/Base.astro как [data-cursor-lens] / [data-cursor-lens-dot].

function setupRevealAnimations(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!els.length) return;

  const reveal = (el: HTMLElement) => {
    el.style.transition = 'opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1)';
    el.style.opacity = '1';
    el.style.transform = 'none';
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry.target as HTMLElement);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  els.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(26px)';
    io.observe(el);
  });

  // Показать всё, что уже во вьюпорте при загрузке, плюс страховка на случай,
  // если IntersectionObserver почему-то не сработал — ничего не должно остаться
  // скрытым навсегда.
  requestAnimationFrame(() => {
    const vh = window.innerHeight || 800;
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.95) {
        reveal(el);
        io.unobserve(el);
      }
    });
  });
  setTimeout(() => els.forEach((el) => reveal(el)), 1800);
}

function setupMagnet(): void {
  const btn = document.querySelector<HTMLElement>('[data-magnet]');
  if (!btn || matchMedia('(hover: none)').matches) return;

  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    const mx = e.clientX - r.left - r.width / 2;
    const my = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${mx * 0.18}px, ${my * 0.28}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0,0)';
  });
}

type LensMode = 'idle' | 'off' | 'grid' | 'target';

function setupLens(): void {
  const lens = document.querySelector<HTMLElement>('[data-cursor-lens]');
  const dot = document.querySelector<HTMLElement>('[data-cursor-lens-dot]');
  if (!lens || matchMedia('(hover: none)').matches) return;

  document.body.style.cursor = 'none';
  const inkPaths = [...lens.querySelectorAll<SVGPathElement>('path')].filter(
    (p) => p.getAttribute('stroke') === '#241F1B',
  );
  let darkNow = false;
  let tx = -100;
  let ty = -100;
  let x = -100;
  let y = -100;
  let mode: LensMode = 'idle';

  const onMove = (e: MouseEvent) => {
    tx = e.clientX;
    ty = e.clientY;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const off = el?.closest('[data-lens="off"]');
    const grid = el?.closest('[data-lens="grid"]');
    const target = el?.closest('[data-lens="target"], a, button');
    mode = off ? 'off' : grid ? 'grid' : target ? 'target' : 'idle';
    const dark = !!el?.closest('#pain, #flagship, #form, footer');
    if (dark !== darkNow) {
      darkNow = dark;
      inkPaths.forEach((p) => {
        p.style.stroke = dark ? '#F1EAE0' : '#241F1B';
      });
    }
  };
  window.addEventListener('mousemove', onMove);

  const tick = () => {
    x += (tx - x) * 0.22;
    y += (ty - y) * 0.22;
    let size = 46;
    let op = 0.85;
    let dotOp = 0;
    if (mode === 'off') {
      op = 0;
    } else if (mode === 'grid') {
      size = 92;
      op = 1;
      dotOp = 1;
    } else if (mode === 'target') {
      size = 34;
      op = 1;
      dotOp = 1;
    }
    lens.style.opacity = String(op);
    lens.style.width = `${size}px`;
    lens.style.height = `${size}px`;
    lens.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`;
    if (dot) dot.style.opacity = String(dotOp);
    requestAnimationFrame(tick);
  };
  tick();
}

export function initReveal(): void {
  setupLens();
  setupRevealAnimations();
  setupMagnet();
}
