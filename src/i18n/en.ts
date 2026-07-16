// EN translations. Typed against `Dict` (= typeof ru, leaves widened to `string`
// because ru.ts has no `as const`) — a missing/extra key here is a compile error
// (`npm run check` / `astro check`), so this dict can never silently drift from ru.ts.
import type { Dict } from './ru';

export const en: Dict = {
  nav: {
    // источник переводов: i18n.js (window.__RAKURS_EN)
    brand: 'rakurs',
    solutions: 'Solutions',
    how: 'How we work',
    cases: 'Case Studies',
    founders: 'Founders',
    cta: 'Improve Your Business',
    langCurrent: 'EN',
    langAlt: 'RU',
    // "Меню" не переводился в legacy i18n.js (data-i18n-skip на бургере) —
    // переведено вручную для этого словаря
    burgerLabel: 'Menu',
  },
  hero: {
    // источник переводов: i18n.js (window.__RAKURS_EN), ключи "// диагностика
    // операционных потерь...", "Находим, где ваш бизнес теряет"/"деньги"/
    // ". И закрываем это готовыми ИИ-решениями.", "Подобрать решение",
    // "Смотреть витрину ↓", "дыра_0N · ...", "КЛИЕНТЫ ПЛАТЯТ"/"ДОХОДИТ ДО ВАС", "Лид"
    eyebrow: '// operational loss diagnostics and ready-made AI solutions',
    headlineBefore: 'We find where your business is losing ',
    headlineHighlight: 'money',
    headlineAfter: '. And we close those gaps with ready-made AI solutions.',
    subline:
      "We don't sell \"AI adoption\" — we close the holes your money leaks through. Fixed price, launch in 1–2 weeks, payback calculated before we start.",
    ctaPrimary: 'Find Your Solution',
    ctaSecondary: 'View Showcase ↓',
    note: "First step—a 20-minute conversation. If it turns out you don't need us, we'll say so.",
    pipeLabelIn: 'CLIENTS PAY',
    pipeLabelOut: 'REACHES YOU',
    pipeLead: 'Lead',
    leak1Title: 'leak_01 · People',
    leak1Desc: 'burnout, churn',
    leak2Title: 'leak_02 · Handoffs',
    leak2Desc: 'requests get lost',
    leak3Title: 'leak_03 · Routine',
    leak3Desc: 'engineer as operator',
    pipeCaption: 'Money comes in — and leaks out through the holes. We close them.',
  },
  pain: {
    // источник переводов: i18n.js (window.__RAKURS_EN)
    eyebrow: "// why leaks don't show up in reports",
    heading: "Reports look good. Nobody's just looking at them from the right angle.",
    lead: 'Everyone is doing AI. Automating the wrong things just speeds up the chaos — at your expense. The real losses hide where dashboards never look.',
    reportStatusGood: '● goals met', // легаси не переводит эту строку (уже EN в RU-разметке) — идентично в обоих словарях
    kpiRevenue: 'REVENUE',
    kpiProfit: 'PROFIT',
    kpiSla: 'SLA',
    kpiConversion: 'CONVERSION',
    kpiNps: 'NPS',
    kpiLoad: 'CAPACITY',
    chartCaptionGood: '● 0 incidents · plan on track',
    chartQGood: 'Q2 · results',
    reportTrueTitle: 'DASHBOARD · RAKURS PERSPECTIVE',
    reportStatusBad: '● Money is leaking out',
    kpiLost: 'LOST',
    kpiPayrollIdle: 'PAYROLL IDLE',
    kpiSlaNight: 'SLA AT NIGHT',
    kpiChurn: 'CHURN',
    kpiCritErrors: 'CRIT. ERRORS',
    kpiRoutine: 'BUSYWORK',
    chartCaptionBad: '● −$38K/mo leaking past the register',
    chartQBad: 'Q2 · reality',
    reportHint: 'pan across your dashboard—behind those beautiful upward arrows lies a different story',
    hole1Title: 'leak_01 · People',
    hole1Desc: 'Burnout, turnover and broken communication turn part of your payroll into paying for idle time.',
    hole1Tag: 'payroll → payment for idle time',
    hole2Title: 'leak_02 · Handoffs',
    hole2Desc: "Requests, days and clients get lost between departments. It's always the neighbour's fault — and the company pays.",
    hole2Tag: 'leads and customers → missed revenue',
    hole3Title: 'leak_03 · Routine',
    hole3Desc: 'Expensive specialists spend hours doing an algorithm’s job. You pay for an engineer and get an operator.',
    hole3Tag: 'engineer salary, operator output',
    closingBefore: "That's why every solution we build starts with one question ",
    closingHighlight: '"which money leak does it close"',
    closingAfter: ", and our express diagnosis shows which one pays for itself first.",
  },
  how: {
    // источник переводов: i18n.js (window.__RAKURS_EN)
    eyebrow: "// path: from 'where we're losing money' to 'results that stick'",
    heading: "Three steps—from identifying leaks to permanent impact",
    step1Label: '3–5 DAYS · FIXED',
    step1Title: 'Express Diagnostic',
    step1Desc: 'A short series of interviews and a process review from our angle. The output: the top 3 money leaks and which solution closes the most expensive one first.',
    step1Price: '$1,500–3,000 flat · credited toward your solution',
    step2Label: '1–2 WEEKS · FIXED',
    step2Title: 'Solution Launch',
    step2Desc: 'Assembled from proven templates, tuned to your data and systems. The price is fixed up front — no surprises on the invoice.',
    step3Label: 'MONTHLY · SUBSCRIPTION',
    step3Title: 'Support & Optimization',
    step3Desc: "Hosting, support, retraining and impact reports — the solution keeps getting smarter, and the effect doesn't roll back.",
  },
  flagship: {
    // источник переводов: i18n.js (window.__RAKURS_EN)
    eyebrow: '// for companies 50+ employees — we go deeper',
    heading: 'When the leak is bigger than an off-the-shelf solution, we run a full program',
    lead: "Not a box—a surgical operation at your scale: we find your costliest losses, close them end-to-end, and stay until the results become part of your operations.",
    depth1Label: 'Depth 1 · surface',
    depth1Title: 'In-Depth Diagnostics',
    depth1Desc: 'Interviews, surveys, analysis of processes and communication. The result: a report pricing every hole in money per year.',
    depth2Label: 'Depth 2 · inside processes',
    depth2Title: 'Implementation',
    depth2Desc: 'We design and launch a solution for your biggest leak: system integrations, workflows, team training.',
    depth3Label: 'Depth 3 · sustainable results',
    depth3Title: 'Support & Optimization',
    depth3Desc: 'We stay on until results stick: monitoring metrics, refining the solution, supporting your team.',
    calcTitle: 'HOW MUCH IS ONE LEAK COSTING YOUR COMPANY ANNUALLY?',
    calcStep1Label: '① estimate annual losses — slide to adjust',
    calcStep2Label: '② implementation costs a fraction of what we close',
    calcBuildLabel: 'IMPLEMENTATION ·',
    calcKeepLabel: 'STAYS WITH YOU · YEAR 1',
    calcNote: "Estimate is illustrative—we calculate exact loss on diagnostics. You pay from money you're already losing.",
    closing: "If you decide not to continue, the report stays with you: you'll know exactly where and how much you're losing.",
    cta: 'Discuss the program',
  },
  founders: {
    // источник переводов: i18n.js (window.__RAKURS_EN)
    eyebrow: '// Rakurs founders',
    heading: 'Two people who own the results personally',
    // legacy никогда не переводит alt — идентично RU-словарю (см. комментарий в ru.ts)
    photoAlt: 'Андрей и Егор, основатели Rakurs',
    photoCaption: 'Andrey and Egor · Rakurs founders',
    introP1: 'For years we watched good companies quietly lose money — to burnout, departmental seams and routine — and watched beautiful rollouts die within three months.',
    introBefore: 'Rakurs exists so that never ',
    introHighlight: 'happens again',
    introAfter: '.',
    andreyName: 'Andrey',
    andreyRole: 'co-founder',
    andreyTag: '// sees processes through people',
    andreyDesc: 'Business psychologist. Sees losses that never show up in data: burnout, friction between teams, management chaos.',
    andreyStat1Value: '10+',
    andreyStat1Label: 'YEARS DIAGNOSING',
    andreyStat2Value: 'teams',
    andreyStat2Label: 'AND ORGANIZATIONS',
    egorName: 'Egor',
    egorRole: 'co-founder',
    egorTag: '// sees people through processes',
    egorDesc: 'AI automation engineer: AI agents, RAG, CRM and ERP integrations. Banking, insurance, public sector, marketplaces, enterprise.',
    egorStat1Value: '100+',
    egorStat1Label: 'PROJECTS',
    egorStat2Value: 'CRM · ERP',
    egorStat2Label: 'INTEGRATIONS',
    teamNote: 'The founders run every project personally; scale is carried by the team — engineers, analysts, design.',
    quoteBefore: 'An agency sells you a bot and leaves. A consultant finds the problem—and also leaves. ',
    quoteHighlight: "We find the leak, price it in dollars, close it with a proven solution, and stay on by subscription so the gains don't reverse.",
  },
  storefront: {
    // из i18n.js (легаси runtime-переводчик) — строки существуют там 1:1,
    // отмечены построчно ниже; см. комментарий в ru.ts про мёртвый
    // .rk-store-nav/.rk-arrow код (aria-label для стрелок не понадобился).
    eyebrow: '// solution showcase—hover over any one and it goes to work', // i18n.js:222
    heading: 'Fixed-price ready solutions. Launch in one to three weeks.', // i18n.js:223
    lead: 'Six ready-made products from proven templates. Under each: a specific money leak, a live demo, and a price with no fine print.', // i18n.js:125
    hint: 'Expand any solution — the demo comes alive right inside the card.', // i18n.js:126
    inclPriceLabel: 'IN THE SOLUTION PRICE', // i18n.js:274
    inclPriceDesc: 'Setup to your data and workflows, integrations, and launch. Fixed price—no surprises on the invoice.', // i18n.js:275
    inclSubLabel: 'IN THE SUBSCRIPTION', // i18n.js:276
    inclSubDesc: 'Hosting, quality control, and continuous learning. The solution keeps getting smarter after launch.', // i18n.js:277
    inclUnsureLabel: 'UNSURE WHERE TO START?', // i18n.js:278
    inclUnsureDesc: "Start with an express diagnostic—we'll credit the cost toward your chosen solution.", // i18n.js:279
    inclFootText: "Not sure what to tackle first? In 20 minutes, we'll show you what pays back fastest.", // i18n.js:280
    inclFootCta: 'Start with a diagnostic', // i18n.js:281
  },
  cases: {
    // источник переводов: i18n.js (window.__RAKURS_EN)
    eyebrow: "// archive of snapshots — drag to reveal the 'after'",
    heading: 'What changes after we work with you',
    lead: 'Pick a case — and reveal what it was before and what it became after.',
    beforeLabel: '◄ BEFORE',
    afterLabel: 'BECAME ►',
    scrubHint: "pull the curtain ↔ reveal the 'after'",
    footnote:
      'Client metrics are under NDA — we show the mechanics on a call. 50+ projects in the portfolio: banks, insurance, public sector, marketplaces, enterprise.',
  },
  faq: {
    // источник переводов: i18n.js (window.__RAKURS_EN)
    eyebrow: '// frequently asked questions',
    heading: 'Questions we get before the first call',
  },
  form: {
    // источник переводов: i18n.js (window.__RAKURS_EN)
    eyebrow: '// where to start improving your business', // i18n.js:346
    heading: "Your first step—and the first money that stops leaking", // i18n.js:347
    lead: "Tick what hurts — that's the input for the express diagnostic. Then 20 minutes by voice: we'll already point to where to look for losses.", // i18n.js:170 (same string reused in this section)
    successTitle: 'Thank you! Your request is in.', // i18n.js:376
    successText: 'We reply within one business day—and usually point to where to look for losses right on the first call.', // i18n.js:377
    successFootnoteBefore: "If you don’t hear back within 24 hours, email ", // i18n.js:373
    ticketLabel: 'WHAT YOU GET', // i18n.js:349
    ticketItem1: "top-3 money leaks—where and how much you're losing", // i18n.js:350
    ticketItem2: 'which solution closes the costliest one first', // i18n.js:351
    ticketItem3: 'fixed-price diagnostic, credited toward the solution', // i18n.js:352
    ticketNote: "If it turns out you don't need us, we'll say so on the very first call.", // i18n.js:353
    ticketFooter: '✂ express diagnostic request', // i18n.js:354
    kadrLabel: 'IMPROVEMENT PLAN · IN FOCUS', // i18n.js:355
    kadrEmpty: "Mark your pain points on the right—they'll gather here, into the improvement plan.", // i18n.js:356
    chipsLabel: 'WHAT HURTS? (select any)', // i18n.js:357
    chips: [
      'inquiries get lost in the evenings and at night', // i18n.js:358
      'proposals take days to prepare', // i18n.js:359
      'operators drown in repetitive requests', // i18n.js:360
      "knowledge locked in people's heads", // i18n.js:361
      "I can't tell where we're losing money", // i18n.js:362
      "something else—I'll explain on the call", // i18n.js:363
    ],
    // плейсхолдеров полей нет в i18n.js (легаси их не переводил) — переведены
    // вручную для этого словаря
    placeholderName: 'Name',
    placeholderCompany: 'Company',
    placeholderRole: 'Role at the company',
    placeholderContact: 'Telegram / email / WhatsApp',
    placeholderPain: "What hurts—in your own words (optional)",
    consentText: 'I consent to the processing of personal data to respond to my request.', // i18n.js:364
    errorText: 'Please check the consent box', // i18n.js:372
    submitCta: 'Improve your business—start with a diagnostic', // i18n.js:365
    subnote: '20 minutes · no obligation · we reply within one business day', // i18n.js:366
  },
  footer: {
    brand: 'rakurs',
    tagline: 'ready-made AI solutions and operational loss diagnostics',
    email: 'zaytsev.psy@gmail.com',
  },
  detail: {
    // Task 19 — product/case detail pages. Not in legacy i18n.js (these pages
    // didn't exist there) — translated manually.
    back: '← Back',
    getsHeading: "What's included",
  },
};
