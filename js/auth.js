/* Ботакод: аккаунттар (Supabase), рөлдер, прогресті бұлтпен синхрондау */
(() => {
  "use strict";

  const SB_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
  const cfg = KZ.config || {};
  const listeners = [];
  let client = null;
  let syncTimer = null;
  let syncing = false;
  let readyResolve;

  const ERRORS = {
    not_active: "Аккаунтың әлі белсенді емес (бекітілмеген не бұғатталған).",
    forbidden: "Бұған рұқсатың жоқ.",
    no_class: "Мұндай сынып коды жоқ. Кодты тексеріп көр.",
    bad_name: "Атауы тым қысқа.",
    bad_status: "Қате күй.",
    bad_role: "Қате рөл.",
    no_user: "Пайдаланушы табылмады.",
    owner_exists: "Құрушы бұрыннан бар.",
    "Invalid login credentials": "Email не құпиясөз қате.",
    "User already registered": "Бұл email бұрын тіркелген. «Кіру» бетіне өт.",
    "Email not confirmed": "Email әлі расталмаған. Поштаңды тексеріп, сілтемені бас.",
    "Unable to validate email address": "Email дұрыс жазылмаған.",
    "Signup requires a valid password": "Құпиясөзді жаз.",
  };

  function kz(msg) {
    msg = String(msg || "");
    for (const k of Object.keys(ERRORS)) if (msg.includes(k)) return ERRORS[k];
    if (/at least 6 characters/i.test(msg)) return "Құпиясөз кемінде 6 таңбадан тұруы керек.";
    if (/rate limit|too many/i.test(msg)) return "Тым жиі әрекет жасадың. Біраз күте тұр.";
    if (/Failed to fetch|NetworkError|network/i.test(msg)) return "Байланыс жоқ. Интернетті тексер.";
    return "Қате шықты: " + msg;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Failed to fetch " + src));
      document.head.appendChild(s);
    });
  }

  function emit() {
    listeners.forEach((f) => {
      try {
        f(A.profile);
      } catch (e) {
        console.error(e);
      }
    });
  }

  /* Осы құрылғыдағы Ботакод деректерін өшіру (баптаулардан басқасын) */
  function wipeLocal() {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("kodzholy.") && k !== "kodzholy.openall")
        .forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      /* маңызды емес */
    }
    KZ.progress.reset();
    KZ.updateTotal();
  }

  const A = (KZ.auth = {
    enabled: !!(cfg.supabaseUrl && cfg.supabaseKey),
    profile: null, // { id, email, full_name, role, status }
    ready: null,

    onChange(f) {
      listeners.push(f);
    },
    isActive() {
      return !!(A.profile && A.profile.status === "active");
    },
    isStaff() {
      return A.isActive() && ["owner", "admin"].includes(A.profile.role);
    },
    canTeach() {
      return A.isActive() && ["owner", "admin", "teacher"].includes(A.profile.role);
    },
    roleLabel(r) {
      return { owner: "Құрушы", admin: "Админ", teacher: "Мұғалім", student: "Оқушы" }[r] || r;
    },
    statusLabel(s) {
      return { active: "белсенді", pending: "бекітуді күтуде", blocked: "бұғатталған" }[s] || s;
    },

    async rpc(name, args) {
      if (!client) throw new Error("Аккаунттар қосылмаған.");
      const { data, error } = await client.rpc(name, args || {});
      if (error) throw new Error(kz(error.message));
      return data;
    },

    async signUp({ email, password, name, role, classCode }) {
      let res;
      try {
        res = await client.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: (name || "").trim(),
              want_role: role === "teacher" ? "teacher" : "student",
              class_code: (classCode || "").trim(),
            },
          },
        });
      } catch (e) {
        throw new Error(kz(e.message));
      }
      if (res.error) throw new Error(kz(res.error.message));
      if (!res.data.session) return { needsConfirm: true };
      await loadProfile();
      return { needsConfirm: false };
    },

    async signIn(email, password) {
      const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw new Error(kz(error.message));
      await loadProfile();
    },

    async signOut() {
      try {
        await client.auth.signOut();
      } catch (e) {
        /* маңызды емес */
      }
      A.profile = null;
      wipeLocal();
      emit();
    },

    async refreshProfile() {
      await loadProfile();
    },

    /* Жергілікті прогресті жіберіп, бұлттағыны біріктіріп алу */
    async syncNow() {
      if (!A.isActive() || syncing) return;
      syncing = true;
      try {
        const local = KZ.progress._load();
        const items = [];
        Object.keys(local).forEach((c) => Object.keys(local[c]).forEach((l) => items.push({ c, l, s: local[c][l] })));
        const read = [];
        const rd = KZ.read._all();
        Object.keys(rd).forEach((c) => rd[c].forEach((l) => read.push({ c, l })));
        const res = await A.rpc("sync_progress", { items, read });
        const merged = {};
        res.progress.forEach((p) => {
          merged[p.c] = merged[p.c] || {};
          merged[p.c][p.l] = p.s;
        });
        const mread = {};
        res.read.forEach((p) => {
          mread[p.c] = mread[p.c] || [];
          mread[p.c].push(p.l);
        });
        KZ.store.set("kodzholy.progress.v2", merged);
        KZ.store.set("kodzholy.read.v1", mread);
        KZ.progress.reset();
        KZ.updateTotal();
        emit();
      } catch (e) {
        console.warn("sync:", e.message);
      } finally {
        syncing = false;
      }
    },

    queueSync() {
      if (!A.isActive()) return;
      clearTimeout(syncTimer);
      syncTimer = setTimeout(() => A.syncNow(), 1200);
    },
  });

  async function loadProfile() {
    const { data } = await client.auth.getSession();
    if (!data || !data.session) {
      A.profile = null;
      return emit();
    }
    let p = null;
    try {
      p = await A.rpc("my_profile");
    } catch (e) {
      console.warn("profile:", e.message);
    }
    A.profile = p;
    if (p) {
      // басқа адамның деректері осы құрылғыда қалып қойса, тазалаймыз
      const prev = KZ.store.get("kodzholy.uid", null);
      if (prev && prev !== p.id) wipeLocal();
      KZ.store.set("kodzholy.uid", p.id);
    }
    emit();
    if (A.isActive()) await A.syncNow();
  }

  async function init() {
    if (!A.enabled) return;
    try {
      if (!window.supabase) await loadScript(SB_URL);
      client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" },
      });
      await loadProfile();
      if (/[?&]code=/.test(location.search)) history.replaceState(null, "", location.pathname + location.hash);
      client.auth.onAuthStateChange((ev) => {
        if (ev === "SIGNED_OUT" && A.profile) {
          A.profile = null;
          emit();
        }
      });
    } catch (e) {
      console.warn("auth init:", e.message);
    }
  }

  A.ready = new Promise((r) => (readyResolve = r));
  init().finally(() => readyResolve());
})();
