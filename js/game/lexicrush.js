import { Storage } from '../core/storage.js';
import { refreshHUD, showGameContainer } from '../core/ui.js';
import { playSound } from '../core/audio.js';

// Base de données des questions (intégrée ici pour l’exemple, mais peut venir d’un fetch JSON)
const questionBank = [
  { sentence: "Il court très rapidement.", highlight: "rapidement", type: "synonymes", corrects: ["vite","vivement"], wrongs: ["lentement","doucement"], rareBonus: [0,5] },
  { sentence: "Elle est vraiment contente aujourd'hui.", highlight: "contente", type: "synonymes", corrects: ["heureuse","satisfaite","ravie"], wrongs: ["triste","fâchée"], rareBonus: [0,0,8] },
  { sentence: "Ce garçon est très beau.", highlight: "beau", type: "synonymes", corrects: ["magnifique","splendide","joli"], wrongs: ["laid","moche"], rareBonus: [5,8,0] },
  { sentence: "Il a un petit chien.", highlight: "petit", type: "synonymes", corrects: ["minuscule","miniature","menu"], wrongs: ["grand","énorme"], rareBonus: [5,6,10] },
  { sentence: "Elle parle beaucoup en classe.", highlight: "parle", type: "synonymes", corrects: ["discute","bavarde","converse"], wrongs: ["se tait","murmure"], rareBonus: [0,6,10] },
  { sentence: "C'est un garçon fort.", highlight: "fort", type: "synonymes", corrects: ["puissant","solide","vigoureux"], wrongs: ["faible","fragile"], rareBonus: [5,0,10] },
  { sentence: "Il a fait une grosse erreur.", highlight: "grosse", type: "synonymes", corrects: ["grande","énorme","importante"], wrongs: ["petite","minuscule"], rareBonus: [0,8,4] },
  { sentence: "Elle a une jolie voix.", highlight: "jolie", type: "synonymes", corrects: ["belle","agréable","mélodieuse"], wrongs: ["laide","désagréable"], rareBonus: [0,7,12] },
  { sentence: "Il est très intelligent.", highlight: "intelligent", type: "synonymes", corrects: ["malin","brillant","astucieux"], wrongs: ["bête","stupide"], rareBonus: [5,8,12] },
  { sentence: "Cet exercice est facile.", highlight: "facile", type: "synonymes", corrects: ["simple","aisé","élémentaire"], wrongs: ["difficile","compliqué"], rareBonus: [0,6,10] },
  { sentence: "Il a un air triste.", highlight: "triste", type: "synonymes", corrects: ["morose","désolé","affligé"], wrongs: ["joyeux","heureux"], rareBonus: [8,6,12] },
  { sentence: "Cette histoire est étrange.", highlight: "étrange", type: "synonymes", corrects: ["bizarre","curieux","inexpliqué"], wrongs: ["normal","commun"], rareBonus: [6,8,15] },
  { sentence: "Il n'est jamais en retard.", highlight: "retard", type: "antonymes", corrects: ["avance","ponctualité"], wrongs: ["lenteur","absence"], rareBonus: [5,10] },
  { sentence: "La pièce est sombre.", highlight: "sombre", type: "antonymes", corrects: ["clair","lumineux","éclatant"], wrongs: ["obscur","noir"], rareBonus: [4,8,12] },
  { sentence: "Il a perdu ses clés.", highlight: "perdu", type: "antonymes", corrects: ["trouvé","retrouvé"], wrongs: ["égaré","caché"], rareBonus: [7,10] },
  { sentence: "Il aime la nature.", highlight: "nature", type: "famille", corrects: ["naturel","naturaliste","naturellement"], wrongs: ["artificiel","culture"], rareBonus: [5,12,10] },
  { sentence: "Elle pratique la natation.", highlight: "natation", type: "famille", corrects: ["nager","nageur","nageoire"], wrongs: ["courir","sauter"], rareBonus: [4,7,12] },
  { sentence: "La forêt est profonde.", highlight: "forêt", type: "champ lexical", corrects: ["arbre","feuille","branche","sous-bois"], wrongs: ["océan","désert"], rareBonus: [0,6,8,12] },
  { sentence: "Le pirate cherche un trésor.", highlight: "pirate", type: "champ lexical", corrects: ["bateau","épée","carte","île"], wrongs: ["avion","voiture"], rareBonus: [5,7,9,10] },
];
const common = [
  { sentence: "Il est très gentil.", highlight: "gentil", type: "synonymes", corrects: ["aimable","sympathique","bienveillant"], wrongs: ["méchant","désagréable"], rareBonus: [0,4,10] },
  { sentence: "Elle a une belle maison.", highlight: "belle", type: "synonymes", corrects: ["magnifique","superbe","splendide"], wrongs: ["laide","moche"], rareBonus: [5,7,10] },
  { sentence: "Il dit toujours la vérité.", highlight: "dit", type: "synonymes", corrects: ["déclare","affirme","exprime"], wrongs: ["ment","cache"], rareBonus: [6,8,12] },
  { sentence: "Elle fait ses devoirs.", highlight: "fait", type: "synonymes", corrects: ["réalise","accomplit","effectue"], wrongs: ["défait","rate"], rareBonus: [5,7,10] },
  { sentence: "Il a une voiture rapide.", highlight: "rapide", type: "synonymes", corrects: ["véloce","vif","prompt"], wrongs: ["lent","paresseux"], rareBonus: [5,7,9] },
];
const FINAL_BANK = [...questionBank, ...common];
while (FINAL_BANK.length < 50) FINAL_BANK.push({ ...FINAL_BANK[Math.floor(Math.random() * FINAL_BANK.length)] });

export async function launchLexicRush(containerEl, onReward) {
  const game = new LexicRushGame(onReward);
  await game.init(containerEl);
}

class LexicRushGame {
  constructor(onReward) {
    this.onReward = onReward;
    this.gameActive = false;
    this.currentRoundIndex = 0;
    this.rounds = [];
    this.roundData = null;
    this.remainingCorrects = [];
    this.score = 0;
    this.combo = 0;
    this.timeLeft = 25;
    this.bubbles = [];
    this.canvasElem = null;
    this.gameLoop = null;
    this.spawnInterval = null;
    this.timerInterval = null;
    this.container = null;
  }

  async init(containerEl) {
    this.container = containerEl;
    this.initGame();
    this.renderUI();
    this.startRound();
  }

  initGame() {
    const shuffled = [...FINAL_BANK];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    this.rounds = shuffled.slice(0, 10);
    this.currentRoundIndex = 0;
    this.score = 0;
    this.combo = 0;
    this.gameActive = true;
  }

  renderUI() {
    this.container.innerHTML = `
      <div class="game-area">
        <div class="context">
          <div class="sentence" id="sentence"></div>
          <div>Mot clé : <span class="target-word" id="highlightWord"></span></div>
          <div class="instruction" id="instruction"></div>
        </div>
        <div class="game-stats">
          <span>🎯 Manche <span id="roundNum">1</span>/10</span>
          <span>💥 Score: <span id="gameScore">0</span></span>
          <span>🔥 Combo: <span id="gameCombo">0</span></span>
          <span>⏱️ Temps: <span id="gameTimer">25</span></span>
        </div>
        <div class="timer-bar" id="timerBar" style="width:100%"></div>
        <div id="gameCanvas" class="game-canvas" style="height:400px; position:relative;"></div>
        <div class="progress">✅ Bonnes réponses restantes : <span id="remainingCount">0</span></div>
        <button id="skipRoundBtn">⏩ Passer manche (pénalité -5 pts)</button>
      </div>
    `;
    this.canvasElem = document.getElementById('gameCanvas');
    document.getElementById('skipRoundBtn').onclick = () => this.skipRound();
  }

  startRound() {
    if (this.currentRoundIndex >= this.rounds.length) {
      this.endGame(true);
      return;
    }
    if (!this.gameActive) return;
    this.clearBubbles();
    if (this.spawnInterval) clearInterval(this.spawnInterval);
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.gameLoop) cancelAnimationFrame(this.gameLoop);

    this.roundData = this.rounds[this.currentRoundIndex];
    const { sentence, highlight, type, corrects, wrongs, rareBonus } = this.roundData;
    let instructionText = "";
    if (type === "synonymes") instructionText = `Trouvez ${corrects.length} synonyme(s) de « ${highlight} »`;
    else if (type === "antonymes") instructionText = `Trouvez ${corrects.length} antonyme(s) de « ${highlight} »`;
    else if (type === "famille") instructionText = `Trouvez ${corrects.length} mot(s) de la même famille que « ${highlight} »`;
    else if (type === "champ lexical") instructionText = `Trouvez ${corrects.length} mot(s) du champ lexical de « ${highlight} »`;

    document.getElementById('sentence').innerText = sentence;
    document.getElementById('highlightWord').innerText = highlight;
    document.getElementById('instruction').innerText = instructionText;
    document.getElementById('roundNum').innerText = this.currentRoundIndex + 1;
    document.getElementById('gameScore').innerText = this.score;
    document.getElementById('gameCombo').innerText = this.combo;

    this.remainingCorrects = corrects.map((word, idx) => ({
      word: word,
      bonus: (rareBonus && rareBonus[idx]) ? rareBonus[idx] : 0
    }));
    this.updateRemainingUI();
    this.timeLeft = 25;
    this.updateTimerUI();

    this.showZoomText(instructionText);

    this.timerInterval = setInterval(() => {
      if (!this.gameActive) return;
      this.timeLeft -= 0.1;
      this.updateTimerUI();
      if (this.timeLeft <= 0) {
        this.roundFailure();
      }
    }, 100);

    this.spawnInterval = setInterval(() => {
      if (this.gameActive) this.spawnBubble();
    }, 900);

    this.animate();
  }

  showZoomText(text) {
    const div = document.createElement('div');
    div.className = 'zoom-transition';
    div.innerText = text;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 800);
  }

  updateTimerUI() {
    const timerElem = document.getElementById('gameTimer');
    if (timerElem) timerElem.innerText = Math.ceil(this.timeLeft);
    const percent = (this.timeLeft / 25) * 100;
    const bar = document.getElementById('timerBar');
    if (bar) bar.style.width = `${Math.max(0, percent)}%`;
  }

  updateRemainingUI() {
    const span = document.getElementById('remainingCount');
    if (span) span.innerText = this.remainingCorrects.length;
  }

  spawnBubble() {
    if (!this.gameActive) return;
    const { wrongs } = this.roundData;
    let isCorrect = false;
    let word = "";
    let bonusPoints = 0;
    if (this.remainingCorrects.length > 0 && Math.random() < 0.6) {
      isCorrect = true;
      const idx = Math.floor(Math.random() * this.remainingCorrects.length);
      word = this.remainingCorrects[idx].word;
      bonusPoints = this.remainingCorrects[idx].bonus;
    } else {
      isCorrect = false;
      const idx = Math.floor(Math.random() * wrongs.length);
      word = wrongs[idx];
    }
    const canvasRect = this.canvasElem.getBoundingClientRect();
    const leftPos = Math.random() * (canvasRect.width - 100);
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerText = word;
    bubble.style.left = `${leftPos}px`;
    bubble.style.bottom = '0px';
    bubble.style.position = 'absolute';
    bubble.dataset.isCorrect = isCorrect ? "true" : "false";
    bubble.dataset.word = word;
    bubble.dataset.bonus = bonusPoints;
    bubble.onclick = (e) => {
      e.stopPropagation();
      this.shootBubble(bubble);
    };
    bubble.ontouchstart = (e) => {
      e.preventDefault();
      this.shootBubble(bubble);
    };
    this.canvasElem.appendChild(bubble);
    this.bubbles.push({ element: bubble, y: 0, speed: 1.2 + Math.random() * 1.3, word, isCorrect, bonus: bonusPoints });
  }

  shootBubble(bubbleElem) {
    if (!this.gameActive) return;
    const isCorrect = bubbleElem.dataset.isCorrect === "true";
    const word = bubbleElem.dataset.word;
    const bonus = parseInt(bubbleElem.dataset.bonus) || 0;
    if (isCorrect) {
      const index = this.remainingCorrects.findIndex(item => item.word === word);
      if (index !== -1) {
        this.remainingCorrects.splice(index, 1);
        let basePoints = 10 + Math.floor(this.combo * 2);
        let totalPoints = basePoints + bonus;
        this.score += totalPoints;
        this.combo++;
        this.addFeedback(bubbleElem, `+${totalPoints}`, '#8BC34A');
        playSound('success');
        if (this.onReward) this.onReward(5 + Math.floor(bonus / 2), 2, false);
        refreshHUD();
        this.updateUIStats();
        this.updateRemainingUI();
        if (this.remainingCorrects.length === 0) {
          this.roundSuccess();
          return;
        }
      } else {
        this.combo = 0;
        this.score = Math.max(0, this.score - 5);
        this.addFeedback(bubbleElem, '-5 (déjà pris)', '#FFA500');
        if (this.onReward) this.onReward(0, 0, true);
        refreshHUD();
        this.updateUIStats();
      }
    } else {
      this.combo = 0;
      this.score = Math.max(0, this.score - 5);
      this.addFeedback(bubbleElem, '-5 points', '#E57373');
      if (this.onReward) this.onReward(0, 0, true);
      refreshHUD();
      this.updateUIStats();
    }
    const idx = this.bubbles.findIndex(b => b.element === bubbleElem);
    if (idx !== -1) {
      this.bubbles[idx].element.remove();
      this.bubbles.splice(idx, 1);
    }
  }

  roundSuccess() {
    if (!this.gameActive) return;
    let bonus = 20;
    this.score += bonus;
    this.updateUIStats();
    this.addGlobalFeedback(`Manche réussie ! +${bonus} points`, '#FFD966');
    playSound('roundwin');
    if (this.onReward) this.onReward(15, 5, false);
    refreshHUD();
    this.nextRound();
  }

  roundFailure() {
    if (!this.gameActive) return;
    this.addGlobalFeedback("Temps écoulé ! Manche perdue...", '#E57373');
    if (this.onReward) this.onReward(0, 0, true);
    refreshHUD();
    this.nextRound();
  }

  skipRound() {
    if (!this.gameActive) return;
    this.addGlobalFeedback("Manche passée (pénalité : -5 points)", '#FFA500');
    this.score = Math.max(0, this.score - 5);
    this.combo = 0;
    this.updateUIStats();
    if (this.onReward) this.onReward(0, 0, true);
    refreshHUD();
    this.nextRound();
  }

  nextRound() {
    this.clearBubbles();
    if (this.spawnInterval) clearInterval(this.spawnInterval);
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
    this.currentRoundIndex++;
    if (this.currentRoundIndex < this.rounds.length) {
      this.startRound();
    } else {
      this.endGame(true);
    }
  }

  updateUIStats() {
    const scoreElem = document.getElementById('gameScore');
    const comboElem = document.getElementById('gameCombo');
    if (scoreElem) scoreElem.innerText = this.score;
    if (comboElem) comboElem.innerText = this.combo;
  }

  addFeedback(element, text, color) {
    const rect = element.getBoundingClientRect();
    const feedback = document.createElement('div');
    feedback.innerText = text;
    feedback.style.position = 'fixed';
    feedback.style.left = `${rect.left + rect.width / 2}px`;
    feedback.style.top = `${rect.top}px`;
    feedback.style.color = color;
    feedback.style.fontWeight = 'bold';
    feedback.style.fontSize = '1.3rem';
    feedback.style.textShadow = '0 0 3px black';
    feedback.style.pointerEvents = 'none';
    feedback.style.zIndex = '1000';
    feedback.style.animation = 'fadeUp 0.5s ease-out';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 500);
  }

  addGlobalFeedback(text, color) {
    const feedback = document.createElement('div');
    feedback.innerText = text;
    feedback.style.position = 'fixed';
    feedback.style.top = '50%';
    feedback.style.left = '50%';
    feedback.style.transform = 'translate(-50%, -50%)';
    feedback.style.backgroundColor = 'rgba(0,0,0,0.7)';
    feedback.style.padding = '0.5rem 1rem';
    feedback.style.borderRadius = '2rem';
    feedback.style.color = color;
    feedback.style.fontWeight = 'bold';
    feedback.style.zIndex = '2000';
    feedback.style.fontSize = '1.2rem';
    feedback.style.whiteSpace = 'nowrap';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 1500);
  }

  clearBubbles() {
    for (let b of this.bubbles) {
      if (b.element && b.element.parentNode) b.element.remove();
    }
    this.bubbles = [];
  }

  animate() {
    if (!this.gameActive) return;
    for (let i = 0; i < this.bubbles.length; i++) {
      const b = this.bubbles[i];
      b.y += b.speed;
      b.element.style.bottom = `${b.y}px`;
      if (b.y > this.canvasElem.clientHeight + 100) {
        b.element.remove();
        this.bubbles.splice(i, 1);
        i--;
      }
    }
    this.gameLoop = requestAnimationFrame(() => this.animate());
  }

  endGame(isVictory) {
    this.gameActive = false;
    this.clearBubbles();
    if (this.spawnInterval) clearInterval(this.spawnInterval);
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
    let message = isVictory ? "🏆 VICTOIRE ! Vous avez terminé les 10 manches !" : "⛔ Partie interrompue.";
    let bonusXP = 0, bonusCoins = 0;
    if (isVictory) {
      bonusXP = 100;
      bonusCoins = 50;
      if (this.onReward) this.onReward(bonusXP, bonusCoins, false);
      playSound('victory');
      refreshHUD();
    }
    this.container.innerHTML += `<div style="text-align:center; margin-top:1rem;"><p>${message}</p><p>Score final : ${this.score}</p><button id="playAgainEvolvedBtn">🔁 Rejouer</button></div>`;
    document.getElementById('playAgainEvolvedBtn')?.addEventListener('click', () => {
      this.initGame();
      this.renderUI();
      this.startRound();
    });
  }
}
