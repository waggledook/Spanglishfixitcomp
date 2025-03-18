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
        <!-- Sentence counter -->
        <p id="counter">Sentence: 0/15</p>
        <!-- Points bar container -->
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
`;
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
        if (!this.currentErrorWord) {
            document.getElementById("feedback").textContent = "Please click on the incorrect word first!";
            return;
        }
        if (this.pointsInterval) {
            clearInterval(this.pointsInterval);
            this.pointsInterval = null;
        }
        if (!this.gameActive && !this.reviewMode) return;
        const input = document.getElementById("answer");
        const userInput = input.value.trim().toLowerCase();
        const currentSet = this.reviewMode ? this.wrongAnswers : this.sentences;
        const currentSentence = currentSet[this.currentIndex];
        const correctionTime = Date.now() - this.startCorrectionTime;
        let possibleAnswers = currentSentence.correctAnswer;
        if (!Array.isArray(possibleAnswers)) {
            possibleAnswers = [possibleAnswers];
        }
        possibleAnswers = possibleAnswers.map(answer => answer.toLowerCase());
        if (this.reviewMode) {
            if (possibleAnswers.includes(userInput)) {
                input.classList.add("correct");
                document.getElementById("feedback").textContent = `Correct. The answer is: ${possibleAnswers.join(" / ")}`;
                setTimeout(() => {
                    input.classList.remove("correct");
                    input.value = "";
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
        if (possibleAnswers.includes(userInput)) {
            let correctionScore = Math.max(100 - Math.floor(correctionTime / 300), 10);
            this.score += correctionScore;
            document.getElementById("score").textContent = this.score;
            input.classList.add("correct");
            document.getElementById("feedback").textContent = `Correct. The answer is: ${possibleAnswers.join(" / ")}`;
            setTimeout(() => {
                input.classList.remove("correct");
                input.value = "";
                this.currentIndex++;
                this.currentErrorWord = null;
                this.updateSentence();
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
                this.currentIndex++;
                this.currentErrorWord = null;
                this.updateSentence();
            }, 1000);
        }
    }

    // No overall timer now, so startTimer() is removed.

    endGame() {
    this.gameActive = false;
    if (this.pointsInterval) clearInterval(this.pointsInterval);

    // Check and update best score using localStorage
    let storedBest = localStorage.getItem("bestScoreSpanglish") || 0;
    let newHighScore = false;
    if (this.score > storedBest) {
        localStorage.setItem("bestScoreSpanglish", this.score);
        newHighScore = true;
    }
    this.updateBestScoreDisplay();

    // Build a "Game Over" message
    let endMessage = `
        <div class="game-over">Game Over!</div>
        <div>Your score: ${this.score}</div>
    `;
    if (newHighScore) {
        endMessage += `<div class="new-high">New High Score!</div>`;
    }

    // Replace the last sentence with the end message
    document.getElementById("sentence").innerHTML = endMessage;

    // Hide the instructions paragraph and clear leftover feedback
    document.getElementById("instructionsText").style.display = "none";
    document.getElementById("feedback").textContent = "";

    // Hide the answer input and reset the points bar
    document.getElementById("answer").style.display = "none";
    document.getElementById("points-bar").style.width = "0%";

    // Show the restart button
    document.getElementById("restart").style.display = "block";

    // Show review button if there are mistakes
    document.getElementById("review").style.display = this.wrongAnswers.length > 0 ? "block" : "none";

    // Show the download report button if present
    const reportButton = document.getElementById("downloadReport");
    if (reportButton) {
        reportButton.style.display = "block";
        // Only attach the click listener once
        if (!reportButton.dataset.listenerAdded) {
            reportButton.addEventListener("click", () => this.downloadReport());
            reportButton.dataset.listenerAdded = "true";
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

const game = new SpanglishFixitGame(sentences);

// -------------------------------
// Firebase Multiplayer Functions
// -------------------------------

// Create a new game session and store it in Firebase
function createGameSession(sentences) {
    // Create a new session under the "gameSessions" node
    const newSessionRef = firebase.database().ref('gameSessions').push();
    const sessionId = newSessionRef.key;
    newSessionRef.set({
        sentences: sentences,  // Store your set of sentences here
        currentRound: 0,
        scores: {},            // This object can later hold player scores (e.g., { player1: 0, player2: 0 })
        createdAt: Date.now()
    });
    console.log("Created game session with ID:", sessionId);
    return sessionId;
}

// Join an existing game session with a given session (room) ID and player ID
function joinGameSession(sessionId, playerId) {
    const sessionRef = firebase.database().ref('gameSessions/' + sessionId);
    
    // Add the player to the scores list for tracking
    sessionRef.child('scores').child(playerId).set(0);
    
    // Listen for changes in the session data (for example, to update round, sentences, or scores)
    sessionRef.on('value', (snapshot) => {
        const gameState = snapshot.val();
        console.log("Game session updated:", gameState);
        // Here you can update your game UI based on the received gameState.
        // For instance, update the current round or display opponent's score.
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

