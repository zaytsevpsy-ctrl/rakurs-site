# rakurs-site

Rakurs landing (static HTML+JS). Язык определяется по браузеру: RU-браузер видит русскую версию, остальные — EN (тоггл EN/RU в шапке). Publish via GitHub Pages: Settings -> Pages -> main / root.

## Состав

- `index.html` — вся страница (разметка + логика).
- `i18n.js` — словарь RU→EN (ключ = точная русская строка из DOM).
- `support.js` — рантайм-фреймворк страницы.
- `rakurs-team.jpg` — фото основателей (используется и как og:image).
- `.nojekyll` — отключает Jekyll-обработку на Pages.

## Форма заявок: FormSubmit — активация (1 раз)

Форма шлёт заявки через `https://formsubmit.co/ajax/zaytsev.psy@gmail.com` (без регистрации).

1. После деплоя отправьте с сайта первую тестовую заявку.
2. FormSubmit пришлёт на zaytsev.psy@gmail.com письмо «Confirm your email» — нажмите кнопку активации.
3. Отправьте вторую тестовую заявку — она уже придёт письмом с полями (name, company, role, contact, pain, plan, lang, page).

Пока активация не выполнена, заявки не доставляются — не пропустите шаг 2.

## Аналитика: как включить за 10 минут

В `<head>` index.html лежит закомментированный блок с двумя вариантами:

- **Вариант A — Google Analytics 4:** создайте аккаунт/поток на analytics.google.com, замените `G-XXXXXXXXXX` на свой Measurement ID и раскомментируйте блок A.
- **Вариант B — GoatCounter (без cookie-баннера):** заведите код на goatcounter.com, замените `MYCODE` и раскомментируйте блок B.

Достаточно одного варианта.

## TODO

- Вернуть LinkedIn-ссылку в футере, когда появится реальный URL профиля (сейчас там TODO-комментарий).
- Купить домен и обновить og:url/og:image + адрес почты.
