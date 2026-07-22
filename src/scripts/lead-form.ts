// Порт toggleChip/setField/toggleConsent/submitForm (index.html:1655–1675) —
// легаси x-dc Component, componentDidMount-эквивалент. См. header-комментарий
// LeadForm.astro для контракта data-* хуков и разметки.
//
// toggleChip (1655): `s.chips.includes(label) ? filter(...) : [...s.chips, label]`
// — состояние выбранных чипов это МАССИВ в порядке ДОБАВЛЕНИЯ (append при
// выборе, filter при снятии), а НЕ порядок объявления CHIPS[]/кнопок в DOM.
// Порт хранит это явным локальным массивом `chips: string[]`, а не читает
// .is-selected из DOM (что дало бы порядок рендера, а не порядок кликов) —
// важно для payload.plan (join('; ')) и для превью выбранных чипов.
//
// submitForm (1658–1675) 1:1:
//   e.preventDefault();
//   если !consent → показать [data-form-error], СЕТЬ НЕ ДЁРГАЕТСЯ, return;
//   иначе POST JSON на data-endpoint формы (1:1 URL из submitForm()):
//     {name, company, role, contact, pain,        — поля формы по name=
//      plan: chips.join('; '),                     — выбранные боли
//      lang: document.documentElement.lang || 'ru', — см. ниже
//      page: location.href,
//      _subject: 'Заявка с сайта Rakurs'}
//   .then()/.catch() ОБА ведут к success-состоянию — легаси-особенность:
//   сетевая ошибка ТОЖЕ показывается пользователю как успех (сохранено как
//   есть, см. header-комментарий LeadForm.astro, "ошибка сети тоже 'успех' в UI").
//   ОТКЛОНЕНИЕ ОТ ЛЕГАСИ (по запросу пользователя): success больше не заменяет
//   форму инлайн — вместо этого показывается плавающий алерт (fixed,
//   [data-form-success]) поверх страницы с автозакрытием через 10с и кнопкой
//   [data-form-close], а сама форма сбрасывается (form.reset() + chips=[]).
//   Ошибка НЕ снимается сразу после прохождения consent-проверки — только
//   внутри then/catch (оба совпадают с успехом) — 1:1 порядок из легаси, где
//   formError:false выставляется исключительно в колбэках fetch.
//
// lang: легаси брал this._lang (index.html:1669, синхронизирован с
// document.documentElement.lang, см. index.html:1249/1254/1273 — 'ru'|'en');
// порт читает document.documentElement.lang напрямую (бриф задачи).
//
// Легаси НЕ дизейблил submit-кнопку на время отправки (нет chatBusy-подобного
// флага в submitForm) — порт этого тоже не делает, чтобы не добавлять
// поведение, которого не было в оригинале.
//
// Превью выбранных чипов (index.html:1005–1015, "kadr"-рамка): <span> с
// инлайн-стилями bg #EDA05C / fg #1B1815 / padding 6px 12px / radius 18px /
// font-weight 500 — 1:1 из index.html:1009 (span создаётся JS'ом при выборе
// чипа, поэтому inline style, а не scoped Astro-класс — тот же приём, что и
// в report.ts для узлов вне Astro-компиляции). chipCount (1005/1654) и
// hasChips/noChips (1006/1013, 1625–1626) — [data-chip-count]/[data-plan-selected]/
// [data-plan-empty] переключаются по chips.length.
function showError(errorEl: HTMLElement): void {
  errorEl.hidden = false;
}

function hideError(errorEl: HTMLElement): void {
  errorEl.hidden = true;
}

function renderChips(chips: string[], countEl: HTMLElement, selectedEl: HTMLElement, emptyEl: HTMLElement): void {
  countEl.textContent = String(chips.length);

  const pills = chips.map((label) => {
    const span = document.createElement('span');
    span.textContent = label;
    span.style.cssText =
      'font-size:12.5px;color:#1B1815;background:#EDA05C;padding:6px 12px;border-radius:18px;font-weight:500;';
    return span;
  });
  selectedEl.replaceChildren(...pills);

  const hasChips = chips.length > 0;
  selectedEl.hidden = !hasChips;
  emptyEl.hidden = hasChips;
}

function readField(form: HTMLFormElement, name: string): string {
  const el = form.elements.namedItem(name);
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return el.value;
  return '';
}

const SUCCESS_AUTOCLOSE_MS = 10_000;

export function initLeadForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-lead-form]');
  if (!form) return;
  const endpoint = form.dataset.endpoint;
  if (!endpoint) return;

  const successEl = document.querySelector<HTMLElement>('[data-form-success]');
  const closeBtn = document.querySelector<HTMLButtonElement>('[data-form-close]');
  const errorEl = form.querySelector<HTMLElement>('[data-form-error]');
  const countEl = document.querySelector<HTMLElement>('[data-chip-count]');
  const selectedEl = document.querySelector<HTMLElement>('[data-plan-selected]');
  const emptyEl = document.querySelector<HTMLElement>('[data-plan-empty]');
  const consentInput = form.querySelector<HTMLInputElement>('input[name="consent"]');
  const chipBtns = [...form.querySelectorAll<HTMLButtonElement>('[data-chip]')];
  if (!errorEl || !countEl || !selectedEl || !emptyEl || !consentInput) return;

  let chips: string[] = [];
  let autocloseTimer: ReturnType<typeof setTimeout> | undefined;

  const closeSuccess = (): void => {
    if (autocloseTimer) clearTimeout(autocloseTimer);
    autocloseTimer = undefined;
    if (successEl) successEl.hidden = true;
  };

  const openSuccess = (): void => {
    if (!successEl) return;
    if (autocloseTimer) clearTimeout(autocloseTimer);
    successEl.hidden = false;
    autocloseTimer = setTimeout(closeSuccess, SUCCESS_AUTOCLOSE_MS);
  };

  closeBtn?.addEventListener('click', closeSuccess);

  chipBtns.forEach((btn) => {
    const label = btn.dataset.chip;
    if (!label) return;
    btn.addEventListener('click', () => {
      const wasOn = chips.includes(label);
      chips = wasOn ? chips.filter((x) => x !== label) : [...chips, label];
      btn.classList.toggle('is-selected', !wasOn);
      renderChips(chips, countEl, selectedEl, emptyEl);
    });
  });

  // toggleConsent (index.html:1657): проверка сбрасывает formError только
  // когда чекбокс отмечен; снятие галки не выставляет ошибку заново.
  consentInput.addEventListener('change', () => {
    if (consentInput.checked) hideError(errorEl);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!consentInput.checked) {
      showError(errorEl);
      return;
    }

    const payload = {
      name: readField(form, 'name'),
      company: readField(form, 'company'),
      role: readField(form, 'role'),
      contact: readField(form, 'contact'),
      pain: readField(form, 'pain'),
      plan: chips.join('; '),
      lang: document.documentElement.lang || 'ru',
      page: location.href,
      _subject: 'Заявка с сайта Rakurs',
    };

    const onSettled = (): void => {
      hideError(errorEl);
      form.reset();
      chips = [];
      chipBtns.forEach((btn) => btn.classList.remove('is-selected'));
      renderChips(chips, countEl, selectedEl, emptyEl);
      openSuccess();
    };

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(onSettled)
      .catch(onSettled);
  });
}
