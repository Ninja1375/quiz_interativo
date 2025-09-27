// =============================================
// CONFIGURAÇÕES E CONSTANTES
// =============================================

class QuizConfig {
    static INITIAL_TIME = 10;
    static TIME_INTERVAL = 1000;
    static WARNING_TIME = 5;
}

// =============================================
// ELEMENTOS DO DOM
// =============================================

const DOMElements = {
    timeLeft: document.querySelector(".time-left"),
    quizContainer: document.getElementById("container"),
    nextBtn: document.getElementById("next-button"),
    countOfQuestion: document.querySelector(".number-of-question"),
    displayContainer: document.getElementById("display-container"),
    scoreContainer: document.querySelector(".score-container"),
    restart: document.getElementById("restart"),
    userScore: document.getElementById("user-score"),
    scoreMessage: document.getElementById("score-message"),
    startScreen: document.querySelector(".start-screen"),
    startButton: document.getElementById("start-button"),
    timerDiv: document.querySelector(".timer-div")
};

// =============================================
// DADOS DO QUIZ
// =============================================

const quizArray = [
    {
        id: "0",
        question: "O que é o JavaScript?",
        options: [
            "Uma linguagem para Back End", 
            "Uma linguagem para Front End", 
            "Uma linguagem fortemente tipada", 
            "Uma linguagem morta"
        ],
        correct: "Uma linguagem para Front End",
        explanation: "JavaScript é principalmente uma linguagem de front-end, mas também pode ser usado no back-end com Node.js."
    },
    {
        id: "1",
        question: "O que é o CSS?",
        options: [
            "Linguagem de programação", 
            "Uma linguagem para Back End", 
            "Uma linguagem de programação para Front End", 
            "Uma linguagem de estilização"
        ],
        correct: "Uma linguagem de estilização",
        explanation: "CSS (Cascading Style Sheets) é uma linguagem de estilização usada para descrever a apresentação de documentos HTML."
    },
    {
        id: "2",
        question: "O que é o HTML?",
        options: [
            "Uma linguagem de marcação de hipertexto", 
            "Uma linguagem para Back End", 
            "Uma linguagem de programação antiga", 
            "Uma tecnologia ultrapassada"
        ],
        correct: "Uma linguagem de marcação de hipertexto",
        explanation: "HTML (HyperText Markup Language) é a linguagem de marcação padrão para criar páginas web."
    }
];

// =============================================
// ESTADO DA APLICAÇÃO
// =============================================

class QuizState {
    static questionCount = 0;
    static scoreCount = 0;
    static count = QuizConfig.INITIAL_TIME;
    static countdown = null;
    static currentQuizArray = [];
    static userAnswers = [];
}

// =============================================
// UTILITÁRIOS
// =============================================

const QuizUtils = {
    // Embaralhar array usando Fisher-Yates algorithm
    shuffleArray: (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },

    // Formatar texto
    capitalizeFirst: (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    },

    // Validar elementos DOM
    validateDOMElements: () => {
        const missingElements = Object.entries(DOMElements)
            .filter(([key, element]) => !element)
            .map(([key]) => key);
        
        if (missingElements.length > 0) {
            console.error('Elementos DOM não encontrados:', missingElements);
            return false;
        }
        return true;
    },

    // Gerar mensagem de pontuação
    getScoreMessage: (score, total) => {
        const percentage = (score / total) * 100;
        
        if (percentage === 100) {
            return "🎉 Perfeito! Você é um expert!";
        } else if (percentage >= 70) {
            return "👍 Muito bom! Você mandou bem!";
        } else if (percentage >= 50) {
            return "💪 Bom trabalho! Continue praticando!";
        } else {
            return "📚 Continue estudando! Você vai melhorar!";
        }
    }
};

// =============================================
// GERENCIAMENTO DE TEMPO
// =============================================

const TimerManager = {
    start: () => {
        QuizState.count = QuizConfig.INITIAL_TIME;
        DOMElements.timeLeft.textContent = `${QuizState.count}s`;
        DOMElements.timerDiv.classList.remove("warning");
        
        QuizState.countdown = setInterval(() => {
            QuizState.count--;
            DOMElements.timeLeft.textContent = `${QuizState.count}s`;
            
            // Aviso visual quando o tempo estiver acabando
            if (QuizState.count <= QuizConfig.WARNING_TIME) {
                DOMElements.timerDiv.classList.add("warning");
            }
            
            if (QuizState.count <= 0) {
                TimerManager.stop();
                QuizManager.handleTimeUp();
            }
        }, QuizConfig.TIME_INTERVAL);
    },

    stop: () => {
        if (QuizState.countdown) {
            clearInterval(QuizState.countdown);
            QuizState.countdown = null;
        }
        DOMElements.timerDiv.classList.remove("warning");
    },

    reset: () => {
        TimerManager.stop();
        QuizState.count = QuizConfig.INITIAL_TIME;
        DOMElements.timeLeft.textContent = `${QuizState.count}s`;
    }
};

// =============================================
// GERENCIAMENTO DO QUIZ
// =============================================

const QuizManager = {
    // Verificar resposta do usuário
    checkAnswer: (userOption) => {
        const userSolution = userOption.textContent.trim();
        const currentQuestion = QuizState.currentQuizArray[QuizState.questionCount];
        const questionElement = document.querySelectorAll(".container-mid")[QuizState.questionCount];
        const options = questionElement.querySelectorAll(".option-div");

        // Desativar todas as opções
        options.forEach(option => {
            option.disabled = true;
            option.style.cursor = 'not-allowed';
        });

        // Salvar resposta do usuário
        QuizState.userAnswers[QuizState.questionCount] = {
            question: currentQuestion.question,
            userAnswer: userSolution,
            correctAnswer: currentQuestion.correct,
            isCorrect: userSolution === currentQuestion.correct
        };

        // Verificar se a resposta está correta
        if (userSolution === currentQuestion.correct) {
            userOption.classList.add("correct");
            QuizState.scoreCount++;
        } else {
            userOption.classList.add("incorrect");
            // Marcar a resposta correta
            options.forEach(option => {
                if (option.textContent.trim() === currentQuestion.correct) {
                    option.classList.add("correct");
                }
            });
        }

        TimerManager.stop();
        DOMElements.nextBtn.classList.remove("hide");
    },

    // Tempo esgotado
    handleTimeUp: () => {
        const currentQuestion = QuizState.currentQuizArray[QuizState.questionCount];
        const questionElement = document.querySelectorAll(".container-mid")[QuizState.questionCount];
        const options = questionElement.querySelectorAll(".option-div");

        // Desativar todas as opções
        options.forEach(option => {
            option.disabled = true;
            option.style.cursor = 'not-allowed';
        });

        // Marcar a resposta correta
        options.forEach(option => {
            if (option.textContent.trim() === currentQuestion.correct) {
                option.classList.add("correct");
            }
        });

        // Salvar resposta como incorreta (tempo esgotado)
        QuizState.userAnswers[QuizState.questionCount] = {
            question: currentQuestion.question,
            userAnswer: "Tempo esgotado",
            correctAnswer: currentQuestion.correct,
            isCorrect: false
        };

        DOMElements.nextBtn.classList.remove("hide");
    },

    // Exibir próxima questão
    displayNext: () => {
        QuizState.questionCount++;
        DOMElements.nextBtn.classList.add("hide");

        if (QuizState.questionCount >= QuizState.currentQuizArray.length) {
            QuizManager.showScore();
        } else {
            QuizManager.updateQuestionDisplay();
            TimerManager.reset();
            TimerManager.start();
        }
    },

    // Atualizar display da questão
    updateQuestionDisplay: () => {
        DOMElements.countOfQuestion.textContent = 
            `${QuizState.questionCount + 1} de ${QuizState.currentQuizArray.length} Questões`;
        
        const quizCards = document.querySelectorAll(".container-mid");
        quizCards.forEach(card => card.classList.add("hide"));
        
        if (quizCards[QuizState.questionCount]) {
            quizCards[QuizState.questionCount].classList.remove("hide");
        }
    },

    // Mostrar tela de pontuação
    showScore: () => {
        DOMElements.displayContainer.classList.add("hide");
        DOMElements.scoreContainer.classList.remove("hide");
        
        const scoreText = `Você acertou ${QuizState.scoreCount} de ${QuizState.currentQuizArray.length}`;
        const message = QuizUtils.getScoreMessage(QuizState.scoreCount, QuizState.currentQuizArray.length);
        
        DOMElements.userScore.textContent = scoreText;
        DOMElements.scoreMessage.textContent = message;
    },

    // Criar elementos do quiz
    createQuiz: () => {
        DOMElements.quizContainer.innerHTML = '';
        
        // Embaralhar questões
        QuizState.currentQuizArray = QuizUtils.shuffleArray([...quizArray]);
        
        // Manter as opções em ordem original para consistência
        QuizState.currentQuizArray = QuizState.currentQuizArray.map(question => ({
            ...question
        }));

        // Criar cards das questões
        QuizState.currentQuizArray.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = `container-mid ${index === 0 ? '' : 'hide'}`;
            questionDiv.setAttribute('data-question-id', question.id);

            // Adicionar questão
            const questionElement = document.createElement('p');
            questionElement.className = 'question';
            questionElement.textContent = question.question;
            questionDiv.appendChild(questionElement);

            // Container para opções
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options-container';

            // Adicionar opções
            question.options.forEach(option => {
                const optionButton = document.createElement('button');
                optionButton.className = 'option-div';
                optionButton.textContent = option;
                optionButton.addEventListener('click', () => QuizManager.checkAnswer(optionButton));
                optionsContainer.appendChild(optionButton);
            });

            questionDiv.appendChild(optionsContainer);
            DOMElements.quizContainer.appendChild(questionDiv);
        });

        DOMElements.countOfQuestion.textContent = 
            `1 de ${QuizState.currentQuizArray.length} Questões`;
    }
};

// =============================================
// INICIALIZAÇÃO E CONTROLES
// =============================================

const AppController = {
    // Inicializar quiz
    initialize: () => {
        if (!QuizUtils.validateDOMElements()) return;

        DOMElements.quizContainer.innerHTML = '';
        QuizState.questionCount = 0;
        QuizState.scoreCount = 0;
        QuizState.userAnswers = [];
        
        TimerManager.reset();
        QuizManager.createQuiz();
        QuizManager.updateQuestionDisplay();
        TimerManager.start();
    },

    // Reiniciar quiz
    restart: () => {
        AppController.initialize();
        DOMElements.displayContainer.classList.remove("hide");
        DOMElements.scoreContainer.classList.add("hide");
    },

    // Iniciar quiz
    start: () => {
        DOMElements.startScreen.classList.add("hide");
        DOMElements.displayContainer.classList.remove("hide");
        AppController.initialize();
    }
};

// =============================================
// EVENT LISTENERS
// =============================================

const setupEventListeners = () => {
    // Botão reiniciar
    DOMElements.restart.addEventListener("click", AppController.restart);

    // Botão próximo
    DOMElements.nextBtn.addEventListener("click", QuizManager.displayNext);

    // Botão iniciar
    DOMElements.startButton.addEventListener("click", AppController.start);

    // Teclado - Enter para próxima pergunta
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && 
            !DOMElements.nextBtn.classList.contains('hide') && 
            !DOMElements.displayContainer.classList.contains('hide')) {
            QuizManager.displayNext();
        }
        
        // Espaço para reiniciar na tela de score
        if (event.key === ' ' && 
            !DOMElements.scoreContainer.classList.contains('hide')) {
            AppController.restart();
        }
    });

    // Prevenir F5 durante o quiz
    window.addEventListener('beforeunload', (event) => {
        if (!DOMElements.startScreen.classList.contains('hide')) {
            return;
        }
        event.preventDefault();
        event.returnValue = '';
    });
};

// =============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    // Validar se todos os elementos existem
    if (!QuizUtils.validateDOMElements()) {
        console.error('Erro: Alguns elementos do DOM não foram encontrados.');
        return;
    }

    setupEventListeners();
    
    // Estado inicial
    DOMElements.startScreen.classList.remove("hide");
    DOMElements.displayContainer.classList.add("hide");
    DOMElements.scoreContainer.classList.add("hide");
    DOMElements.nextBtn.classList.add("hide");
});

// =============================================
// EXPORTAÇÃO PARA TESTES (se necessário)
// =============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuizManager, TimerManager, QuizUtils, AppController };
}