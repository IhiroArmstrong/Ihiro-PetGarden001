/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Frozen six-language daily chitchat probe inputs (PO 2026-09-17).
 * Locales: ja / en / it / de / es / fr — 18 sentences each (108 total).
 * Not #774 diff samples; for Gemma4-E4B jc vs unsloth first-ask annotation.
 * Do not swap sentences across probe runs — compare like with like.
 */

/** @type {readonly string[]} */
export const CONFIDE_MULTILANG_CHITCHAT_LOCALES = Object.freeze([
  'ja',
  'en',
  'it',
  'de',
  'es',
  'fr'
]);

/** @type {readonly { id: string, locale: string, text: string }[]} */
export const CONFIDE_MULTILANG_CHITCHAT_FIXTURES = Object.freeze([
  // ja — 18
  Object.freeze({ id: 'ja-chitchat-01', locale: 'ja', text: 'おはよう、今日は元気？' }),
  Object.freeze({ id: 'ja-chitchat-02', locale: 'ja', text: '今日は天気がいいね。' }),
  Object.freeze({ id: 'ja-chitchat-03', locale: 'ja', text: 'お昼にスープを作った。' }),
  Object.freeze({ id: 'ja-chitchat-04', locale: 'ja', text: '雨の日は好き？' }),
  Object.freeze({ id: 'ja-chitchat-05', locale: 'ja', text: 'ちょっと眠いかも。' }),
  Object.freeze({ id: 'ja-chitchat-06', locale: 'ja', text: '静かな音楽を聴いた。' }),
  Object.freeze({ id: 'ja-chitchat-07', locale: 'ja', text: 'うちの猫がまた寝てる。' }),
  Object.freeze({ id: 'ja-chitchat-08', locale: 'ja', text: 'それ、ちょっと笑った。' }),
  Object.freeze({ id: 'ja-chitchat-09', locale: 'ja', text: '今朝は早く起きた。' }),
  Object.freeze({ id: 'ja-chitchat-10', locale: 'ja', text: '夜が静かだね。' }),
  Object.freeze({ id: 'ja-chitchat-11', locale: 'ja', text: 'この部屋の隅が好き。' }),
  Object.freeze({ id: 'ja-chitchat-12', locale: 'ja', text: '今日はふわふわして見える。' }),
  Object.freeze({ id: 'ja-chitchat-13', locale: 'ja', text: '外は少し寒いね。' }),
  Object.freeze({ id: 'ja-chitchat-14', locale: 'ja', text: '傘を家に置いてきた、まあいいか。' }),
  Object.freeze({ id: 'ja-chitchat-15', locale: 'ja', text: '寝る前に少し本を読んだ。' }),
  Object.freeze({ id: 'ja-chitchat-16', locale: 'ja', text: '昼食後に少し歩いた。' }),
  Object.freeze({ id: 'ja-chitchat-17', locale: 'ja', text: 'お茶、飲む？' }),
  Object.freeze({ id: 'ja-chitchat-18', locale: 'ja', text: '去年の秋を思い出す。' }),

  // en — 18
  Object.freeze({ id: 'en-chitchat-01', locale: 'en', text: 'Good morning, how are you today?' }),
  Object.freeze({ id: 'en-chitchat-02', locale: 'en', text: 'The weather is nice today.' }),
  Object.freeze({ id: 'en-chitchat-03', locale: 'en', text: 'I made soup for lunch.' }),
  Object.freeze({ id: 'en-chitchat-04', locale: 'en', text: 'Do you like rainy days?' }),
  Object.freeze({ id: 'en-chitchat-05', locale: 'en', text: 'I feel a bit sleepy.' }),
  Object.freeze({ id: 'en-chitchat-06', locale: 'en', text: 'I listened to quiet music.' }),
  Object.freeze({ id: 'en-chitchat-07', locale: 'en', text: 'My cat is napping again.' }),
  Object.freeze({ id: 'en-chitchat-08', locale: 'en', text: 'That made me smile.' }),
  Object.freeze({ id: 'en-chitchat-09', locale: 'en', text: 'I woke up early today.' }),
  Object.freeze({ id: 'en-chitchat-10', locale: 'en', text: 'The evening feels calm.' }),
  Object.freeze({ id: 'en-chitchat-11', locale: 'en', text: 'I like this corner of the room.' }),
  Object.freeze({ id: 'en-chitchat-12', locale: 'en', text: 'You look cozy today.' }),
  Object.freeze({ id: 'en-chitchat-13', locale: 'en', text: 'It is a bit chilly outside.' }),
  Object.freeze({ id: 'en-chitchat-14', locale: 'en', text: 'I left my umbrella at home, oh well.' }),
  Object.freeze({ id: 'en-chitchat-15', locale: 'en', text: 'I read a few pages before bed.' }),
  Object.freeze({ id: 'en-chitchat-16', locale: 'en', text: 'I took a short walk after lunch.' }),
  Object.freeze({ id: 'en-chitchat-17', locale: 'en', text: 'Would you like some tea?' }),
  Object.freeze({ id: 'en-chitchat-18', locale: 'en', text: 'This reminds me of last autumn.' }),

  // it — 18
  Object.freeze({ id: 'it-chitchat-01', locale: 'it', text: 'Buongiorno, come stai oggi?' }),
  Object.freeze({ id: 'it-chitchat-02', locale: 'it', text: 'Oggi il tempo è bellissimo.' }),
  Object.freeze({ id: 'it-chitchat-03', locale: 'it', text: 'A pranzo ho fatto una zuppa.' }),
  Object.freeze({ id: 'it-chitchat-04', locale: 'it', text: 'Ti piacciono i giorni di pioggia?' }),
  Object.freeze({ id: 'it-chitchat-05', locale: 'it', text: 'Mi sento un po\' assonnato.' }),
  Object.freeze({ id: 'it-chitchat-06', locale: 'it', text: 'Ho ascoltato musica tranquilla.' }),
  Object.freeze({ id: 'it-chitchat-07', locale: 'it', text: 'Il mio gatto dorme di nuovo.' }),
  Object.freeze({ id: 'it-chitchat-08', locale: 'it', text: 'Mi ha fatto sorridere.' }),
  Object.freeze({ id: 'it-chitchat-09', locale: 'it', text: 'Oggi mi sono svegliato presto.' }),
  Object.freeze({ id: 'it-chitchat-10', locale: 'it', text: 'La sera è calma.' }),
  Object.freeze({ id: 'it-chitchat-11', locale: 'it', text: 'Mi piace questo angolo della stanza.' }),
  Object.freeze({ id: 'it-chitchat-12', locale: 'it', text: 'Oggi sembri accogliente.' }),
  Object.freeze({ id: 'it-chitchat-13', locale: 'it', text: 'Fuori fa un po\' freddo.' }),
  Object.freeze({ id: 'it-chitchat-14', locale: 'it', text: 'Ho lasciato l\'ombrello a casa, vabbè.' }),
  Object.freeze({ id: 'it-chitchat-15', locale: 'it', text: 'Ho letto qualche pagina prima di dormire.' }),
  Object.freeze({ id: 'it-chitchat-16', locale: 'it', text: 'Ho fatto una breve passeggiata dopo pranzo.' }),
  Object.freeze({ id: 'it-chitchat-17', locale: 'it', text: 'Ti va un po\' di tè?' }),
  Object.freeze({ id: 'it-chitchat-18', locale: 'it', text: 'Mi ricorda l\'autunno scorso.' }),

  // de — 18
  Object.freeze({ id: 'de-chitchat-01', locale: 'de', text: 'Guten Morgen, wie geht es dir heute?' }),
  Object.freeze({ id: 'de-chitchat-02', locale: 'de', text: 'Heute ist das Wetter schön.' }),
  Object.freeze({ id: 'de-chitchat-03', locale: 'de', text: 'Ich habe mittags Suppe gekocht.' }),
  Object.freeze({ id: 'de-chitchat-04', locale: 'de', text: 'Magst du Regentage?' }),
  Object.freeze({ id: 'de-chitchat-05', locale: 'de', text: 'Ich bin ein bisschen müde.' }),
  Object.freeze({ id: 'de-chitchat-06', locale: 'de', text: 'Ich habe ruhige Musik gehört.' }),
  Object.freeze({ id: 'de-chitchat-07', locale: 'de', text: 'Meine Katze schläft wieder.' }),
  Object.freeze({ id: 'de-chitchat-08', locale: 'de', text: 'Das hat mich zum Lächeln gebracht.' }),
  Object.freeze({ id: 'de-chitchat-09', locale: 'de', text: 'Heute bin ich früh aufgewacht.' }),
  Object.freeze({ id: 'de-chitchat-10', locale: 'de', text: 'Der Abend ist ruhig.' }),
  Object.freeze({ id: 'de-chitchat-11', locale: 'de', text: 'Ich mag diese Ecke im Zimmer.' }),
  Object.freeze({ id: 'de-chitchat-12', locale: 'de', text: 'Du wirfst heute gemütlich aus.' }),
  Object.freeze({ id: 'de-chitchat-13', locale: 'de', text: 'Draußen ist es etwas kalt.' }),
  Object.freeze({ id: 'de-chitchat-14', locale: 'de', text: 'Ich habe den Regenschirm zu Hause gelassen, na ja.' }),
  Object.freeze({ id: 'de-chitchat-15', locale: 'de', text: 'Ich habe vor dem Schlafen ein paar Seiten gelesen.' }),
  Object.freeze({ id: 'de-chitchat-16', locale: 'de', text: 'Nach dem Mittagessen bin ich kurz spaziert.' }),
  Object.freeze({ id: 'de-chitchat-17', locale: 'de', text: 'Möchtest du etwas Tee?' }),
  Object.freeze({ id: 'de-chitchat-18', locale: 'de', text: 'Das erinnert mich an den letzten Herbst.' }),

  // es — 18
  Object.freeze({ id: 'es-chitchat-01', locale: 'es', text: 'Buenos días, ¿cómo estás hoy?' }),
  Object.freeze({ id: 'es-chitchat-02', locale: 'es', text: 'Hoy hace un día precioso.' }),
  Object.freeze({ id: 'es-chitchat-03', locale: 'es', text: 'Preparé sopa para el almuerzo.' }),
  Object.freeze({ id: 'es-chitchat-04', locale: 'es', text: '¿Te gustan los días de lluvia?' }),
  Object.freeze({ id: 'es-chitchat-05', locale: 'es', text: 'Tengo un poco de sueño.' }),
  Object.freeze({ id: 'es-chitchat-06', locale: 'es', text: 'Escuché música tranquila.' }),
  Object.freeze({ id: 'es-chitchat-07', locale: 'es', text: 'Mi gato está durmiendo otra vez.' }),
  Object.freeze({ id: 'es-chitchat-08', locale: 'es', text: 'Eso me hizo sonreír.' }),
  Object.freeze({ id: 'es-chitchat-09', locale: 'es', text: 'Hoy me desperté temprano.' }),
  Object.freeze({ id: 'es-chitchat-10', locale: 'es', text: 'La noche se siente tranquila.' }),
  Object.freeze({ id: 'es-chitchat-11', locale: 'es', text: 'Me gusta esta esquina de la habitación.' }),
  Object.freeze({ id: 'es-chitchat-12', locale: 'es', text: 'Hoy te ves acogedor.' }),
  Object.freeze({ id: 'es-chitchat-13', locale: 'es', text: 'Fuera hace un poco de frío.' }),
  Object.freeze({ id: 'es-chitchat-14', locale: 'es', text: 'Dejé mi paraguas en casa, bueno, da igual.' }),
  Object.freeze({ id: 'es-chitchat-15', locale: 'es', text: 'Leí unas páginas antes de dormir.' }),
  Object.freeze({ id: 'es-chitchat-16', locale: 'es', text: 'Di un paseo corto después del almuerzo.' }),
  Object.freeze({ id: 'es-chitchat-17', locale: 'es', text: '¿Te apetece un poco de té?' }),
  Object.freeze({ id: 'es-chitchat-18', locale: 'es', text: 'El cielo está muy azul hoy.' }),

  // fr — 18
  Object.freeze({ id: 'fr-chitchat-01', locale: 'fr', text: 'Bonjour, comment vas-tu aujourd\'hui ?' }),
  Object.freeze({ id: 'fr-chitchat-02', locale: 'fr', text: 'Il fait beau aujourd\'hui.' }),
  Object.freeze({ id: 'fr-chitchat-03', locale: 'fr', text: 'J\'ai fait une soupe pour le déjeuner.' }),
  Object.freeze({ id: 'fr-chitchat-04', locale: 'fr', text: 'Tu aimes les jours de pluie ?' }),
  Object.freeze({ id: 'fr-chitchat-05', locale: 'fr', text: 'Je me sens un peu somnolent.' }),
  Object.freeze({ id: 'fr-chitchat-06', locale: 'fr', text: 'J\'ai écouté de la musique calme.' }),
  Object.freeze({ id: 'fr-chitchat-07', locale: 'fr', text: 'Mon chat dort encore.' }),
  Object.freeze({ id: 'fr-chitchat-08', locale: 'fr', text: 'Ça m\'a fait sourire.' }),
  Object.freeze({ id: 'fr-chitchat-09', locale: 'fr', text: 'Je me suis réveillé tôt ce matin.' }),
  Object.freeze({ id: 'fr-chitchat-10', locale: 'fr', text: 'La soirée est tranquille.' }),
  Object.freeze({ id: 'fr-chitchat-11', locale: 'fr', text: 'J\'aime ce coin de la pièce.' }),
  Object.freeze({ id: 'fr-chitchat-12', locale: 'fr', text: 'Tu as l\'air douillet aujourd\'hui.' }),
  Object.freeze({ id: 'fr-chitchat-13', locale: 'fr', text: 'Il fait un peu froid dehors.' }),
  Object.freeze({ id: 'fr-chitchat-14', locale: 'fr', text: 'J\'ai laissé mon parapluie à la maison, tant pis.' }),
  Object.freeze({ id: 'fr-chitchat-15', locale: 'fr', text: 'J\'ai lu quelques pages avant de dormir.' }),
  Object.freeze({ id: 'fr-chitchat-16', locale: 'fr', text: 'J\'ai fait une petite promenade après le déjeuner.' }),
  Object.freeze({ id: 'fr-chitchat-17', locale: 'fr', text: 'Tu veux un peu de thé ?' }),
  Object.freeze({ id: 'fr-chitchat-18', locale: 'fr', text: 'Ça me rappelle l\'automne dernier.' })
]);

/**
 * @param {string} [locale]
 * @returns {readonly { id: string, locale: string, text: string }[]}
 */
export function fixturesForMultilangChitchatLocale(locale) {
  if (!locale) return CONFIDE_MULTILANG_CHITCHAT_FIXTURES;
  const key = String(locale).trim().toLowerCase();
  return CONFIDE_MULTILANG_CHITCHAT_FIXTURES.filter((row) => row.locale === key);
}
