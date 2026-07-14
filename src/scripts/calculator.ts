// Реимплементация калькулятора потерь (section#flagship) — в легаси это была
// не отдельная функция setupXxx(), а render-цикл компонент-класса
// (renderVals()/fmt(), index.html:1595–1649, вызываемый из onInput слайдера /
// onClick кнопок долей через this.setState(...)). Формулы и форматирование
// портированы 1:1 (см. header-комментарий Flagship.astro):
//   build = Math.round(loss * share)
//   keep  = loss - build
//   sharePct = Math.round(share * 100) + '%'
//   fmt(n) = '$' + n.toLocaleString('en-US')   // "$40,000" — запятая, не пробел
//
// data-calc-* хуки заведены в этой же задаче (Task 16), НЕ легаси-верифицированы
// — контракт описан в header-комментарии Flagship.astro.
function fmt(n: number): string {
  return `$${n.toLocaleString('en-US')}`;
}

export function initCalculator(): void {
  const range = document.querySelector<HTMLInputElement>('[data-calc-range]');
  const lossEl = document.querySelector<HTMLElement>('[data-calc-loss]');
  const buildEl = document.querySelector<HTMLElement>('[data-calc-build]');
  const keepEl = document.querySelector<HTMLElement>('[data-calc-keep]');
  const barFillEl = document.querySelector<HTMLElement>('[data-calc-barfill]');
  const sharePctEl = document.querySelector<HTMLElement>('[data-calc-sharepct]');
  const shareBtns = [...document.querySelectorAll<HTMLButtonElement>('[data-calc-share]')];

  if (!range || !lossEl || !buildEl || !keepEl || !barFillEl || !sharePctEl || !shareBtns.length) return;

  const activeBtn = shareBtns.find((b) => b.classList.contains('rk-calc-share-active')) ?? shareBtns[0];
  let share = Number(activeBtn.dataset.calcShareValue);
  if (Number.isNaN(share)) share = 0.2;

  const render = (): void => {
    const loss = Number(range.value);
    const build = Math.round(loss * share);
    const keep = loss - build;
    const sharePct = `${Math.round(share * 100)}%`;

    lossEl.textContent = fmt(loss);
    buildEl.textContent = `−${fmt(build)}`;
    keepEl.textContent = `+${fmt(keep)}`;
    barFillEl.style.width = sharePct;
    sharePctEl.textContent = sharePct;
  };

  range.addEventListener('input', render);
  shareBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const v = Number(btn.dataset.calcShareValue);
      if (Number.isNaN(v)) return;
      share = v;
      shareBtns.forEach((b) => b.classList.toggle('rk-calc-share-active', b === btn));
      render();
    });
  });
}
