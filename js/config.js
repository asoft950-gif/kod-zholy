/* Bitlings: Supabase баптаулары.
   Бұл екі мән ашық болуы ЗАҢДЫ (anon кілті жасырын емес): деректерді қорғайтын нәрсе — SQL ішіндегі ережелер.
   Бос қалса, аккаунттар өшірулі, сайт бұрынғыдай (қонақ режимінде) жұмыс істей береді.
   Қалай толтыру керегі: SUPABASE.md */
globalThis.KZ = globalThis.KZ || {};
KZ.config = {
  supabaseUrl: "https://owqamfxdnckpuhodnhqg.supabase.co",
  supabaseKey: "sb_publishable_3TFnP8lvK4J9Qu4iJXvy0g_kvwsSkHF",
  /* true қылу ТЕК Supabase-те өз SMTP қосылып, «Reset password» хат үлгісінде {{ .Token }} коды тұрғанда (README: «Поштамен қалпына келтіру») */
  emailReset: false,
};
