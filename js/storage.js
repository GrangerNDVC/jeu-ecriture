// storage.js — partagé entre toutes les pages, chargé via <script src>
// Pas de modules ES : Storage est une variable globale accessible partout

const STORAGE_KEYS = {
  XP:     'archives_xp',
  LEVEL:  'archives_level',
  COMBO:  'archives_combo',
  STREAK: 'archives_streak',
  COINS:  'archives_coins'
};

const Storage = {
  getXP:     () => parseInt(localStorage.getItem(STORAGE_KEYS.XP)     || '0'),
  setXP:     (x) => localStorage.setItem(STORAGE_KEYS.XP, x),
  getLevel:  () => parseInt(localStorage.getItem(STORAGE_KEYS.LEVEL)  || '1'),
  setLevel:  (l) => localStorage.setItem(STORAGE_KEYS.LEVEL, l),
  getCombo:  () => parseInt(localStorage.getItem(STORAGE_KEYS.COMBO)  || '0'),
  setCombo:  (c) => localStorage.setItem(STORAGE_KEYS.COMBO, c),
  getStreak: () => parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || '0'),
  setStreak: (s) => localStorage.setItem(STORAGE_KEYS.STREAK, s),
  getCoins:  () => parseInt(localStorage.getItem(STORAGE_KEYS.COINS)  || '0'),
  setCoins:  (c) => localStorage.setItem(STORAGE_KEYS.COINS, c),

  addReward: (xpGain, coinGain, comboInc = 1) => {
    let xp     = Storage.getXP()     + xpGain;
    let coins  = Storage.getCoins()  + coinGain;
    let combo  = Storage.getCombo()  + comboInc;
    let streak = Storage.getStreak() + 1;
    let level  = 1 + Math.floor(xp / 100);
    Storage.setXP(xp);
    Storage.setCoins(coins);
    Storage.setCombo(combo);
    Storage.setStreak(streak);
    Storage.setLevel(level);
    return { xp, coins, combo, streak, level };
  },

  resetCombo: () => Storage.setCombo(0)
};
