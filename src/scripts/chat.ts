// Порт doSend()/pickReply()/SYSTEM_PROMPT (index.html:1708–1758) +
// openChat/closeChat/onChatInput/sendChat (index.html:1692–1695) — легаси
// x-dc Component, componentDidMount-эквивалент. См. header-комментарий
// ChatWidget.astro для контракта data-* хуков и разметки.
//
// open/close (1692–1693): в легаси это были два взаимоисключающих sc-if-блока
// (chatOpen/chatClosed) — здесь эквивалент: открытие прячет [data-chat-open]
// и показывает [data-chat-panel], закрытие — наоборот.
//
// doSend (1708–1728) 1:1:
//   - пустой ввод или chatBusy → no-op (без "return" из формы наружу,
//     submit просто ничего не делает);
//   - user-сообщение добавляется в историю, инпут чистится, chatBusy=true,
//     индикатор "печатает" показывается;
//   - window.claude?.complete({system: SYSTEM_PROMPT, max_tokens: 400,
//     messages: history.map(...)}) — НЕ HTTP fetch, клиентский API
//     претрейнед-модели, если она присутствует в окружении (в браузере её
//     обычно нет — window.claude undefined, поэтому реальный путь всегда
//     фолбэк на pickReply);
//   - при отсутствии/ошибке/пустом ответе — pickReply(text) как фолбэк;
//   - результат добавляется как bot-сообщение, индикатор прячется,
//     chatBusy=false.
//   history для window.claude.complete в легаси — это state.chat, который
//   ИЗНАЧАЛЬНО уже содержит стартовое bot-сообщение (приветствие,
//   index.html:1144) — здесь history сеется чтением уже отрендеренных
//   .rk-chat-msg узлов внутри [data-chat-messages] при инициализации (там
//   уже лежит приветствие из dict.chat.greeting, см. ChatWidget.astro),
//   а не дублированием строки локали в JS.
//
// Enter-to-send: НЕ отдельный keydown-обработчик — легаси вешал onSubmit на
// <form> с одним текстовым полем, и нажатие Enter в единственном text-input
// внутри формы нативно триггерит submit браузера (стандартное HTML-поведение
// форм). Здесь так же: submit-листенер на [data-chat-form] один на все
// случаи (клик по [data-chat-send] И Enter).
//
// componentDidUpdate (1699–1702): автоскролл контейнера сообщений к низу при
// любом обновлении — здесь вызывается императивно после каждой мутации DOM
// (добавление сообщения, показ/скрытие индикатора), а не после каждого рендера.
//
// pickReply (1741–1758) — язык ответа НЕ решает locale страницы
// (document.documentElement.lang) и НЕ this._lang: легаси детектит кириллицу
// прямо в ТЕКСТЕ ВВОДА пользователя (`/[А-Яа-яЁё]/.test(t)`) и по ней ветвит
// RU/EN. Порт сохраняет это дословно (см. отчёт задачи — бриф предполагал
// "probably by _lang", но это не подтвердилось при чтении легаси-кода).
// SYSTEM_PROMPT и обе ветки keyword-таблицы (RU и EN) скопированы из
// index.html:1730–1758 байт-в-байт (EN-ветка уже была захардкожена в легаси
// JS отдельными строками — не бралась из i18n.js рантайм-словаря, поэтому
// сверка с i18n.js не требовалась).
const SYSTEM_PROMPT = `You are the AI assistant for Rakurs, a consultancy that finds where a business loses money and closes the gap with fixed-price AI products.
Tone: calm expert confidence, about money and people, not technology. No exclamation marks; avoid words like "unique", "innovative", "turnkey". Reply in the user's language (English or Russian), briefly (2-4 sentences), to the point.
Your job: understand where the person is losing money, suggest the fitting product, then gently steer toward the express diagnostic (3-5 days, fixed price, credited toward the solution).
Products (state price only if asked or relevant):
- B1 Sales Assistant 24/7 - catches evening/night inquiries, qualifies, books meetings, writes to CRM. From $2,500 + from $500/mo.
- B2 AI Intake System - triages the request stream, routes complex cases to a person. From $10,000 + from $1,000/mo. Case: insurer +30% speed.
- B3 Knowledge Base - answers from internal docs in seconds with a source link. From $8,000 + from $500/mo.
- B4 Proposal Generator - a technical proposal draft in a minute. From $5,000 + from $500/mo.
Flagship program - for companies of 50+ employees, implementation priced at 10-30% of the annual value of the leak closed.
Don't invent numbers or cases beyond these. If unsure, offer a call. Say honestly if Rakurs isn't a fit.`;

function pickReply(t: string): string {
  const s = t.toLowerCase();
  if (/[А-Яа-яЁё]/.test(t)) {
    if (/ноч|вечер|заявк|лид|прода/.test(s)) return 'Похоже на утечку «заявки остывают за ночь» — это наш B1, Sales-ассистент 24/7 (от $2 500 + от $500/мес). Он ловит вечерние заявки, сам квалифицирует и назначает встречу. Оставьте заявку в форме — посчитаем окупаемость на вашем объёме.';
    if (/кп|коммерческ|предложени/.test(s)) return 'Это Генератор КП (B4, от $5 000 + от $500/мес): черновик за минуту вместо дней ожидания. Лучше начать с экспресс-диагностики — её стоимость зачитывается в цену решения.';
    if (/документ|регламент|база знаний|поиск|знани/.test(s)) return 'Похоже на задачу для Базы знаний (B3, от $8 000 + от $500/мес): ответ обычным языком за секунды, со ссылкой на первоисточник. Показать механику на созвоне?';
    if (/оператор|поток|обращени|очеред|штат|приёмн|приемн/.test(s)) return 'Это ИИ-приёмная (B2, от $10 000 + от $1 000/мес): типовое уходит без оператора, штат не растёт вместе с потоком. Кейс: страховая — +30% к скорости.';
    if (/срок|быстро|когда|недел|долго/.test(s)) return 'Готовое решение запускаем за 1–3 недели, цена фиксируется до старта. Перед этим — экспресс-диагностика за 3–5 дней ($1 500–3 000, фикс, зачитывается в цену решения).';
    if (/цен|сколько|стоимост|бюджет|прайс/.test(s)) return 'Ориентиры: B1 — от $2 500 + от $500/мес; B4 — от $5 000; B3 — от $8 000; B2 — от $10 000. Точную цену фиксируем до старта — после экспресс-диагностики ($1 500–3 000, зачитывается в цену решения).';
    if (/что вы|чем занима|кто вы|о вас|о компании/.test(s)) return 'Мы находим, где бизнес теряет деньги, и закрываем это готовыми ИИ-решениями с фиксированной ценой: ассистент продаж 24/7, ИИ-приёмная, база знаний, генератор КП и другие. Начинаем с экспресс-диагностики за 3–5 дней.';
    return 'Понял вас. Точнее всего это покажет экспресс-диагностика: 3–5 дней, фикс-цена, зачитывается в цену решения. Оставьте заявку в форме на этой странице — и уже на 20-минутном созвоне подскажем, где искать потери.';
  }
  if (/night|even|lead|inquir|sale/.test(s)) return 'Sounds like the "leads go cold overnight" leak - that’s our B1, Sales Assistant 24/7 (from $2,500 + from $500/mo). It catches evening inquiries and books the meeting. Start the improvement plan and we’ll estimate payback on your volume.';
  if (/proposal|quote|estimate|engineer/.test(s)) return 'That’s the Proposal Generator (B4, from $5,000): a draft in a minute instead of days waiting on engineers. Best to start with the express diagnostic - its cost is credited toward the solution.';
  if (/search|doc|regulat|knowledge|manual/.test(s)) return 'Sounds like a job for the Knowledge Base (B3, from $8,000): plain-language answers in seconds, with a link to the source. Want me to show the mechanics on a call?';
  if (/operator|volume|request|queue|staff|intake/.test(s)) return 'That’s the AI Intake System (B2, from $10,000): routine cases run without a human, headcount doesn’t grow with volume. An insurer got +30% speed this way.';
  return 'Got it. An express diagnostic shows it best: 3-5 days, fixed price, credited toward the solution. Add a couple of lines in the improvement plan - and on a 20-minute call I’ll point to where the losses are.';
}

// window.claude — необязательный глобал, который в легаси-окружении (не в
// обычном браузере, а в среде превью dc-рантайма) предоставлял клиентский
// доступ к претрейнед-модели. В продовом браузере отсутствует, поэтому
// window.claude?.complete всегда падает в фолбэк pickReply — это ожидаемо и
// сохраняет 1:1 поведение легаси (try/catch вокруг вызова + falsy-проверка).
declare global {
  interface Window {
    claude?: {
      complete: (opts: {
        system: string;
        max_tokens: number;
        messages: { role: 'user' | 'assistant'; content: string }[];
      }) => Promise<string>;
    };
  }
}

interface ChatMsg {
  who: 'user' | 'bot';
  text: string;
}

function scrollToBottom(el: HTMLElement): void {
  el.scrollTop = el.scrollHeight;
}

function appendMessage(container: HTMLElement, beforeEl: HTMLElement, text: string, who: 'user' | 'bot'): void {
  const div = document.createElement('div');
  div.className = `rk-chat-msg is-${who}`;
  div.textContent = text; // НЕ innerHTML — text может быть вводом пользователя
  container.insertBefore(div, beforeEl);
}

export function initChat(): void {
  const openBtn = document.querySelector<HTMLButtonElement>('[data-chat-open]');
  const panel = document.querySelector<HTMLElement>('[data-chat-panel]');
  const closeBtn = document.querySelector<HTMLButtonElement>('[data-chat-close]');
  const messagesEl = document.querySelector<HTMLElement>('[data-chat-messages]');
  const typingEl = document.querySelector<HTMLElement>('[data-chat-typing]');
  const form = document.querySelector<HTMLFormElement>('[data-chat-form]');
  const input = document.querySelector<HTMLInputElement>('[data-chat-input]');
  if (!openBtn || !panel || !closeBtn || !messagesEl || !typingEl || !form || !input) return;

  openBtn.addEventListener('click', () => {
    panel.hidden = false;
    openBtn.hidden = true;
    scrollToBottom(messagesEl);
  });
  closeBtn.addEventListener('click', () => {
    panel.hidden = true;
    openBtn.hidden = false;
  });

  // сеет историю стартовым bot-сообщением, уже отрендеренным Astro
  // (dict.chat.greeting) — не дублирует строку локали в JS.
  let history: ChatMsg[] = [...messagesEl.querySelectorAll<HTMLElement>('.rk-chat-msg')].map((el) => ({
    who: el.classList.contains('is-user') ? 'user' : 'bot',
    text: el.textContent ?? '',
  }));
  let chatBusy = false;

  async function doSend(): Promise<void> {
    const text = input!.value.trim();
    if (!text || chatBusy) return;

    history = [...history, { who: 'user', text }];
    appendMessage(messagesEl!, typingEl!, text, 'user');
    input!.value = '';
    chatBusy = true;
    typingEl!.hidden = false;
    scrollToBottom(messagesEl!);

    let reply: string | null = null;
    try {
      const claude = window.claude;
      if (claude?.complete) {
        const messages = history.map((m) => ({
          role: (m.who === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.text,
        }));
        reply = await claude.complete({ system: SYSTEM_PROMPT, max_tokens: 400, messages });
      }
    } catch {
      reply = null;
    }

    const finalReply = reply && reply.trim() ? reply.trim() : pickReply(text);
    history = [...history, { who: 'bot', text: finalReply }];
    appendMessage(messagesEl!, typingEl!, finalReply, 'bot');
    typingEl!.hidden = true;
    chatBusy = false;
    scrollToBottom(messagesEl!);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    void doSend();
  });
}
