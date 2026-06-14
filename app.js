const App = {
  init() {
    UI.refreshHUD();
    this.bindGameCards();
    this.bindCloseGame();
    console.log("Archives des Mots prêtes !");
  },
  
  bindGameCards() {
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const gameType = card.dataset.game;
        if(gameType === 'lexicrush') {
          this.startLexicRush();
        } else {
          alert(`🔮 Le jeu “${card.querySelector('h2')?.innerText || gameType}” ouvrira bientôt ses portes.`);
        }
      });
    });
  },
  
  startLexicRush() {
    UI.showGameContainer(true);
    const container = document.getElementById('gameInterface');
    
    Games.launchLexicRush(container, (xpGain, coinGain, isFail) => {
      if(isFail) {
        Storage.resetCombo();
      }
      const reward = Storage.addReward(xpGain, coinGain, isFail ? 0 : 1);
      UI.refreshHUD();
      
      // Petit effet visuel si combo perdu
      if(isFail && xpGain === 0) {
        const comboElem = document.getElementById('combo');
        comboElem.style.transform = 'scale(1.3)';
        setTimeout(() => comboElem.style.transform = '', 300);
      }
    });
  },
  
  bindCloseGame() {
    document.getElementById('closeGameBtn').addEventListener('click', () => {
      UI.showGameContainer(false);
    });
  }
};

// Démarrage
document.addEventListener('DOMContentLoaded', () => App.init());
