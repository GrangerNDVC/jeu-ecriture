import { Storage } from './storage.js';

export function refreshHUD() {
  document.getElementById('level').innerText = Storage.getLevel();
  document.getElementById('xp').innerText = Storage.getXP();
  document.getElementById('combo').innerText = Storage.getCombo();
  document.getElementById('streak').innerText = Storage.getStreak();
  document.getElementById('coins').innerText = Storage.getCoins();

  const xp = Storage.getXP();
  document.getElementById('xpBarFill').style.width = `${xp % 100}%`;
}

export function showGameContainer(show) {
  const container = document.getElementById('gameContainer');
  if (show) container.classList.remove('hidden');
  else container.classList.add('hidden');
}
