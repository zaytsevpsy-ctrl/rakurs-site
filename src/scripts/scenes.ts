// Порт «Rakurs — immersive product scenes» из index.html:1845–1956: пиксельные
// SVG-спрайты (BOT/P/SPARK) + 6 композиций демо-сцен (chat/intake/kb/kp/panel/
// employee), которые легаси-скрипт вставлял innerHTML-ом в контейнеры
// [data-scene] (см. ProductCard.astro: `<div class="rk-scene" data-scene={demo}>`
// изначально пустой — контент сцены рендерится только этим скриптом).
//
// В диапазоне 1845–1956 НЕТ JS-таймеров анимации (ни setInterval, ни rAF-цикла
// для самого движения сцены) — всё движение (моргание глаз, покачивание
// спрайтов, конвейер чипов, «мигание» алертов, sparkline-дорисовка и т.д.)
// работает на чистых CSS @keyframes/animation, объявленных на классах
// .rk-eye/.rk-cyc/.rk-tk/.rk-belt/.rk-spark/... — эти правила уже перенесены
// байт-в-байт в src/components/Storefront.astro (<style is:global>, секция
// "Immersive product scenes") в рамках прошлой задачи (Task 16), а недостающие
// @keyframes rk-blink/rk-pulse (на которые эти классы ссылаются, но которые не
// объявлены в самом Storefront.astro) уже существуют глобально в
// src/styles/global.css — т.е. все тайминги анимаций 1:1 сохранены, просто не
// в этом файле. Единственный "таймер" в легаси-скрипте — это setInterval,
// которым inject() опрашивал DOM в ожидании появления [data-scene] (90 попыток
// по 150мс) + MutationObserver-подобная повторная попытка через
// DOMContentLoaded. Как и в других портированных скриптах этой кодовой базы
// (nav.ts/report.ts/cases.ts/calculator.ts — см. их header-комментарии), это
// опрос был нужен только из-за реактивных re-render'ов легаси x-dc Component;
// в статическом Astro-рендере [data-scene]-контейнеры существуют один раз при
// загрузке страницы, поэтому опрос убран — initScenes() вызывается один раз,
// сразу.
//
// ===== BOT/P/SPARK — байт-в-байт из index.html:1848–1868 =====
// (единственное отличие от исходных JS-строк: конкатенация через '+' заменена
// на template literals — сама разметка не изменена ни на символ).

const BOT = `<svg class="rk-px" width="40" height="46" viewBox="0 0 20 23" shape-rendering="crispEdges"><rect x="9" y="0" width="2" height="3" fill="#E37722"/><rect x="7" y="2" width="6" height="2" fill="#E37722"/><rect x="3" y="4" width="14" height="10" fill="#2E2822"/><rect x="5" y="7" width="3" height="3" fill="#8FD08A" class="rk-eye"/><rect x="12" y="7" width="3" height="3" fill="#8FD08A" class="rk-eye"/><rect x="8" y="11" width="4" height="1" fill="#5A6E58"/><rect x="6" y="14" width="8" height="6" fill="#3A332C"/><rect x="3" y="15" width="2" height="4" fill="#3A332C"/><rect x="15" y="15" width="2" height="4" fill="#3A332C"/></svg>`;

function P(t: string): string {
  return `<svg class="rk-px" width="30" height="42" viewBox="0 0 16 22" shape-rendering="crispEdges"><rect x="4" y="1" width="8" height="5" fill="#2E2822"/><rect x="5" y="3" width="6" height="4" fill="#E8C9A0"/><rect x="3" y="8" width="10" height="8" fill="${t}"/><rect x="1" y="9" width="2" height="6" fill="#E8C9A0"/><rect x="13" y="9" width="2" height="6" fill="#E8C9A0"/><rect x="4" y="16" width="3" height="6" fill="#2E2822"/><rect x="9" y="16" width="3" height="6" fill="#2E2822"/></svg>`;
}

function SPARK(c: string, up: boolean): string {
  const pts = up ? '0,16 12,11 24,13 36,7 48,9 60,3' : '0,4 12,8 24,6 36,11 48,10 60,16';
  return `<svg class="rk-spark" width="100%" height="18" viewBox="0 0 60 18" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

export type DemoKey = 'chat' | 'intake' | 'kb' | 'kp' | 'panel' | 'employee';

// ===== SCENES (RU) — байт-в-байт из index.html:1869–1929 =====
const SCENES_RU: Record<DemoKey, string> = {
  chat:
    `<div class="stage rk-night">` +
    `<span class="rk-moon"></span><span class="rk-star" style="top:11px;left:26px"></span><span class="rk-star" style="top:24px;left:78px;animation-delay:.7s"></span><span class="rk-star" style="top:8px;left:130px;animation-delay:1.3s"></span>` +
    `<div class="rk-row" style="justify-content:space-between;position:relative;z-index:2"><span class="rk-tag" style="color:#C7CEDC">02:47 · ночь</span><span class="rk-tag rk-ok">● на связи 24/7</span></div>` +
    `<div class="rk-row" style="align-items:flex-end;position:relative;z-index:2"><div style="animation:rk-buzz 3.2s infinite">${P('#4E7A96')}</div>` +
    `<div style="display:flex;flex-direction:column;gap:5px"><span class="rk-bub me rk-cyc" style="--d:4.6s">Вы работаете ночью?</span><span class="rk-bub rk-cyc" style="--d:4.6s;animation-delay:1.2s">Да — записываю вас на встречу</span></div>` +
    `<div style="margin-left:auto;position:relative">${BOT}<span class="rk-glow"></span></div></div>` +
    `<div class="rk-row" style="position:relative;z-index:2;gap:8px"><span class="rk-pill-flip">$</span><span class="rk-tag" style="color:#8892A6;letter-spacing:.2em">z z z</span></div></div>` +
    `<div class="out"><div class="rk-tag">// пока конкурент спит</div>` +
    `<div class="rk-line rk-cyc" style="--d:5s">→ лид пойман <span class="rk-ok">✓</span></div>` +
    `<div class="rk-line rk-cyc" style="--d:5s;animation-delay:.7s">→ квалифицирован <span class="rk-ok">✓</span></div>` +
    `<div class="rk-line rk-cyc" style="--d:5s;animation-delay:1.4s">→ встреча 15:00 → CRM <span class="rk-ok">✓</span></div>` +
    `<div class="rk-line rk-amber rk-cyc" style="--d:5s;animation-delay:2.1s">к утру лид НЕ остыл</div></div>` +
    `<div class="cap"><b>Это про вас,</b> если вечерние заявки к утру уже холодные.</div>`,
  intake:
    `<div class="stage">` +
    `<div class="rk-row" style="justify-content:space-between"><span class="rk-tag">поток обращений</span><span class="rk-tag rk-amber">● сортирует ИИ</span></div>` +
    `<div style="position:relative;height:54px"><span class="rk-belt"></span>` +
    `<span class="rk-chip rk-tk" style="top:3px">#4821</span><span class="rk-chip rk-tk" style="top:21px;animation-delay:.7s">#4822</span><span class="rk-chip rk-tk" style="top:39px;animation-delay:1.4s">#4823</span><span class="rk-chip rk-tk" style="top:12px;animation-delay:2.1s">#4824</span>` +
    `<div style="position:absolute;right:2px;top:6px;animation:rk-bobble 2.4s infinite">${BOT}<span class="rk-glow"></span></div></div>` +
    `<div class="rk-row"><div style="animation:rk-bobble 3s infinite">${P('#6B8E6A')}</div><span class="rk-tag">оператор спокоен — проверяет 3, а не 300</span></div></div>` +
    `<div class="out"><div class="rk-tag">// сегодня</div>` +
    `<div class="rk-line">обращений <b class="rk-amber">1 240</b></div>` +
    `<div class="rk-line" style="display:flex;align-items:center;gap:8px">авто-решено <span class="rk-ok">1 187 ✓</span><span class="rk-trackbar"><i class="rk-ok-bar" style="--w:96%"></i></span></div>` +
    `<div class="rk-line" style="display:flex;align-items:center;gap:8px">оператору <span class="rk-amber">53</span><span class="rk-trackbar"><i class="rk-amber-bar" style="--w:14%"></i></span></div>` +
    `<div class="rk-line" style="border-top:1px solid #3A332C;padding-top:5px">штат 3 — не растёт с потоком</div></div>` +
    `<div class="cap"><b>Это про вас,</b> если каждый новый поток — это новые люди в штат.</div>`,
  kb:
    `<div class="stage"><div class="rk-row" style="justify-content:space-around;align-items:center;gap:10px">` +
    `<div style="display:flex;flex-direction:column;align-items:center;gap:6px">` +
    `<div style="display:flex;align-items:flex-end;gap:6px">${P('#8A6D4B')}<div style="animation:rk-shuffle 1.2s infinite;display:flex;flex-direction:column-reverse;gap:2px"><div style="width:32px;height:6px;background:#B79B72;border-radius:2px"></div><div style="width:28px;height:6px;background:#C6A97F;border-radius:2px"></div><div style="width:34px;height:6px;background:#A98A62;border-radius:2px"></div><div style="width:26px;height:6px;background:#C6A97F;border-radius:2px"></div></div></div>` +
    `<div class="rk-tag"><span class="rk-clock">◷</span> регламенты · 12:40</div></div>` +
    `<div class="rk-tag" style="flex:0 0 auto">старый путь →</div>` +
    `<div style="display:flex;flex-direction:column;align-items:center;gap:6px"><div style="position:relative;display:inline-block;animation:rk-bobble 2.6s infinite">${BOT}<span class="rk-glow"></span></div><div class="rk-tag rk-ok">0:03 сек</div></div>` +
    `</div></div>` +
    `<div class="out"><div class="rk-bub me rk-cyc" style="--d:5s;max-width:none">«Какой срок гарантии по договору №7?»</div>` +
    `<div class="rk-line rk-cyc" style="--d:5s;animation-delay:.9s;margin-top:3px;font-weight:600;position:relative;display:inline-block">36 месяцев с даты приёмки<span class="rk-uline"></span></div>` +
    `<div class="rk-line rk-amber rk-cyc" style="--d:5s;animation-delay:1.4s">источник: Регламент, п. 4.2 →</div></div>` +
    `<div class="cap"><b>Это про вас,</b> если знания живут в головах и толстых папках.</div>`,
  kp:
    `<div class="stage"><div class="rk-row" style="justify-content:space-between"><span class="rk-tag">Черновик КП №2201</span><span class="rk-tag rk-ok">● сборка 0:58</span></div>` +
    `<div style="position:relative"><div style="display:flex;flex-direction:column;gap:6px"><div class="rk-bar"><i class="rk-loopfill" style="--w:92%"></i></div><div class="rk-bar"><i class="rk-loopfill" style="--w:70%;animation-delay:.3s"></i></div><div class="rk-bar"><i class="rk-loopfill" style="--w:84%;animation-delay:.6s"></i></div></div><span class="rk-stampd">ГОТОВО</span></div>` +
    `<div class="rk-row"><span class="rk-tag rk-mut" style="text-decoration:line-through">вручную · долго</span><div style="animation:rk-bobble 2.2s infinite">${P('#B26A2E')}</div><span class="rk-tag">менеджер не ждёт</span></div></div>` +
    `<div class="out"><div class="rk-tag">// собирает по вашей техбазе</div>` +
    `<div class="rk-line rk-cyc" style="--d:5s">позиции подобраны <span class="rk-ok">✓</span></div>` +
    `<div class="rk-line rk-cyc" style="--d:5s;animation-delay:.6s">характеристики <span class="rk-ok">✓</span></div>` +
    `<div class="rk-line rk-cyc" style="--d:5s;animation-delay:1.2s">условия и цены <span class="rk-ok">✓</span></div>` +
    `<div class="rk-line rk-amber rk-cyc" style="--d:5s;animation-delay:1.8s">черновик за минуту, не за дни</div></div>` +
    `<div class="cap"><b>Это про вас,</b> если КП собираются вручную и по дням.</div>`,
  panel:
    `<div class="stage"><span class="rk-sweep"></span><div class="rk-row" style="justify-content:space-between"><span class="rk-tag">кабина · все отделы</span><span class="rk-tag rk-warn" style="animation:rk-blink 1.2s infinite">● 1 алерт</span></div>` +
    `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px"><div class="rk-gauge"><div class="rk-tag rk-ok">ПРОДАЖИ <span>▲</span></div>${SPARK('#8FD08A', true)}</div><div class="rk-gauge"><div class="rk-tag rk-mut">ФИНАНСЫ <span>→</span></div>${SPARK('#8A7E71', true)}</div><div class="rk-gauge rk-alert"><div class="rk-tag rk-warn">СКЛАД <span>▼</span></div>${SPARK('#F0653F', false)}</div></div>` +
    `<div class="rk-row">${P('#3E6E8E')}<span class="rk-tag rk-amber">ИИ: склад −8% к плану — смотри сюда</span></div></div>` +
    `<div class="out"><div class="rk-tag">// один экран вместо 7 отчётов</div>` +
    `<div class="rk-line">выручка <span class="rk-ok">▲ 112%</span></div>` +
    `<div class="rk-line">маржа <span class="rk-mut">→ 31%</span></div>` +
    `<div class="rk-line rk-warn">склад 78% · риск простоя</div>` +
    `<div class="rk-line" style="border-top:1px solid #3A332C;padding-top:5px">отчёты собираются сами</div></div>` +
    `<div class="cap"><b>Это про вас,</b> если решения принимаются по интуиции, а не по приборам.</div>`,
  employee:
    `<div class="stage"><div class="rk-row" style="justify-content:space-between"><span class="rk-tag">цифровой сотрудник · сегодня</span><span class="rk-tag rk-ok">● 24/7</span></div>` +
    `<div class="rk-row" style="align-items:flex-end;position:relative"><div style="position:relative;animation:rk-bobble 2.6s infinite">${BOT}<span class="rk-glow"></span></div>` +
    `<div style="display:flex;flex-direction:column;gap:3px;margin-left:2px"><span class="rk-line rk-cyc" style="--d:5s">письмо клиенту <span class="rk-ok rk-tickpop">✓</span></span><span class="rk-line rk-cyc" style="--d:5s;animation-delay:.6s">встреча — чт 15:00 <span class="rk-ok rk-tickpop">✓</span></span><span class="rk-line rk-cyc" style="--d:5s;animation-delay:1.2s">задача → @Ирина <span class="rk-ok rk-tickpop">✓</span></span><span class="rk-line rk-mut rk-cyc" style="--d:5s;animation-delay:1.8s">саммари встречи…</span></div>` +
    `<span class="rk-paper"></span><span class="rk-paper" style="animation-delay:1.6s"></span></div>` +
    `<div class="rk-row"><div style="animation:rk-bobble 3s infinite">${P('#6B8E6A')}</div><div style="animation:rk-bobble 3s infinite .4s">${P('#B26A2E')}</div><span class="rk-tag">команда — на деле, не на рутине</span></div></div>` +
    `<div class="out"><div class="rk-tag">// за него — рутина всей команды</div>` +
    `<div class="rk-line">14 писем · 6 встреч</div>` +
    `<div class="rk-line">9 задач · 3 саммари</div>` +
    `<div class="rk-line">помнит контекст компании <span class="rk-ok">✓</span></div>` +
    `<div class="rk-line rk-amber" style="border-top:1px solid #3A332C;padding-top:5px">один вместо рутины на всех</div></div>` +
    `<div class="cap"><b>Это про вас,</b> если админ-рутина съедает лучших людей.</div>`,
};

// ===== SCENES (EN) =====
// Легаси НЕ хранит готовый английский текст сцен статически: он вставляет
// RU-строки (те же, что в SCENES_RU) через innerHTML, а затем — если
// isEN()===true — прогоняет вставленный DOM через applyENto()
// (index.html:1938–1943), которая ходит TreeWalker'ом по текстовым узлам и
// подменяет КАЖДЫЙ узел, чей нормализованный текст целиком совпадает с ключом
// словаря window.__RAKURS_EN (this dictionary — отдельный файл i18n.js,
// window.__RAKURS_EN = {...}, ~380 пар "рус.":"eng.", загружается на реальной
// странице тегом `<script src="i18n.js?v=2">` до этого скрипта).
// Этот словарь — ЖИВОЙ, не мёртвый код (в отличие от drag-arrows): в
// index.html действительно есть `<script src="i18n.js?v=2">`, и файл i18n.js
// реально существует и содержит перевод каждой строки сцен.
//
// В этом Astro-рефакторе нет клиентского байт-свопа текста (RU/EN — это две
// статические сборки страницы, см. `<html lang={locale}>` в src/layouts/
// Base.astro), поэтому дословно портировать TreeWalker+нормализация+словарь
// избыточно и архитектурно не нужно — вместо этого ниже статически
// зафиксирована ВТОРАЯ версия тех же 6 сцен с уже подставленным переводом.
// Чтобы перевод был не «на глаз», а гарантированно совпадал с тем, что реально
// показывает легаси англоязычным посетителям, EN-текст ниже был получен, не
// придуман: реальный index.html открыт headless Chrome с `?lang=en`
// (auto-detect в setupLang(), index.html:1277–1286, поддерживает этот параметр
// явно), дождались, пока живой inject()+applyENto() заполнят все 6
// [data-scene] и переведут их, и переведённый innerHTML каждого контейнера
// снят как эталон. Ниже — то же самое дерево, что и в SCENES_RU (та же
// структура тегов/классов/inline-style/BOT/P/SPARK), только с этими
// проверенными по факту переводами текстовых фрагментов вместо русских.
const SCENES_EN: Record<DemoKey, string> = {
  chat:
    `<div class="stage rk-night">` +
    `<span class="rk-moon"></span><span class="rk-star" style="top:11px;left:26px"></span><span class="rk-star" style="top:24px;left:78px;animation-delay:.7s"></span><span class="rk-star" style="top:8px;left:130px;animation-delay:1.3s"></span>` +
    `<div class="rk-row" style="justify-content:space-between;position:relative;z-index:2"><span class="rk-tag" style="color:#C7CEDC">02:47 · night</span><span class="rk-tag rk-ok">● online 24/7</span></div>` +
    `<div class="rk-row" style="align-items:flex-end;position:relative;z-index:2"><div style="animation:rk-buzz 3.2s infinite">${P('#4E7A96')}</div>` +
    `<div style="display:flex;flex-direction:column;gap:5px"><span class="rk-bub me rk-cyc" style="--d:4.6s">Do you work nights?</span><span class="rk-bub rk-cyc" style="--d:4.6s;animation-delay:1.2s">Yes — booking your meeting</span></div>` +
    `<div style="margin-left:auto;position:relative">${BOT}<span class="rk-glow"></span></div></div>` +
    `<div class="rk-row" style="position:relative;z-index:2;gap:8px"><span class="rk-pill-flip">$</span><span class="rk-tag" style="color:#8892A6;letter-spacing:.2em">z z z</span></div></div>` +
    `<div class="out"><div class="rk-tag">// while the competitor sleeps</div>` +
    `<div class="rk-line rk-cyc" style="--d:5s">→ lead caught <span class="rk-ok">✓</span></div>` +
    `<div class="rk-line rk-cyc" style="--d:5s;animation-delay:.7s">→ qualified <span class="rk-ok">✓</span></div>` +
    `<div class="rk-line rk-cyc" style="--d:5s;animation-delay:1.4s">→ meeting 15:00 → CRM <span class="rk-ok">✓</span></div>` +
    `<div class="rk-line rk-amber rk-cyc" style="--d:5s;animation-delay:2.1s">by morning the lead is still warm</div></div>` +
    `<div class="cap"><b>This is you,</b> if evening inquiries are cold by morning.</div>`,
  intake:
    `<div class="stage">` +
    `<div class="rk-row" style="justify-content:space-between"><span class="rk-tag">inquiry flow</span><span class="rk-tag rk-amber">● AI sorting</span></div>` +
    `<div style="position:relative;height:54px"><span class="rk-belt"></span>` +
    `<span class="rk-chip rk-tk" style="top:3px">#4821</span><span class="rk-chip rk-tk" style="top:21px;animation-delay:.7s">#4822</span><span class="rk-chip rk-tk" style="top:39px;animation-delay:1.4s">#4823</span><span class="rk-chip rk-tk" style="top:12px;animation-delay:2.1s">#4824</span>` +
    `<div style="position:absolute;right:2px;top:6px;animation:rk-bobble 2.4s infinite">${BOT}<span class="rk-glow"></span></div></div>` +
    `<div class="rk-row"><div style="animation:rk-bobble 3s infinite">${P('#6B8E6A')}</div><span class="rk-tag">one operator, calm — reviews 3, not 300</span></div></div>` +
    `<div class="out"><div class="rk-tag">// today</div>` +
    `<div class="rk-line">inquiries <b class="rk-amber">1 240</b></div>` +
    `<div class="rk-line" style="display:flex;align-items:center;gap:8px">auto-resolved <span class="rk-ok">1 187 ✓</span><span class="rk-trackbar"><i class="rk-ok-bar" style="--w:96%"></i></span></div>` +
    `<div class="rk-line" style="display:flex;align-items:center;gap:8px">to a human <span class="rk-amber">53</span><span class="rk-trackbar"><i class="rk-amber-bar" style="--w:14%"></i></span></div>` +
    `<div class="rk-line" style="border-top:1px solid #3A332C;padding-top:5px">team of 3 — doesn't grow with volume</div></div>` +
    `<div class="cap"><b>This is you,</b> if every surge in volume means new hires.</div>`,
  kb:
    `<div class="stage"><div class="rk-row" style="justify-content:space-around;align-items:center;gap:10px">` +
    `<div style="display:flex;flex-direction:column;align-items:center;gap:6px">` +
    `<div style="display:flex;align-items:flex-end;gap:6px">${P('#8A6D4B')}<div style="animation:rk-shuffle 1.2s infinite;display:flex;flex-direction:column-reverse;gap:2px"><div style="width:32px;height:6px;background:#B79B72;border-radius:2px"></div><div style="width:28px;height:6px;background:#C6A97F;border-radius:2px"></div><div style="width:34px;height:6px;background:#A98A62;border-radius:2px"></div><div style="width:26px;height:6px;background:#C6A97F;border-radius:2px"></div></div></div>` +
    `<div class="rk-tag"><span class="rk-clock">◷</span> rulebooks · 12:40</div></div>` +
    `<div class="rk-tag" style="flex:0 0 auto">old way →</div>` +
    `<div style="display:flex;flex-direction:column;align-items:center;gap:6px"><div style="position:relative;display:inline-block;animation:rk-bobble 2.6s infinite">${BOT}<span class="rk-glow"></span></div><div class="rk-tag rk-ok">0:03 sec</div></div>` +
    `</div></div>` +
    `<div class="out"><div class="rk-bub me rk-cyc" style="--d:5s;max-width:none">"What's the warranty period for contract #7?"</div>` +
    `<div class="rk-line rk-cyc" style="--d:5s;animation-delay:.9s;margin-top:3px;font-weight:600;position:relative;display:inline-block">36 months from acceptance date<span class="rk-uline"></span></div>` +
    `<div class="rk-line rk-amber rk-cyc" style="--d:5s;animation-delay:1.4s">source: Rulebook, sec. 4.2 →</div></div>` +
    `<div class="cap"><b>This is you,</b> if knowledge lives in heads and fat binders.</div>`,
  kp:
    `<div class="stage"><div class="rk-row" style="justify-content:space-between"><span class="rk-tag">Proposal draft #2201</span><span class="rk-tag rk-ok">● assembling 0:58</span></div>` +
    `<div style="position:relative"><div style="display:flex;flex-direction:column;gap:6px"><div class="rk-bar"><i class="rk-loopfill" style="--w:92%"></i></div><div class="rk-bar"><i class="rk-loopfill" style="--w:70%;animation-delay:.3s"></i></div><div class="rk-bar"><i class="rk-loopfill" style="--w:84%;animation-delay:.6s"></i></div></div><span class="rk-stampd">READY</span></div>` +
    `<div class="rk-row"><span class="rk-tag rk-mut" style="text-decoration:line-through">by hand · slow</span><div style="animation:rk-bobble 2.2s infinite">${P('#B26A2E')}</div><span class="rk-tag">manager doesn't wait</span></div></div>` +
    `<div class="out"><div class="rk-tag">// built from your tech base</div>` +
    `<div class="rk-line rk-cyc" style="--d:5s">items selected <span class="rk-ok">✓</span></div>` +
    `<div class="rk-line rk-cyc" style="--d:5s;animation-delay:.6s">specs <span class="rk-ok">✓</span></div>` +
    `<div class="rk-line rk-cyc" style="--d:5s;animation-delay:1.2s">terms & pricing <span class="rk-ok">✓</span></div>` +
    `<div class="rk-line rk-amber rk-cyc" style="--d:5s;animation-delay:1.8s">a draft in a minute, not days</div></div>` +
    `<div class="cap"><b>This is you,</b> if proposals get assembled by hand, for days.</div>`,
  panel:
    `<div class="stage"><span class="rk-sweep"></span><div class="rk-row" style="justify-content:space-between"><span class="rk-tag">cockpit · all departments</span><span class="rk-tag rk-warn" style="animation:rk-blink 1.2s infinite">● 1 alert</span></div>` +
    `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px"><div class="rk-gauge"><div class="rk-tag rk-ok">SALES <span>▲</span></div>${SPARK('#8FD08A', true)}</div><div class="rk-gauge"><div class="rk-tag rk-mut">FINANCE <span>→</span></div>${SPARK('#8A7E71', true)}</div><div class="rk-gauge rk-alert"><div class="rk-tag rk-warn">INVENTORY <span>▼</span></div>${SPARK('#F0653F', false)}</div></div>` +
    `<div class="rk-row">${P('#3E6E8E')}<span class="rk-tag rk-amber">AI: inventory −8% vs plan — look here</span></div></div>` +
    `<div class="out"><div class="rk-tag">// one screen instead of 7 reports</div>` +
    `<div class="rk-line">revenue <span class="rk-ok">▲ 112%</span></div>` +
    `<div class="rk-line">margin <span class="rk-mut">→ 31%</span></div>` +
    `<div class="rk-line rk-warn">inventory 78% · downtime risk</div>` +
    `<div class="rk-line" style="border-top:1px solid #3A332C;padding-top:5px">reports assemble themselves</div></div>` +
    `<div class="cap"><b>This is you,</b> if decisions are made by gut, not by instruments.</div>`,
  employee:
    `<div class="stage"><div class="rk-row" style="justify-content:space-between"><span class="rk-tag">digital employee · today</span><span class="rk-tag rk-ok">● 24/7</span></div>` +
    `<div class="rk-row" style="align-items:flex-end;position:relative"><div style="position:relative;animation:rk-bobble 2.6s infinite">${BOT}<span class="rk-glow"></span></div>` +
    `<div style="display:flex;flex-direction:column;gap:3px;margin-left:2px"><span class="rk-line rk-cyc" style="--d:5s">email to client <span class="rk-ok rk-tickpop">✓</span></span><span class="rk-line rk-cyc" style="--d:5s;animation-delay:.6s">meeting — Thu 15:00 <span class="rk-ok rk-tickpop">✓</span></span><span class="rk-line rk-cyc" style="--d:5s;animation-delay:1.2s">task → @Irina <span class="rk-ok rk-tickpop">✓</span></span><span class="rk-line rk-mut rk-cyc" style="--d:5s;animation-delay:1.8s">meeting summary…</span></div>` +
    `<span class="rk-paper"></span><span class="rk-paper" style="animation-delay:1.6s"></span></div>` +
    `<div class="rk-row"><div style="animation:rk-bobble 3s infinite">${P('#6B8E6A')}</div><div style="animation:rk-bobble 3s infinite .4s">${P('#B26A2E')}</div><span class="rk-tag">the team does real work, not admin</span></div></div>` +
    `<div class="out"><div class="rk-tag">// it handles the whole team's routine</div>` +
    `<div class="rk-line">14 emails · 6 meetings</div>` +
    `<div class="rk-line">9 tasks · 3 summaries</div>` +
    `<div class="rk-line">remembers company context <span class="rk-ok">✓</span></div>` +
    `<div class="rk-line rk-amber" style="border-top:1px solid #3A332C;padding-top:5px">one instead of routine for everyone</div></div>` +
    `<div class="cap"><b>This is you,</b> if admin routine eats your best people.</div>`,
};

export function initScenes(): void {
  const slots = [...document.querySelectorAll<HTMLElement>('[data-scene]')];
  if (!slots.length) return;

  // Локаль страницы — из <html lang> (Base.astro: <html lang={locale}>), а не
  // из легаси-эвристики isEN() (поиск кнопки-переключателя языка с текстом
  // "EN · RU"/"RU · EN" среди всех button/a/div/span на странице): здесь нет
  // клиентского тумблера языка — RU/EN это разные статические сборки, поэтому
  // document.documentElement.lang надёжно и однозначно даёт то же самое, что
  // легаси пыталось угадать текстовым поиском.
  const scenes = document.documentElement.lang === 'en' ? SCENES_EN : SCENES_RU;

  let any = false;
  slots.forEach((s) => {
    if (s.dataset.filled) return;
    const key = s.getAttribute('data-scene') as DemoKey | null;
    if (key && scenes[key]) {
      s.innerHTML = scenes[key];
      s.dataset.filled = '1';
      any = true;
    }
  });

  // index.html:1949 — дёргает resize после вставки сцен, т.к. вставленный
  // контент меняет scrollHeight карточек/страницы; здесь это нужно как минимум
  // Nav'у (src/scripts/nav.ts слушает resize для пересчёта прогресс-бара) и
  // спотлайту (src/scripts/spotlight.ts — держит открытую карточку на
  // height:auto по resize).
  if (any) {
    try {
      window.dispatchEvent(new Event('resize'));
    } catch {
      // ignore — как и в легаси (index.html:1949: `try{...}catch(e){}`)
    }
  }
}
