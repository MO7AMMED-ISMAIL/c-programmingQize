class CProgrammingChallenge {
    constructor() {
        this.questions = []
        this.currentQuestionIndex = 0
        this.userAnswers = []
        this.timeLeft = 30 * 60 // 30 minutes in seconds
        this.timer = null
        this.startTime = null

        this.initializeElements()
        this.loadQuestions()
        this.bindEvents()
    }

    initializeElements() {
        // Screens
        this.welcomeScreen = document.getElementById("welcome-screen")
        this.quizScreen = document.getElementById("quiz-screen")
        this.resultsScreen = document.getElementById("results-screen")

        // Buttons
        this.startBtn = document.getElementById("start-btn")
        this.prevBtn = document.getElementById("prev-btn")
        this.nextBtn = document.getElementById("next-btn")
        this.restartBtn = document.getElementById("restart-btn")

        // Quiz elements
        this.questionText = document.getElementById("question-text")
        this.optionsContainer = document.getElementById("options-container")
        this.questionCounter = document.getElementById("question-counter")
        this.progressBar = document.getElementById("progress")
        this.timerDisplay = document.getElementById("timer")
        this.currentDifficulty = document.getElementById("current-difficulty")

        // Results elements
        this.finalScore = document.getElementById("final-score")
        this.lowScore = document.getElementById("low-score")
        this.mediumScore = document.getElementById("medium-score")
        this.hardScore = document.getElementById("hard-score")
        this.timeTaken = document.getElementById("time-taken")
    }

    async loadQuestions() {
        try {
            const response = await fetch("questions.json")
            const data = await response.json()
            this.questions = data.questions
            this.userAnswers = new Array(this.questions.length).fill(null)
        } catch (error) {
            console.error("Error loading questions:", error)
            alert("Error loading questions. Please refresh the page.")
        }
    }

    bindEvents() {
        this.startBtn.addEventListener("click", () => this.startQuiz())
        this.prevBtn.addEventListener("click", () => this.previousQuestion())
        this.nextBtn.addEventListener("click", () => this.nextQuestion())
        this.restartBtn.addEventListener("click", () => this.restartQuiz())
    }

    startQuiz() {
        this.welcomeScreen.classList.remove("active")
        this.quizScreen.classList.add("active")
        this.startTime = Date.now()
        this.startTimer()
        this.displayQuestion()
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--
            this.updateTimerDisplay()

            if (this.timeLeft <= 0) {
                this.endQuiz()
            }
        }, 1000)
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60)
        const seconds = this.timeLeft % 60
        this.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`

        // Change color when time is running low
        if (this.timeLeft <= 300) {
            // 5 minutes
            this.timerDisplay.parentElement.style.borderColor = "#d32f2f"
            this.timerDisplay.style.color = "#d32f2f"
        }
    }

    displayQuestion() {
        const question = this.questions[this.currentQuestionIndex]

        // Update question counter and progress
        this.questionCounter.textContent = `${this.currentQuestionIndex + 1} / ${this.questions.length}`
        this.progressBar.style.width = `${((this.currentQuestionIndex + 1) / this.questions.length) * 100}%`

        // Update difficulty badge
        this.currentDifficulty.textContent = question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)
        this.currentDifficulty.className = `difficulty-badge ${question.difficulty}`

        // Display question
        this.questionText.textContent = question.question

        // Display options
        this.optionsContainer.innerHTML = ""
        question.options.forEach((option, index) => {
            const optionElement = document.createElement("div")
            optionElement.className = "option"
            optionElement.textContent = option
            optionElement.addEventListener("click", () => this.selectOption(index))

            // Restore previous selection
            if (this.userAnswers[this.currentQuestionIndex] === index) {
                optionElement.classList.add("selected")
            }

            this.optionsContainer.appendChild(optionElement)
        })

        // Update navigation buttons
        this.prevBtn.disabled = this.currentQuestionIndex === 0
        this.nextBtn.disabled = this.userAnswers[this.currentQuestionIndex] === null

        // Change "Next" to "Finish" on last question
        if (this.currentQuestionIndex === this.questions.length - 1) {
            this.nextBtn.textContent = "Finish"
        } else {
            this.nextBtn.textContent = "Next"
        }
    }

    selectOption(optionIndex) {
        // Remove previous selection
        document.querySelectorAll(".option").forEach((option) => {
            option.classList.remove("selected")
        })

        // Add selection to clicked option
        document.querySelectorAll(".option")[optionIndex].classList.add("selected")

        // Store answer
        this.userAnswers[this.currentQuestionIndex] = optionIndex

        // Enable next button
        this.nextBtn.disabled = false
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--
            this.displayQuestion()
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++
            this.displayQuestion()
        } else {
            this.endQuiz()
        }
    }

    endQuiz() {
        clearInterval(this.timer)
        this.calculateResults()
        this.quizScreen.classList.remove("active")
        this.resultsScreen.classList.add("active")
    }

    calculateResults() {
        let totalCorrect = 0
        let lowCorrect = 0,
            lowTotal = 0
        let mediumCorrect = 0,
            mediumTotal = 0
        let hardCorrect = 0,
            hardTotal = 0

        this.questions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index]
            const isCorrect = userAnswer === question.correct

            if (isCorrect) {
                totalCorrect++
            }

            // Count by difficulty
            switch (question.difficulty) {
                case "low":
                    lowTotal++
                    if (isCorrect) lowCorrect++
                    break
                case "medium":
                    mediumTotal++
                    if (isCorrect) mediumCorrect++
                    break
                case "hard":
                    hardTotal++
                    if (isCorrect) hardCorrect++
                    break
            }
        })

        // Display results
        this.finalScore.textContent = totalCorrect
        this.lowScore.textContent = `${lowCorrect}/${lowTotal}`
        this.mediumScore.textContent = `${mediumCorrect}/${mediumTotal}`
        this.hardScore.textContent = `${hardCorrect}/${hardTotal}`

        // Calculate time taken
        const endTime = Date.now()
        const timeTakenMs = endTime - this.startTime
        const timeTakenMinutes = Math.floor(timeTakenMs / 60000)
        const timeTakenSeconds = Math.floor((timeTakenMs % 60000) / 1000)
        this.timeTaken.textContent = `${timeTakenMinutes}:${timeTakenSeconds.toString().padStart(2, "0")}`
    }

    restartQuiz() {
        // Reset all variables
        this.currentQuestionIndex = 0
        this.userAnswers = new Array(this.questions.length).fill(null)
        this.timeLeft = 30 * 60
        this.startTime = null

        // Reset timer display
        this.timerDisplay.textContent = "30:00"
        this.timerDisplay.parentElement.style.borderColor = "#667eea"
        this.timerDisplay.style.color = "#667eea"

        // Show welcome screen
        this.resultsScreen.classList.remove("active")
        this.welcomeScreen.classList.add("active")

        // Clear any running timer
        if (this.timer) {
            clearInterval(this.timer)
        }
    }
}

// Initialize the quiz when the page loads
document.addEventListener("DOMContentLoaded", () => {
    new CProgrammingChallenge()
})
