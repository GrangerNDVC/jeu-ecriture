// engine.js
import { Storage } from './storage.js';
import { UI } from './ui.js';
import { Games } from './games.js';

window.App = {
  currentGame: null,
  
  init() {
    UI.refreshHUD();
    this.bindGameCards();
    this.bindCloseGame();
    // Préparation Supabase (fausse clé pour extension)
    console.log('📚 Archives des Mots prêtes – architecture Supabase disponible');
  },
  
  bindGameCards() {
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const gameType = card.dataset.game;
        if(gameType === 'lexicrush') this.startLexicRush();
        else alert(`🎮 Jeu "${gameType}" sera développé prochainement.`);
      });
    });
  },
  
  startLexicRush() {
    UI.showGameContainer(true);
    const container = document.getElementById('gameInterface');
    Games.launchLexicRush(container, (xpGain, coinGain, isFail) => {
      if(isFail) Storage.resetCombo();
      const reward = Storage.addReward(xpGain, coinGain, isFail ? 0 : 1);
      UI.refreshHUD();
      if(!isFail && xpGain > 0) {
        // bonus combo
      }
    });
  },
  
  bindCloseGame() {
    document.getElementById('closeGameBtn').addEventListener('click', () => {
      UI.showGameContainer(false);
    });
  }
};

// Auto-instanciation différée
if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.App.init());
} else {
  window.App.init();
}