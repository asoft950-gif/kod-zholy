/* Bitlings ойыны: 1-аймақ «Бастау даласы» деңгейлері және ферма.
   Карта белгілері: # қабырға · . жол · S бастау · E шығу · c тиын · k кілт · D есік · ^ тікен · ~ су · M жау · B бастық · f жыртылған жер */
(() => {
  "use strict";
  const t = KZ.t;
  const HERO = { hp: 14, atk: 4, heals: 2 };

  KZ.gameData = () => ({
    zone: { id: "z1", name: t("1-аймақ: Бастау даласы"), intro: t("Бит Матрицаның ішінде ұйықтап қалды. Сен кодпен оны жол бойымен жүргізіп, шығатын порталға жеткізуің керек!") },
    levels: [
      {
        id: "g1", mode: "walk", dir: 1, par: 1, title: t("Алғашқы қадам"),
        story: t("Бит оңға қарап тұр. Порталға жету үшін алға жүргіз."),
        goal: t("Порталға (🌀) жет"),
        map: ["#######", "#S...E#", "#######"],
        learn: ["alga(n)"],
        start: "# Бит оңға қарап тұр\nalga(4)\n",
      },
      {
        id: "g2", mode: "walk", dir: 1, par: 3, title: t("Бұрылыс"),
        story: t("Жол төмен қарай бұрылады. onga() — оңға бұрыл, solga() — солға."),
        goal: t("Порталға жет"),
        map: ["#####", "#S..#", "###.#", "###E#", "#####"],
        learn: ["alga(n)", "onga()", "solga()"],
        start: "alga(2)\n# мұнда бұрылу керек\n",
      },
      {
        id: "g3", mode: "walk", dir: 1, par: 7, title: t("Алтын жол"),
        story: t("Матрицаның тиындарын жина! Қайталанатын қадамдарды for циклімен қысқарт."),
        goal: t("Барлық тиынды жина да, порталға жет"),
        map: ["###########", "#S.c.c.c.c#", "#########.#", "#E.c.c.c..#", "###########"],
        learn: ["for i in range(n):"],
        start: "for i in range(4):\n    alga(2)\n",
      },
      {
        id: "g4", mode: "walk", dir: 1, par: 6, title: t("Қабырғаға дейін"),
        story: t("Жолдың ұзындығын білмейсің. zhol_bos() — алдыңда жол бар ма? Қабырғаға дейін жүр!"),
        goal: t("Порталға жет"),
        map: ["######", "#S...#", "####.#", "#E...#", "######"],
        learn: ["while zhol_bos():"],
        start: "while zhol_bos():\n    alga()\n",
      },
      {
        id: "g5", mode: "walk", dir: 1, par: 7, title: t("Кілт пен есік"),
        story: t("Есік (🚪) жабық. Төмендегі бөлмеден кілтті (🔑) ал да, қайтып кел."),
        goal: t("Кілтті алып, есіктен өтіп, порталға жет"),
        map: ["#########", "#S..D..E#", "#.#######", "#k......#", "#########"],
        learn: ["alga(n)", "onga()", "solga()"],
        start: "onga()\n",
      },
      {
        id: "g6", mode: "walk", dir: 1, par: 9, title: t("Тікенді дала"),
        story: t("Қызыл тікенге (🔺) баспа! Төменгі жолмен айналып өт."),
        goal: t("Тікенге баспай, порталға жет"),
        map: ["##########", "#S.^.^..E#", "#.c.c....#", "##########"],
        learn: ["tiken_bar()"],
        start: "alga()\n",
      },
      {
        id: "g7", mode: "walk", dir: 1, par: 4, hero: HERO, title: t("Бірінші шайқас"),
        story: t("Жолда Slime шықты! Шайқаста әр раундта shaiqas(men, zhau) функциясы шақырылады. Ол 'ur' (соқ), 'qorgan' (қорған) не 'emde' (емделу) қайтарады."),
        goal: t("Slime-ды жең де, порталға жет"),
        map: ["#########", "#S..M..E#", "#########"],
        enemies: { M: { name: "Slime", hp: 6, atk: 2, kind: "slime" } },
        learn: ["def shaiqas(men, zhau):", "men.hp", "zhau.hp", "return 'ur'"],
        start: "def shaiqas(men, zhau):\n    return \"ur\"\n\nalga(6)\n",
      },
      {
        id: "g8", mode: "walk", dir: 1, par: 7, hero: HERO, title: t("Ауыр соққы"),
        story: t("Bug әр 3-раундта ауыр соққы (⚠️) береді: zhau.auyr == True. Сол кезде қорған!"),
        goal: t("Bug-ты жең де, порталға жет"),
        map: ["#########", "#S..M..E#", "#########"],
        enemies: { M: { name: "Bug", hp: 15, atk: 3, heavy: 3, kind: "bug" } },
        learn: ["if zhau.auyr:", "return 'qorgan'", "men.heals"],
        start: "def shaiqas(men, zhau):\n    return \"ur\"\n\nalga(6)\n",
      },
      {
        id: "g9", mode: "walk", dir: 1, par: 10, hero: HERO, title: t("Матрица қарауылы"),
        story: t("Бірінші аймақтың бастығы! Ауыр соққыда қорған, денсаулығың азайса емделіп ал (2 рет), қалғанда соқ."),
        goal: t("Бастықты жең де, порталға жет"),
        map: ["###########", "#S...B...E#", "###########"],
        enemies: { B: { name: t("Қарауыл"), hp: 24, atk: 3, heavy: 4, kind: "boss" } },
        learn: ["elif men.hp <= 6 and men.heals > 0:", "return 'emde'"],
        start: "def shaiqas(men, zhau):\n    if zhau.auyr:\n        return \"qorgan\"\n    return \"ur\"\n\nalga(8)\n",
      },
    ],
    farm: [
      {
        id: "f1", mode: "farm", dir: 1, par: 9, goal: 5, ripe: 3, title: t("Алғашқы егін"),
        story: t("Ферма! ek() — тұқым ек, zhi() — пісті ме, жина. Дақыл пісуге үш қадам керек. Бес кристалл жина."),
        goal_t: t("5 кристалл жина"),
        map: ["########", "#Sfffff#", "########"],
        learn: ["ek()", "zhi()", "pisti()"],
        start: "# 1) жүріп отырып ек\nfor i in range(5):\n    alga()\n    ek()\n",
      },
      {
        id: "f2", mode: "farm", dir: 1, par: 18, goal: 12, ripe: 3, title: t("Үлкен танап"),
        story: t("Танап енді екі қатар: ішіне цикл салып, барлығын ек те жина."),
        goal_t: t("12 кристалл жина"),
        map: ["#######", "#Sffff#", "#.ffff#", "#.ffff#", "#######"],
        learn: ["for ішінде for", "pisti()"],
        start: "",
      },
      {
        id: "f3", mode: "farm", dir: 1, par: 18, goal: 20, ripe: 4, title: t("Кристалл бақ"),
        story: t("Үлкен бақ: 20 кристалл! Қатарлап ек, содан соң қатарлап жина. pisti() — тек пісіп тұрғанын жина."),
        goal_t: t("20 кристалл жина"),
        map: ["#########", "#Sfffff.#", "#.fffff.#", "#.fffff.#", "#.fffff.#", "#########"],
        learn: ["while", "if pisti():"],
        start: "",
      },
    ],
  });
})();
