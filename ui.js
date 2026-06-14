// ui.js
import { Storage } from './storage.js';

export const UI = {
  refreshHUD: () => {
    document.getElementById('level').innerText = Storage.getLevel();
    document.getElementById('xp').innerText = Storage.getXP();
    document.getElementById('combo').innerText = Storage.getCombo();
    document.getElementById('streak').innerText = Storage.getStreak();
    document.getElementById('coins').innerText = Storage.getCoins();
    
    const xp = Storage.getXP();
    const level = Storage.getLevel();
    const xpForNext = level * 100;
    const xpInCurrent = xp % 100;
    const percent = (xpInCurrent / 100) * 100;
    document.getElementById('xpBarFill').style.width = `${percent}%`;
  },
  
  showGameContainer: (show) => {
    const container = document.getElementById('gameContainer');
    if(show) container.classList.remove('hidden');
    else container.classList.add('hidden');
  }
};