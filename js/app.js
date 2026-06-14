import { Storage } from './core/storage.js';
import { refreshHUD, showGameContainer } from './core/ui.js';
import { enableAudioOnFirstClick, toggleMusic } from './core/audio.js';
import { launchLexicRush } from './games/lexicrush.js';

// Initialisation du HUD
refreshHUD();

// Gestion des cartes de jeu
document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('click', async () => {
    const game = card.dataset.game;
    if (game === 'lexicrush') {
      showGameContainer(true);
      const container = document.getElementById('gameInterface');
      await launchLexicRush(container, (xpGain, coinGain, isFail) => {
        if (isFail) Storage.resetCombo();
        else Storage.addReward(xpGain, coinGain, isFail ? 0 : 1);
        refreshHUD();
      });
    } else {
      alert('🔮 Ce jeu ouvrira bientôt ses portes.');
    }
  });
});

// Bouton fermer
document.getElementById('closeGameBtn').onclick = () => showGameContainer(false);

// Musique au premier clic
enableAudioOnFirstClick();

// Bouton toggle musique
document.getElementById('musicToggle').onclick = () => toggleMusic();

// Ajout de l’animation CSS fadeUp
const style = document.createElement('style');
style.textContent = `@keyframes fadeUp { 0% { opacity:1; transform: translateY(0); } 100% { opacity:0; transform: translateY(-40px); } }`;
document.head.appendChild(style);
