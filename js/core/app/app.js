import { Storage } from './core/storage.js';
import { refreshHUD, showGameContainer } from './core/ui.js';
import { initAudio, startBackgroundMusic, toggleMusic } from './core/audio.js';
import { launchLexicRush } from './games/lexicrush.js';

// Chargement des jeux au clic sur les cartes
document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('click', async () => {
    const game = card.dataset.game;
    if (game === 'lexicrush') {
      showGameContainer(true);
      const container = document.getElementById('gameInterface');
      await launchLexicRush(container, (xp, coins, isFail) => {
        if (isFail) Storage.resetCombo();
        else Storage.addReward(xp, coins, isFail ? 0 : 1);
        refreshHUD();
      });
    } else if (game === 'syntax') {
      // charger dynamiquement le fichier syntax.js si besoin
      const { launchSyntax } = await import('./games/syntax.js');
      // ...
    }
  });
});

// Initialisation
refreshHUD();
document.getElementById('musicToggle').onclick = () => toggleMusic();
// Premier clic pour démarrer l'audio
document.body.addEventListener('click', () => { initAudio(); startBackgroundMusic(); }, { once: true });
