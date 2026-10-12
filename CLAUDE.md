# Bitlings (kod-zholy) — жоба туралы Claude Code үшін

Статикалық SPA: Python/HTML/CSS/JS/Kotlin/SQL-ды қазақша және орысша үйрететін сайт.
Репо `asoft950-gif/kod-zholy`, хостинг Vercel (https://bitlings-kz.vercel.app), база Supabase («botakod»).

## Иесімен жұмыс ережелері
- Иесі қазақша жазады, көбіне телефоннан. Жауапты қазақша, қысқа жаз.
- Нақты оқушылармен тексеруді ұсынба.
- Өзгерісті өзің `origin/main`-ге commit + push жаса, сұрамай.
- Құпиялар (кілттер, токендер, пароль) репоға ешқашан жазылмайды. Supabase/Vercel-ге жазу рұқсаты жоқ: SQL-ды иесі қолмен іске қосады (`supabase/*.sql`, `SUPABASE.md`).
- Commit соңына: `Co-Authored-By: Claude <noreply@anthropic.com>`.

## Құрылым
- `index.html` + `js/*.js` (hash-router, `KZ.*` ғаламдық нысаны), `style.css`, `sw.js` (service worker: жаңа JS файл `index.html`-ге де, `sw.js` SHELL тізіміне де қосылады; pre-commit hook SW нұсқасын жаңартады).
- i18n: `KZ.t("қазақша мәтін")`; орысша аудармалар `js/i18n/ru.js` (жаңа кілттерді «Қатенің мәтіні: %s» алдына қос).
- Курстар `js/courses/`, ойын `js/game.js` + `py/game.py`, push `api/push.js`.

## Битлинг (кейіпкер)
- Суреттер `img/bitling/`: базалық sprite-sheet `<анимация>.webp`, киім `<киім>-<анимация>.webp`, аксессуар `acc-<id>-<front|side|back>.webp`, орналасу `att-<киім>.json`, ереже `wardrobe.json`. Анимациялар: idle, blink, wave, walk-up/right/down/left. Кадр 512×512, аяқ нүктесі (256,452).
- `js/mascot.js`: кадр ойнатқыш + `<canvas class="mz">` қозғалтқышы; аксессуар түзетулері `ADJ` кестесінде (dx, dy, масштаб).
- `js/hero.js`: `ITEMS` (киім/аксессуар), слоттар, ашылу шарттары. Тек `sk_street` бастапқы, қалған 17 зат жетістік (`unlock`) арқылы. Күй `kodzholy.hero.v1` (mv:5).
- Оқу тәртібі `js/core.js` (`KZ.progress`): келесі тақырып алдыңғысы өтілгенде ашылады, тапсырма лекция «оқылды» болғанда ашылады. «Барлығын ашу» тек мұғалім/админ/құрушыға.

## Тексеру
- Жергілікті сервер: `python3 -m http.server 8765` (түбірден), Playwright screenshot-тарымен тексеру. Сыртқы желіні бұғаттап, `window.CodeMirror`-ды жалған нысанмен ауыстыр.
