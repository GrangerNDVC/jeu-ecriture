const Games = {
  // Données mockées (simule un JSON externe)
  async loadGameData(category) {
    if(category === 'lexicrush') {
      return [
        { question: "rapide", correct: "véloce", wrong: ["lent", "mou", "paresseux"] },
        { question: "content", correct: "heureux", wrong: ["triste", "fâché", "sombre"] },
        { question: "village", correct: "hameau", wrong: ["ville", "métropole", "cité"] },
        { question: "parler", correct: "discuter", wrong: ["taire", "murmurer", "crier"] }
      ];
    }
    return [];
  },
  
  async launchLexicRush(containerEl, onReward) {
    const data = await this.loadGameData('lexicrush');
    if(!data.length) {
      containerEl.innerHTML = '<p>❌ Erreur : aucune donnée.</p>';
      return;
    }
    
    let currentIndex = 0;
    let canAnswer = true;
    
    const renderQuestion = () => {
      if(currentIndex >= data.length) {
        containerEl.innerHTML = `<div class="quiz-area"><h2>✨ Parfait ! ✨</h2><p>Vous avez terminé la Forêt Lexicale.</p><button class="next-btn" id="exitLexicBtn">Retour aux Archives</button></div>`;
        document.getElementById('exitLexicBtn')?.addEventListener('click', () => {
          UI.showGameContainer(false);
        });
        return;
      }
      
      const q = data[currentIndex];
      const options = [q.correct, ...q.wrong];
      for(let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      
      let html = `<div class="quiz-area">
        <div class="question-word">${q.question}</div>
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
          if(!canAnswer) return;
          canAnswer = false;
          
          if(opt === q.correct) {
            document.getElementById('feedback').innerHTML = '✅ Exact ! +10 XP, +5 pièces, combo +1';
            if(onReward) onReward(10, 5, false);
            setTimeout(() => {
              currentIndex++;
              canAnswer = true;
              renderQuestion();
            }, 1000);
          } else {
            document.getElementById('feedback').innerHTML = `❌ Non, la bonne réponse était “${q.correct}”. +0, combo perdu.`;
            if(onReward) onReward(0, 0, true);
            setTimeout(() => {
              currentIndex++;
              canAnswer = true;
              renderQuestion();
            }, 1500);
          }
        };
        optsDiv.appendChild(btn);
      });
    };
    
    renderQuestion();
  }
};
