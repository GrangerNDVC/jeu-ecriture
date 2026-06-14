// games.js
let currentGameData = [];
let currentQuestionIndex = 0;
let currentQuestionObj = null;
let waitingNext = false;

export const Games = {
  async loadGameData(category) {
    // Pour démo, on simule un JSON externe. En production on fetch depuis /data/synonyms.json etc
    if(category === 'lexicrush') {
      return [
        { question: "rapide", correct: "véloce", wrong: ["lent", "mou", "paresseux"] },
        { question: "content", correct: "heureux", wrong: ["triste", "fâché", "sombre"] },
        { question: "village", correct: "hameau", wrong: ["ville", "métropole", "cité"] }
      ];
    }
    return [];
  },
  
  async launchLexicRush(containerEl, onComplete) {
    const data = await Games.loadGameData('lexicrush');
    if(!data.length) {
      containerEl.innerHTML = '<p>❌ Erreur de chargement des mots</p>';
      return;
    }
    currentGameData = data;
    currentQuestionIndex = 0;
    waitingNext = false;
    
    const render = () => {
      if(currentQuestionIndex >= currentGameData.length) {
        containerEl.innerHTML = `<div class="quiz-area"><h2>✨ Victoire ! ✨</h2><p>+30 XP, +10 pièces</p></div>`;
        if(onComplete) onComplete(30,10);
        return;
      }
      currentQuestionObj = currentGameData[currentQuestionIndex];
      const options = [currentQuestionObj.correct, ...currentQuestionObj.wrong];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      
      let html = `<div class="quiz-area">
        <h3>Trouvez le synonyme / antonyme</h3>
        <div class="question-word">${currentQuestionObj.question}</div>
        <div class="options" id="optionsContainer"></div>
        <div id="feedback" class="feedback"></div>
      </div>`;
      containerEl.innerHTML = html;
      
      const optsDiv = document.getElementById('optionsContainer');
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.classList.add('option-btn');
        btn.onclick = () => {
          if(waitingNext) return;
          if(opt === currentQuestionObj.correct) {
            document.getElementById('feedback').innerHTML = '✅ Bravo ! +10 XP, +5 pièces';
            waitingNext = true;
            setTimeout(() => {
              currentQuestionIndex++;
              render();
              waitingNext = false;
            }, 1000);
            if(onComplete) onComplete(10,5, false);
          } else {
            document.getElementById('feedback').innerHTML = '❌ Mauvais mot... +0 XP, combo perdu.';
            waitingNext = true;
            setTimeout(() => {
              currentQuestionIndex++;
              render();
              waitingNext = false;
            }, 1200);
            if(onComplete) onComplete(0,0, true);
          }
        };
        optsDiv.appendChild(btn);
      });
    };
    render();
  }
};