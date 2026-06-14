const STORAGE_KEYS = {
  XP: 'archives_xp',
  LEVEL: 'archives_level',
  COMBO: 'archives_combo',
  STREAK: 'archives_streak',
  COINS: 'archives_coins'
};

const Storage = {
  getXP: () => parseInt(localStorage.getItem(STORAGE_KEYS.XP) || '0'),
  setXP: (xp) => localStorage.setItem(STORAGE_KEYS.XP, xp),
  
  getLevel: () => parseInt(localStorage.getItem(STORAGE_KEYS.LEVEL) || '1'),
  setLevel: (lvl) => localStorage.setItem(STORAGE_KEYS.LEVEL, lvl),
  
  getCombo: () => parseInt(localStorage.getItem(STORAGE_KEYS.COMBO) || '0'),
  setCombo: (c) => localStorage.setItem(STORAGE_KEYS.COMBO, c),
  
  getStreak: () => parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || '0'),
  setStreak: (s) => localStorage.setItem(STORAGE_KEYS.STREAK, s),
  
  getCoins: () => parseInt(localStorage.getItem(STORAGE_KEYS.COINS) || '0'),
  setCoins: (c) => localStorage.setItem(STORAGE_KEYS.COINS, c),
  
  addReward: (xpGain, coinsGain, comboInc = 1) => {
    let xp = Storage.getXP();
    let coins = Storage.getCoins();
    let combo = Storage.getCombo() + comboInc;
    let streak = Storage.getStreak() + 1;
    
    xp += xpGain;
    coins += coinsGain;
    
    let newLevel = 1 + Math.floor(xp / 100);
    Storage.setXP(xp);
    Storage.setCoins(coins);
    Storage.setCombo(combo);
    Storage.setStreak(streak);
    Storage.setLevel(newLevel);
    
    return { xp, coins, combo, streak, level: newLevel };
  },
  
  resetCombo: () => Storage.setCombo(0)
};
