// Global variables for session and player tracking
let currentSessionId = null;
let currentPlayerId = null;


class SpanglishFixitGame {
    constructor(sentences) {
        this.originalSentences = sentences;
        this.sentences = this.shuffle([...sentences]);
        this.currentIndex = 0;
        this.score = 0;
        this.wrongAnswers = [];
        this.totalSentences = 15; // Each game has 15 sentences.
        this.interval = null;
        this.gameActive = false;
        this.reviewMode = false;
        this.currentErrorWord = null; // Track the selected error word

        // Define methods before binding them
        this.startGame = () => {
            this.gameActive = true;
            this.currentIndex = 0;
            this.score = 0;
            this.wrongAnswers = [];
            document.getElementById("score").textContent = this.score;
            document.getElementById("feedback").textContent = "";
            document.getElementById("sentence").textContent = "";
            document.getElementById("answer").value = "";
            // Reset the sentence counter:
            document.getElementById("counter").textContent = "Sentence: 0/15";
            document.getElementById("restart").style.display = "none";
            document.getElementById("start").style.display = "none";
            this.updateSentence();
            // No overall timer now.
        };

        this.startReview = () => {
    if (this.wrongAnswers.length === 0) return;
    this.reviewMode = true;
    this.currentIndex = 0;
    
    // Re-show the answer input for review:
    document.getElementById("answer").style.display = "block";
    
    // Hide the Review button when entering review mode:
    document.getElementById("review").style.display = "none";
    this.updateSentence();
};

        this.setupInputListener = () => {
            document.getElementById("answer").addEventListener("keyup", (event) => {
                if (event.key === "Enter") {
                    this.checkAnswer();
                }
            });
        };

        // Bind the arrow function methods
        this.startGame = this.startGame.bind(this);
        this.startReview = this.startReview.bind(this);
        this.setupInputListener = this.setupInputListener.bind(this);

        this.initUI();
    }

    shuffle(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    initUI() {
        console.log("Game script is running!");
        document.title = "Spanglish Fixit Challenge";
        document.body.innerHTML = `
    <style>
        /* General body styles */
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #2E3192, #1BFFFF);
            color: white;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }
        /* Instructions overlay */
        #instructions-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        #instructions-box {
            background: #333;
            padding: 20px;
            border-radius: 10px;
            max-width: 500px;
            text-align: left;
        }
        #instructions-box h2 {
            margin-top: 0;
        }
        /* Close instructions button */
        #close-instructions {
            margin-top: 15px;
            padding: 5px 10px;
            background: #28a745;
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            transition: 0.3s;
        }
        #close-instructions:hover {
            opacity: 0.8;
        }
        /* Game container */
        #game-container {
            background: rgba(0, 0, 0, 0.8);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
            text-align: center;
        }
        /* Paragraph style */
        p {
            font-size: 18px;
        }
        /* Input styles */
        input {
            padding: 10px;
            font-size: 16px;
            border-radius: 5px;
            border: none;
            outline: none;
            text-align: center;
            display: block;
            margin: 10px auto;
            width: 80%;
        }
        input.correct {
            border: 2px solid #00FF00;
            background-color: rgba(0, 255, 0, 0.2);
        }
        input.incorrect {
            border: 2px solid #FF0000;
            background-color: rgba(255, 0, 0, 0.2);
        }
        /* Button styles */
        button {
            padding: 10px 20px;
            font-size: 18px;
            margin-top: 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: 0.3s;
        }
        button:hover {
            opacity: 0.8;
        }
        #start {
            background: #28a745;
            color: white;
        }
        #restart {
            background: #007bff;
            color: white;
            display: none;
        }
        #review {
            background: #ffc107;
            color: black;
            display: none;
        }
        /* Timer bar (points bar) */
        #timer-bar {
            width: 100%;
            height: 10px;
            background: red;
            transition: width 1s linear;
        }
        /* End-game text styles */
        .game-over {
            font-size: 24px;
            color: #FF4500;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .new-high {
            font-size: 20px;
            color: #FFD700;
            font-weight: bold;
        }
    </style>
    <!-- Instructions Overlay -->
        <div id="instructions-overlay">
            <div id="instructions-box">
                <h2>How to Play</h2>
                <p>Welcome to the Spanglish Fixit Challenge! Here's what to do:</p>
                <ul>
                    <li>Click the incorrect word in each sentence.</li>
                    <li>After clicking, type the correct word.</li>
                    <li>For each sentence, your points decrease from 100 to 10 over 30 seconds.</li>
                    <li>Incorrect clicks or wrong corrections lose you 50 points.</li>
                    <li>The game ends after 15 sentences (e.g., 2/15, 3/15, etc.).</li>
                </ul>
                <p>Good luck!</p>
                <button id="close-instructions">Got It!</button>
            </div>
        </div>
        <!-- Game Container -->
        <div id="game-container">
            <h1>Spanglish Fixit Challenge</h1>
            <!-- Single-player UI elements -->
            <p id="counter">Sentence: 0/15</p>
            <div id="points-bar-container" style="width:100%; background: #555; height: 10px; margin-top: 5px;">
                <div id="points-bar" style="width: 100%; height: 100%; background: #0f0; transition: width 0.1s linear;"></div>
            </div>
            <p id="sentence"></p>
            <p id="instructionsText">Click the error and type the correction:</p>
            <input type="text" id="answer" autofocus>
            <p id="feedback"></p>
            <p>Score: <span id="score">0</span></p>
            <p>Best Score: <span id="bestScore">0</span></p>
            <button id="start">Start Game</button>
            <button id="restart">Restart</button>
            <button id="review">Review Mistakes</button>
            <button id="downloadReport" style="display: none;">Download Report</button>
        </div>
        <!-- Multiplayer Section -->
        <div id="multiplayer-container" style="margin-top: 20px;">
            <h2>Multiplayer</h2>
            <button id="createMultiplayer">Create Multiplayer Game</button>
            <br/><br/>
            <input type="text" id="sessionIdInput" placeholder="Enter Session ID" />
            <button id="joinMultiplayer">Join Multiplayer Game</button>
        </div>
    `;

    // Attach Multiplayer UI event listeners:
    const createBtn = document.getElementById("createMultiplayer");
    const joinBtn = document.getElementById("joinMultiplayer");
    const sessionInput = document.getElementById("sessionIdInput");

    if (createBtn && joinBtn && sessionInput) {
  // For creating a game (player1)
  createBtn.addEventListener("click", () => {
    promptForPlayerName((name) => {
      currentPlayerId = name; // Use custom name for player1
      currentSessionId = createGameSession(sentences);
      joinGameSession(currentSessionId, currentPlayerId);
      
      // Hide the single-player start button and show waiting message
      document.getElementById("start").style.display = "none";
      const waitingMessage = document.createElement('div');
      waitingMessage.id = 'waiting';
      waitingMessage.style.fontSize = '24px';
      waitingMessage.style.marginTop = '10px';
      waitingMessage.textContent = "Waiting for another player to join...";
      document.getElementById("game-container").appendChild(waitingMessage);
      
      // Mark game as active and show the session ID for sharing
      window.game.gameActive = true;
      console.log("Multiplayer session created & joined as", currentPlayerId, "with session ID:", currentSessionId);
      sessionInput.value = currentSessionId;
    });
  });

  // For joining a game (player2)
  joinBtn.addEventListener("click", () => {
    const roomId = sessionInput.value.trim();
    if (!roomId) return;
    promptForPlayerName((name) => {
      currentSessionId = roomId;
      currentPlayerId = name; // Use custom name for player2
      joinGameSession(currentSessionId, currentPlayerId);
    });
  });
}

    // Attach your existing event listeners:
    document.getElementById("close-instructions").addEventListener("click", () => {
        document.getElementById("instructions-overlay").style.display = "none";
    });
    document.getElementById("start").addEventListener("click", () => this.startGame());
    document.getElementById("restart").addEventListener("click", () => this.restartGame());
    document.getElementById("review").addEventListener("click", () => this.startReview());
    this.setupInputListener();
    this.updateBestScoreDisplay();
}

    updateBestScoreDisplay() {
        let storedBest = localStorage.getItem("bestScoreSpanglish") || 0;
        document.getElementById("bestScore").textContent = storedBest;
    }

    updateSentence() {
  // Re-enable answer input for the new round.
  document.getElementById("answer").disabled = false;

  if (this.reviewMode) {
    // In review mode, use the length of wrongAnswers
    if (this.currentIndex >= this.wrongAnswers.length) {
      document.getElementById("sentence").innerHTML = "Review complete!";
      document.getElementById("answer").style.display = "none";
      document.getElementById("feedback").textContent = "";
      this.reviewMode = false;
      return;
    }
    document.getElementById("counter").textContent = `Review: ${this.currentIndex + 1}/${this.wrongAnswers.length}`;
  } else {
    // Normal game mode: check against totalSentences
    if (this.currentIndex >= this.totalSentences) {
      this.endGame();
      return;
    }
    document.getElementById("counter").textContent = `Sentence: ${this.currentIndex + 1}/${this.totalSentences}`;
  }

  const currentSet = this.reviewMode ? this.wrongAnswers : this.sentences;
  const currentSentence = currentSet[this.currentIndex];
  const sentenceParts = currentSentence.sentence.split(" ");
  let sentenceHTML = sentenceParts.map((word) => `<span class="clickable-word">${word}</span>`).join(" ");
  document.getElementById("sentence").innerHTML = sentenceHTML;

  // Re-enable clicking for new sentence
  document.getElementById("sentence").style.pointerEvents = "auto";

  // Start the 30-second phase timer for scoring (max 100 points, min 10)
  this.startClickTime = Date.now();
  if (this.pointsInterval) clearInterval(this.pointsInterval);
  this.pointsInterval = setInterval(() => {
    let elapsed = Date.now() - this.startClickTime;
    let availablePoints = Math.max(100 - Math.floor(elapsed / 300), 10);
    let percentage = ((availablePoints - 10) / (100 - 10)) * 100;
    document.getElementById("points-bar").style.width = percentage + "%";
  }, 100);

  // Attach click listeners to each word
  const clickableWords = document.querySelectorAll(".clickable-word");
  clickableWords.forEach((wordElement) => {
    wordElement.addEventListener("click", () => {
      this.handleWordClick(wordElement, currentSentence);
    });
  });
}

    handleWordClick(wordElement, currentSentence) {
        if (this.pointsInterval) {
            clearInterval(this.pointsInterval);
            this.pointsInterval = null;
        }
        const clickedWord = wordElement.textContent;
        const cleanedClickedWord = clickedWord.replace(/[^\w\s]|_/g, "").trim().toLowerCase();
        const cleanedErrorWord = currentSentence.errorWord.replace(/[^\w\s]|_/g, "").trim().toLowerCase();
        const clickTime = Date.now() - this.startClickTime;
        if (this.reviewMode) {
            // In review mode, simply highlight correct/incorrect and proceed
            if (cleanedClickedWord === cleanedErrorWord) {
                wordElement.style.color = 'green';
            } else {
                wordElement.style.color = 'red';
            }
            const correctWordElements = document.querySelectorAll('.clickable-word');
            correctWordElements.forEach((element) => {
                if (element.textContent.replace(/[^\w\s]|_/g, "").trim().toLowerCase() === cleanedErrorWord) {
                    element.style.color = 'green';
                }
            });
            // Remove listeners so further clicks don’t register
            document.getElementById("sentence").style.pointerEvents = "none";
            this.selectErrorWord(clickedWord);
            return;
        }
        // Normal game mode: update score based on click speed
        if (cleanedClickedWord === cleanedErrorWord) {
            let clickScore = Math.max(100 - Math.floor(clickTime / 300), 10);
            this.score += clickScore;
            wordElement.style.color = 'green';
        } else {
            this.score -= 50;
            wordElement.style.color = 'red';
            if (!this.wrongAnswers.includes(currentSentence)) {
                this.wrongAnswers.push(currentSentence);
            }
        }
        document.getElementById("score").textContent = this.score;
        const correctWordElements = document.querySelectorAll('.clickable-word');
        correctWordElements.forEach((element) => {
            if (element.textContent.replace(/[^\w\s]|_/g, "").trim().toLowerCase() === cleanedErrorWord) {
                element.style.color = 'green';
            }
        });
        // Disable further clicks for this sentence
        document.getElementById("sentence").style.pointerEvents = "none";
        this.selectErrorWord(clickedWord);
    }

    selectErrorWord(word) {
        this.currentErrorWord = word;
        document.getElementById("feedback").textContent = `You selected "${word}". Now, type the correction.`;
        if (this.pointsInterval) {
            clearInterval(this.pointsInterval);
            this.pointsInterval = null;
        }
        this.startCorrectionTime = Date.now();
        document.getElementById("points-bar").style.width = "100%";
        this.pointsInterval = setInterval(() => {
            let elapsed = Date.now() - this.startCorrectionTime;
            let availablePoints = Math.max(100 - Math.floor(elapsed / 300), 10);
            let percentage = ((availablePoints - 10) / (100 - 10)) * 100;
            document.getElementById("points-bar").style.width = percentage + "%";
        }, 100);
        document.getElementById("answer").focus();
    }

    checkAnswer() {
  const input = document.getElementById("answer");
  // If input is already disabled, ignore additional submissions.
  if (input.disabled) return;
  
  // If no error word was clicked yet, do not proceed.
  if (!this.currentErrorWord) {
    document.getElementById("feedback").textContent = "Please click on the incorrect word first!";
    return;
  }
  
  if (this.pointsInterval) {
    clearInterval(this.pointsInterval);
    this.pointsInterval = null;
  }
  if (!this.gameActive && !this.reviewMode) return;
  
  // Disable the input so that the player cannot submit again this round.
  input.disabled = true;

  const userInput = input.value.trim().toLowerCase();
  const currentSet = this.reviewMode ? this.wrongAnswers : this.sentences;
  const currentSentence = currentSet[this.currentIndex];
  const correctionTime = Date.now() - this.startCorrectionTime;
  let possibleAnswers = currentSentence.correctAnswer;
  if (!Array.isArray(possibleAnswers)) {
    possibleAnswers = [possibleAnswers];
  }
  possibleAnswers = possibleAnswers.map(answer => answer.toLowerCase());

  // -----------------------
  // REVIEW MODE BRANCH
  // -----------------------
  if (this.reviewMode) {
    if (possibleAnswers.includes(userInput)) {
      let correctionScore = Math.max(100 - Math.floor(correctionTime / 300), 10);
      this.score += correctionScore;
      document.getElementById("score").textContent = this.score;
      input.classList.add("correct");
      document.getElementById("feedback").textContent = `Correct. The answer is: ${possibleAnswers.join(" / ")}`;

      setTimeout(() => {
        input.classList.remove("correct");
        input.value = "";
        // Submit this answer to Firebase so both players sync:
        submitAnswer(this.score);
        // Then advance to the next sentence locally:
        this.currentIndex++;
        this.currentErrorWord = null;
        this.updateSentence();
      }, 1000);
    } else {
      input.classList.add("incorrect");
      document.getElementById("feedback").textContent = `Incorrect. The correct answer is: ${possibleAnswers.join(" / ")}`;

      setTimeout(() => {
        input.classList.remove("incorrect");
        input.value = "";
        this.currentIndex++;
        this.currentErrorWord = null;
        this.updateSentence();
      }, 1000);
    }
    return; 
  }

  // -----------------------
  // NORMAL MODE BRANCH
  // -----------------------
  if (possibleAnswers.includes(userInput)) {
    let correctionScore = Math.max(100 - Math.floor(correctionTime / 300), 10);
    this.score += correctionScore;
    document.getElementById("score").textContent = this.score;
    input.classList.add("correct");
    document.getElementById("feedback").textContent = `Correct. The answer is: ${possibleAnswers.join(" / ")}`;
    
    setTimeout(() => {
      input.classList.remove("correct");
      input.value = "";
      submitAnswer(this.score);
      // (Do not call this.currentIndex++ or this.updateSentence() here; these are updated via Firebase.)
    }, 1000);
  } else {
    this.score -= 50;
    if (!this.wrongAnswers.some(item => item.sentence === currentSentence.sentence)) {
      this.wrongAnswers.push({
        sentence: currentSentence.sentence,
        errorWord: currentSentence.errorWord,
        correctAnswer: currentSentence.correctAnswer,
        studentAnswer: userInput
      });
    }
    document.getElementById("score").textContent = this.score;
    input.classList.add("incorrect");
    document.getElementById("feedback").textContent = `Incorrect. The correct answer is: ${possibleAnswers.join(" / ")}`;
    
    setTimeout(() => {
      input.classList.remove("incorrect");
      input.value = "";
      submitAnswer(this.score);
    }, 1000);
  }
}

    // No overall timer now, so startTimer() is removed.

    endGame() {
  this.gameActive = false;
  if (this.pointsInterval) clearInterval(this.pointsInterval);

  // Check if we're in multiplayer mode (i.e. currentSessionId is set)
  if (currentSessionId) {
    const sessionRef = firebase.database().ref('gameSessions/' + currentSessionId);
    sessionRef.once('value').then((snapshot) => {
      const sessionData = snapshot.val();
      // Retrieve player scores and custom names
      const player1Score = sessionData.players.player1 ? sessionData.players.player1.score : 0;
      const player2Score = sessionData.players.player2 ? sessionData.players.player2.score : 0;
      const p1Name = sessionData.players.player1 ? sessionData.players.player1.name : "Player 1";
      const p2Name = sessionData.players.player2 ? sessionData.players.player2.name : "Player 2";

      // Determine the winner message using custom names
      let winnerMessage = "";
      if (player1Score > player2Score) {
        winnerMessage = `${p1Name} wins!`;
      } else if (player2Score > player1Score) {
        winnerMessage = `${p2Name} wins!`;
      } else {
        winnerMessage = "It's a tie!";
      }

      // Build a visually enhanced multiplayer game over screen using custom names
      let endMessage = `
          <div class="game-over" style="font-size: 36px; color: #FFD700; text-shadow: 2px 2px 4px #000;">
              Game Over!
          </div>
          <div style="font-size: 24px; margin-top: 10px;">
              <span style="color: ${player1Score >= player2Score ? '#00FF00' : '#FF0000'};">
                  ${p1Name} Score: ${player1Score}
              </span>
              &nbsp;&nbsp;&nbsp;
              <span style="color: ${player2Score >= player1Score ? '#00FF00' : '#FF0000'};">
                  ${p2Name} Score: ${player2Score}
              </span>
          </div>
          <div style="font-size: 28px; margin-top: 20px; color: #FFFFFF; text-shadow: 1px 1px 2px #000;">
              ${winnerMessage}
          </div>
          <button id="restart" style="
              margin-top: 20px;
              padding: 10px 20px;
              font-size: 18px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;">
              Restart Game
          </button>
      `;

      // Hide auxiliary UI elements that are not needed in game over state
      document.getElementById("instructionsText").style.display = "none";
      document.getElementById("feedback").textContent = "";
      document.getElementById("answer").style.display = "none";
      document.getElementById("points-bar").style.width = "0%";
      document.getElementById("counter").style.display = "none";

      // Replace the sentence area with the game over message
      document.getElementById("sentence").innerHTML = endMessage;

      // Show the download report button if present
      const reportButton = document.getElementById("downloadReport");
      if (reportButton) {
        reportButton.style.display = "block";
        if (!reportButton.dataset.listenerAdded) {
          reportButton.addEventListener("click", () => this.downloadReport());
          reportButton.dataset.listenerAdded = "true";
        }
      }

      // Attach restart event listener
      document.getElementById("restart").addEventListener("click", () => this.restartGame());
    });
  } else {
    // Single player mode end game logic (preserving your existing code)
    let storedBest = localStorage.getItem("bestScoreSpanglish") || 0;
    let newHighScore = false;
    if (this.score > storedBest) {
      localStorage.setItem("bestScoreSpanglish", this.score);
      newHighScore = true;
    }
    this.updateBestScoreDisplay();

    let endMessage = `
        <div class="game-over">Game Over!</div>
        <div>Your score: ${this.score}</div>
    `;
    if (newHighScore) {
      endMessage += `<div class="new-high">New High Score!</div>`;
    }

    document.getElementById("sentence").innerHTML = endMessage;
    document.getElementById("instructionsText").style.display = "none";
    document.getElementById("feedback").textContent = "";
    document.getElementById("answer").style.display = "none";
    document.getElementById("points-bar").style.width = "0%";
    document.getElementById("restart").style.display = "block";
    document.getElementById("review").style.display = this.wrongAnswers.length > 0 ? "block" : "none";

    const reportButton = document.getElementById("downloadReport");
    if (reportButton) {
      reportButton.style.display = "block";
      if (!reportButton.dataset.listenerAdded) {
        reportButton.addEventListener("click", () => this.downloadReport());
        reportButton.dataset.listenerAdded = "true";
      }
    }
  }
}

restartGame() {
    this.gameActive = false;
    this.reviewMode = false;
    if (this.pointsInterval) clearInterval(this.pointsInterval);
    this.currentIndex = 0;
    this.score = 0;
    this.wrongAnswers = [];
    this.sentences = this.shuffle([...this.originalSentences]);

    document.getElementById("score").textContent = this.score;
    document.getElementById("feedback").textContent = "";
    document.getElementById("sentence").textContent = "";
    document.getElementById("answer").value = "";

    // Re-show the answer input
    document.getElementById("answer").style.display = "block";

    // Re-show instructions paragraph
    document.getElementById("instructionsText").style.display = "block";

    // Reset counters, hide review, hide restart, show start
    document.getElementById("counter").textContent = "Sentence: 0/15";
    document.getElementById("review").style.display = "none";
    document.getElementById("restart").style.display = "none";
    document.getElementById("start").style.display = "block";
}


    downloadReport() {
        let report = "Mistakes Report\n\n";
        this.wrongAnswers.forEach((item, index) => {
            let correct = Array.isArray(item.correctAnswer) ? item.correctAnswer.join(" / ") : item.correctAnswer;
            report += `Mistake ${index + 1}:\nSentence: ${item.sentence}\nError Word: ${item.errorWord}\nYour Answer: ${item.studentAnswer}\nCorrect Answer: ${correct}\n\n`;
        });
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "report.txt";
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Sample sentences for testing
const sentences = [
    { 
        sentence: "It depends of the person.", 
        errorWord: "of",
        correctAnswer: "on"
    },
    { 
        sentence: "There is too much air contamination in Madrid.", 
        errorWord: "contamination",
        correctAnswer: "pollution"
    },
    { 
        sentence: "I went to a bar last night but it was almost empty. There were little people there.", 
        errorWord: "little",
        correctAnswer: "few"
    },
    { 
        sentence: "I couldn’t assist the meeting.", 
        errorWord: "assist",
        correctAnswer: "attend"
    },
    { 
        sentence: "Today’s class was very bored.", 
        errorWord: "bored",
        correctAnswer: "boring"
    },
    { 
        sentence: "She usually lives with her friends, but actually, she's staying with her mum while she recovers.", 
        errorWord: "actually",
        correctAnswer: ["currently", "at the moment"]
    },
    { 
        sentence: "Don’t shout at him. He’s very sensible.", 
        errorWord: "sensible",
        correctAnswer: "sensitive"
    },
    { 
        sentence: "She presented me to her friend Bea.", 
        errorWord: "presented",
        correctAnswer: "introduced"
    },
    { 
        sentence: "I don’t have no money.", 
        errorWord: "no",
        correctAnswer: "any"
    },
    { 
        sentence: "She gave me some good advices.", 
        errorWord: "advices",
        correctAnswer: "advice"
    },
    { 
        sentence: "I did a big effort.", 
        errorWord: "did",
        correctAnswer: "made"
    },
    { 
        sentence: "It’s an important amount of material.", 
        errorWord: "important",
        correctAnswer: ["significant", "considerable"]
    },
    {
        sentence: "I’m thinking in buying a new car.",
        errorWord: "in",
        correctAnswer: ["about", "of"]
    },
    {
        sentence: "The exam consists in 5 different papers.",
        errorWord: "in",
        correctAnswer: "of"
    },
    {
        sentence: "It was a real deception when I failed the exam.",
        errorWord: "deception",
        correctAnswer: "disappointment"
    },
    {
        sentence: "My favourite travel was when I went to Thailand.",
        errorWord: "travel",
        correctAnswer: "trip"
    },
    {
        sentence: "He’s absolutely compromised to the company’s goals.",
        errorWord: "compromised",
        correctAnswer: "committed"
    },
    {
        sentence: "This is your final advice! Don’t be late again.",
        errorWord: "advice",
        correctAnswer: "warning"
    },
    {
        sentence: "If you approve this final test, you’ll get the job.",
        errorWord: "approve",
        correctAnswer: "pass"
    },
    {
        sentence: "Could you give me the direction for the new offices?",
        errorWord: "direction",
        correctAnswer: "address"
    },
    {
        sentence: "They got very bad notes in their exams.",
        errorWord: "notes",
        correctAnswer: ["marks", "grades"]
    },
    {
        sentence: "You shouldn’t talk to the bus conductor while she’s driving.",
        errorWord: "conductor",
        correctAnswer: "driver"
    },
    {
        sentence: "We stayed in a camping, but it was dirty and overcrowded.",
        errorWord: "camping",
        correctAnswer: ["campsite", "camp site"]
    },
    {
        sentence: "Is there a public parking near here?",
        errorWord: "parking",
        correctAnswer: ["car park", "parking lot"]
    },
    {
        sentence: "Were you expecting to see him there or was it just a casualty?",
        errorWord: "casualty",
        correctAnswer: "coincidence"
    },
    {
        sentence: "I really can’t support people like that!",
        errorWord: "support",
        correctAnswer: "stand"
    },
    {
        sentence: "I don’t eat jam because I’m a vegetarian.",
        errorWord: "jam",
        correctAnswer: "ham"
    },
    {
        sentence: "I always take a coffee before going to work.",
        errorWord: "take",
        correctAnswer: ["have", "drink"]
    },
    {
        sentence: "That was a very long history.",
        errorWord: "history",
        correctAnswer: "story"
    },
    {
        sentence: "It was a very tired journey.",
        errorWord: "tired",
        correctAnswer: "tiring"
    },
    {
        sentence: "I have afraid of spiders.",
        errorWord: "have",
        correctAnswer: "am"
    },
    {
        sentence: "I had lucky to get the job.",
        errorWord: "had",
        correctAnswer: "was"
    },
    {
        sentence: "People is always telling me that.",
        errorWord: "is",
        correctAnswer: "are"
    },
    {
        sentence: "I organized a big party but anybody came.",
        errorWord: "anybody",
        correctAnswer: ["nobody", "no one"]
    },
    {
        sentence: "I have a carpet here with all the relevant documents.",
        errorWord: "carpet",
        correctAnswer: "folder"
    },
    {
        sentence: "She’s responsible of training new employees.",
        errorWord: "of",
        correctAnswer: "for"
    },
    {
        sentence: "At the moment, I’m unemployment, but I’m looking for a job.",
        errorWord: "unemployment",
        correctAnswer: "unemployed"
    },
    {
        sentence: "My wife and I often discuss about stupid things.",
        errorWord: "discuss",
        correctAnswer: "argue"
    },
    {
        sentence: "You can’t avoid me from seeing my friends.",
        errorWord: "avoid",
        correctAnswer: ["prevent", "stop"]
    },
    {
        sentence: "I wish it doesn’t rain during your holiday!",
        errorWord: "wish",
        correctAnswer: "hope"
    },
    {
        sentence: "Atleti won Real Madrid last night.",
        errorWord: "won",
        correctAnswer: "beat"
    },
    {
        sentence: "I’ll have a shower before go out.",
        errorWord: "go",
        correctAnswer: "going"
    },
    {
        sentence: "Sarah doesn’t think he’s coming today but I think yes.",
        errorWord: "yes",
        correctAnswer: "so"
    },
    {
        sentence: "For a long and healthy life, it’s important to practise sport regularly.",
        errorWord: "practise",
        correctAnswer: "do"
    },
    {
        sentence: "The factory needs to contract more staff over the summer.",
        errorWord: "contract",
        correctAnswer: ["hire", "employ", "take on"]
    },
    {
        sentence: "I’ve never been in London, but I would really like to go.",
        errorWord: "in",
        correctAnswer: "to"
    },
    {
        sentence: "Don’t put attention to anything they say.",
        errorWord: "put",
        correctAnswer: "pay"
    },
    {
        sentence: "He’s talking with the phone right now.",
        errorWord: "with",
        correctAnswer: "on"
    },
    {
        sentence: "The flight was cancelled for the weather.",
        errorWord: "for",
        correctAnswer: ["because of", "due to"]
    },
    {
        sentence: "I have known them since seven years.",
        errorWord: "since",
        correctAnswer: "for"
    },
    {
        sentence: "I don’t know how it is called.",
        errorWord: "how",
        correctAnswer: "what"
    },
    {
        sentence: "I have a doubt about this.",
        errorWord: "doubt",
        correctAnswer: "question"
    },
    {
        sentence: "I have a lot of homeworks.",
        errorWord: "homeworks",
        correctAnswer: "homework"
    },
    {
        sentence: "She’s very good in maths.",
        errorWord: "in",
        correctAnswer: "at"
    },
    {
        sentence: "They remembered me of my cousins.",
        errorWord: "remembered",
        correctAnswer: "reminded"
    },
    {
        sentence: "She’s married with an Ethiopian man.",
        errorWord: "with",
        correctAnswer: "to"
    },
    {
        sentence: "I like going to a disco at the weekend.",
        errorWord: "disco",
        correctAnswer: "club"
    },
    {
        sentence: "He’s so educated. He always treats everybody with a lot of respect.",
        errorWord: "educated",
        correctAnswer: "polite"
    },
    {
        sentence: "He needs to go to university because he pretends to be a doctor.",
        errorWord: "pretends",
        correctAnswer: ["intends", "wants", "hopes"]
    },
    {
        sentence: "The noise from the neighbour’s house is molesting me.",
        errorWord: "molesting",
        correctAnswer: ["bothering", "annoying", "disturbing", "irritating"]
    },
    {
        sentence: "I liked the movie, but it was a little large for me.",
        errorWord: "large",
        correctAnswer: "long"
    },
    {
        sentence: "He got a great punctuation in the game.",
        errorWord: "punctuation",
        correctAnswer: "score"
    },
    {
        sentence: "Can you borrow me your pen?",
        errorWord: "borrow",
        correctAnswer: "lend"
    },
    {
        sentence: "She works as a commercial in a bank.",
        errorWord: "commercial",
        correctAnswer: ["saleswoman", "salesperson"]
    },
    {
        sentence: "They said me to wait here.",
        errorWord: "said",
        correctAnswer: "told"
    },
    {
        sentence: "They all agreed that rock-climbing would be more funny.",
        errorWord: "funny",
        correctAnswer: "fun"
    },
    {
        sentence: "Did you know that Jane is going to make a party on Friday?",
        errorWord: "make",
        correctAnswer: "have"
    },
    { 
        sentence: "There’s plenty more soap if you’re still hungry.", 
        errorWord: "soap", 
        correctAnswer: "soup"
    },
    { 
        sentence: "We knew each other in 1996.", 
        errorWord: "knew", 
        correctAnswer: "met"
    },
    { 
        sentence: "I lived in Japan during three years.", 
        errorWord: "during", 
        correctAnswer: "for"
    },
    { 
        sentence: "I have two brothers, María and Juan.", 
        errorWord: "brothers", 
        correctAnswer: "siblings"
    },
    { 
        sentence: "Jane works very hardly. She’s a workaholic.", 
        errorWord: "hardly", 
        correctAnswer: "hard"
    },
    { 
        sentence: "Our teacher puts us too much homework.", 
        errorWord: "puts", 
        correctAnswer: ["gives", "sets"]
    },
    { 
        sentence: "I prefer spending time with another people.", 
        errorWord: "another", 
        correctAnswer: "other"
    },
    { 
        sentence: "I usually visit my family in Christmas.", 
        errorWord: "in", 
        correctAnswer: "at"
    },
    { 
        sentence: "Tim’s not as taller as me.", 
        errorWord: "taller", 
        correctAnswer: "tall"
    },
    { 
        sentence: "It’s one of the safest city in the world.", 
        errorWord: "city", 
        correctAnswer: "cities"
    },
    { 
        sentence: "How many time do you need?", 
        errorWord: "many", 
        correctAnswer: "much"
    },
    { 
        sentence: "I'm watching a great serie at the moment.", 
        errorWord: "serie", 
        correctAnswer: "series"
    }
];


// Create and store the game instance globally
window.game = new SpanglishFixitGame(sentences);


// -------------------------------
// Firebase Multiplayer Functions
// -------------------------------

// Create a new game session and store it in Firebase
function createGameSession(sentences) {
  // Shuffle sentences once so both players use the same order
  const shuffledSentences = [...sentences].sort(() => Math.random() - 0.5);
  const newSessionRef = firebase.database().ref('gameSessions').push();
  const sessionId = newSessionRef.key;
  newSessionRef.set({
    sentences: shuffledSentences,  // Shared shuffled order
    currentRound: 0,
    roundStartTime: Date.now(),
    players: {},  // No pre-population here!
    createdAt: Date.now()
  });
  console.log("Created game session with ID:", sessionId);
  return sessionId;
}

function joinGameSession(sessionId, userEnteredName) {
  const sessionRef = firebase.database().ref('gameSessions/' + sessionId);

  // Check which player slot is free (player1 or player2)
  sessionRef.child('players').once('value').then((snapshot) => {
    const playersData = snapshot.val() || {};
    let newPlayerKey;

    if (!playersData.player1) {
      newPlayerKey = 'player1';
    } else if (!playersData.player2) {
      newPlayerKey = 'player2';
    } else {
      console.error("Session is already full (2 players).");
      return;
    }

    // Set the player's data using the fixed key, but store their custom name
    sessionRef.child('players').child(newPlayerKey).set({
      name: userEnteredName,
      score: 0,
      hasAnswered: false
    });

    // Update local references to the session and player key
    currentSessionId = sessionId;
    currentPlayerId  = newPlayerKey; // will be either 'player1' or 'player2'

    // Listen for session changes and update the UI accordingly
    sessionRef.on('value', (snapshot) => {
      const gameState = snapshot.val();
      console.log("Game session updated:", gameState);

      // Update round counter and scores
      if (gameState && typeof gameState.currentRound === "number") {
        if (window.game.currentIndex !== gameState.currentRound) {
          window.game.currentIndex = gameState.currentRound;
          window.game.updateSentence();
        }
        document.getElementById("counter").textContent = `Round: ${gameState.currentRound + 1}`;
      }

      // Synchronize the sentence order if available
      if (gameState && gameState.sentences) {
        window.game.sentences = gameState.sentences;
      }

      // Check if two players are present and the game hasn't started yet
      if (gameState && gameState.players && Object.keys(gameState.players).length === 2 &&
          gameState.currentRound === 0 && !window.countdownStarted) {
        window.countdownStarted = true;
        const waitingEl = document.getElementById('waiting');
        if (waitingEl) waitingEl.remove();
        startCountdown();
      }

      // Display a waiting message if one player has answered but the other hasn't
      if (gameState && gameState.players) {
        const playerKeys = Object.keys(gameState.players);
        // Find the other player's key
        const otherPlayerKey = playerKeys.find(key => key !== currentPlayerId);
        if (otherPlayerKey) {
          if (gameState.players[currentPlayerId].hasAnswered &&
              !gameState.players[otherPlayerKey].hasAnswered) {
            document.getElementById("feedback").textContent = 
              `Waiting for ${gameState.players[otherPlayerKey].name} to complete the round...`;
          } else if (gameState.players[otherPlayerKey].hasAnswered &&
                     !gameState.players[currentPlayerId].hasAnswered) {
            document.getElementById("feedback").textContent = 
              `Waiting for ${gameState.players[currentPlayerId].name} to complete the round...`;
          } else {
            // Clear the waiting message if both haven't answered or once both have answered
            if (!gameState.roundOver) {
              document.getElementById("feedback").textContent = "";
            }
          }
        }
      }

      // If the shared roundOver flag is set and the overlay hasn't been displayed yet, show the intermission overlay
      if (gameState && gameState.roundOver && !window.overlayDisplayed) {
        window.overlayDisplayed = true;
        // Retrieve the current sentence from the shared sentences using the currentRound index
        showIntermission(gameState.sentences[gameState.currentRound], gameState);
      }

      // Optionally log player data for debugging
      if (gameState && gameState.players) {
        console.log("Players:", gameState.players);
      }
    });
  });
}

// -------------------------------
// Example Usage:
// -------------------------------

// To create a multiplayer session, call createGameSession with your sentences array:
// const sessionId = createGameSession(sentences);
// You can then display this sessionId on the UI so another player can join.

// To join a multiplayer session, use joinGameSession with the room ID and a unique player identifier:
// joinGameSession("theRoomIdFromUI", "player1");

// ------------------------------------------------------
// You can integrate these functions with new UI elements such as:
// - A "Create Multiplayer Game" button that calls createGameSession(sentences)
// - An input field for a room ID and a "Join Multiplayer Game" button that calls joinGameSession(roomId, playerId)
// ------------------------------------------------------

function submitAnswer(newScore) {
  if (!currentSessionId || !currentPlayerId) {
    console.error("Session ID or player ID is not set.");
    return;
  }
  const sessionRef = firebase.database().ref('gameSessions/' + currentSessionId);

  // Update the player's score and mark as answered
  sessionRef.child('players').child(currentPlayerId).update({
    score: newScore,
    hasAnswered: true
  });

  // Read the entire session data to access currentRound and player scores
  sessionRef.once('value', (snapshot) => {
    const sessionData = snapshot.val();
    const players = sessionData.players;
    // When both players have answered and roundOver is not already set, update it
    if (
      players.player1.hasAnswered &&
      players.player2 &&
      players.player2.hasAnswered &&
      !sessionData.roundOver
    ) {
      sessionRef.update({
        roundOver: true,
        roundOverTime: Date.now()
      });
    }
  });
}


function showIntermission(currentSentence, sessionData) {
  const sessionRef = firebase.database().ref('gameSessions/' + currentSessionId);
  
  // Retrieve players from the session data
  const p1 = sessionData.players.player1;
  const p2 = sessionData.players.player2;
  
  // Determine which player is leading
  let firstPlayer, secondPlayer;
  if (p1.score >= p2.score) {
    firstPlayer = p1;
    secondPlayer = p2;
  } else {
    firstPlayer = p2;
    secondPlayer = p1;
  }
  
  // Create an intermission overlay element with enhanced visuals
  const intermissionDiv = document.createElement('div');
  intermissionDiv.id = 'intermission';
  intermissionDiv.style.position = 'absolute';
  intermissionDiv.style.top = '50%';
  intermissionDiv.style.left = '50%';
  intermissionDiv.style.transform = 'translate(-50%, -50%)';
  intermissionDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
  intermissionDiv.style.padding = '30px';
  intermissionDiv.style.borderRadius = '12px';
  intermissionDiv.style.boxShadow = '0px 0px 20px rgba(0, 0, 0, 0.5)';
  intermissionDiv.style.zIndex = '2000';
  intermissionDiv.style.color = '#fff';
  intermissionDiv.style.fontFamily = "'Poppins', sans-serif";
  
  // Format the correct answer (handling arrays if necessary)
  const correctText = Array.isArray(currentSentence.correctAnswer)
    ? currentSentence.correctAnswer.join(" / ")
    : currentSentence.correctAnswer;
  
  // Build the inner HTML using the custom names and ordering by score
  intermissionDiv.innerHTML = `
    <h2 style="margin-top: 0; font-size: 28px;">Round Complete!</h2>
    <p style="font-size: 20px;">
      <strong>Error Word:</strong> 
      <span style="color: #FF4D4D; font-weight: bold;">${currentSentence.errorWord}</span>
    </p>
    <p style="font-size: 20px;">
      <strong>Correct Word:</strong> 
      <span style="color: #66FF66; font-weight: bold;">${correctText}</span>
    </p>
    <hr style="border: 1px solid #555; margin: 20px 0;">
    <p style="font-size: 20px;">
      <strong style="color: #00FF00;">${firstPlayer.name} Score:</strong> ${firstPlayer.score}
    </p>
    <p style="font-size: 20px;">
      <strong style="color: #FF0000;">${secondPlayer.name} Score:</strong> ${secondPlayer.score}
    </p>
    <p style="font-size: 18px; margin-top: 20px;">
      Next round starting in <span id="intermissionCountdown">5</span> seconds
    </p>
  `;
  
  document.getElementById("game-container").appendChild(intermissionDiv);
  
  // Set countdown to 5 seconds
  let countdown = 5;
  const intermissionInterval = setInterval(() => {
    countdown--;
    document.getElementById("intermissionCountdown").textContent = countdown;
    if (countdown <= 0) {
      clearInterval(intermissionInterval);
      intermissionDiv.remove();
      // Advance to the next round by updating Firebase:
      const newRound = sessionData.currentRound + 1;
      sessionRef.update({
        currentRound: newRound,
        roundStartTime: Date.now(),
        roundOver: false  // Clear the roundOver flag
      });
      // Reset answer flags for both players
      sessionRef.child('players').child('player1').update({ hasAnswered: false });
      sessionRef.child('players').child('player2').update({ hasAnswered: false });
      window.overlayDisplayed = false;
    }
  }, 1000);
}

// Now define startMultiplayerGame() at top level, not inside submitAnswer()
function startMultiplayerGame() {
  promptForPlayerName((name) => {
    currentPlayerId = name; // Use the custom name for player1
    currentSessionId = createGameSession(sentences);
    joinGameSession(currentSessionId, currentPlayerId);

    // Hide the single-player Start button
    document.getElementById("start").style.display = "none";

    // Display a waiting message for player1 until another player joins
    const waitingMessage = document.createElement('div');
    waitingMessage.id = 'waiting';
    waitingMessage.style.fontSize = '24px';
    waitingMessage.style.marginTop = '10px';
    waitingMessage.textContent = "Waiting for another player to join...";
    document.getElementById("game-container").appendChild(waitingMessage);

    // Mark the game as active in multiplayer mode
    window.game.gameActive = true;
    console.log("Multiplayer session created & joined as", currentPlayerId, "with session ID:", currentSessionId);
  });
}

function startCountdown() {
  let countdown = 5;
  const countdownEl = document.createElement("div");
  countdownEl.id = "countdown";
  countdownEl.style.fontSize = "24px";
  countdownEl.style.marginTop = "10px";
  document.getElementById("game-container").appendChild(countdownEl);

  const interval = setInterval(() => {
    countdownEl.textContent = `Game starting in ${countdown}...`;
    if (countdown <= 0) {
      clearInterval(interval);
      countdownEl.remove();
      // Start the game for both players after countdown
      window.game.startGame();
    }
    countdown--;
  }, 1000);
}

function promptForPlayerName(callback) {
  // Create an overlay element
  const overlay = document.createElement("div");
  overlay.id = "nameOverlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "3000";
  
  // Create inner content with aesthetics matching the game overlays
  overlay.innerHTML = `
    <div style="
      background: #333;
      color: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      width: 80%;
      max-width: 400px;
      font-family: 'Poppins', sans-serif;
    ">
      <h2 style="margin-top: 0;">Enter Your Name</h2>
      <input type="text" id="playerNameInput" placeholder="Your name" style="
          padding: 10px;
          font-size: 16px;
          border-radius: 5px;
          border: none;
          outline: none;
          text-align: center;
          display: block;
          margin: 10px auto;
          width: 80%;
      "/>
      <br/>
      <button id="submitPlayerName" style="
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 5px;
          transition: 0.3s;
      ">Submit</button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Auto-select the input and allow submission with Enter key
  const input = document.getElementById("playerNameInput");
  input.focus();
  input.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      document.getElementById("submitPlayerName").click();
    }
  });
  
  document.getElementById("submitPlayerName").addEventListener("click", () => {
    const name = input.value.trim();
    if (name !== "") {
      document.body.removeChild(overlay);
      callback(name);
    } else {
      alert("Please enter a valid name.");
    }
  });
}

