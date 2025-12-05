  // State variables
        let questions = [];
        let currentQuestionIndex = 0;
        let timeLeft = 10;
        let score = 0;
        let selectedAnswer = null;
        let isAnswered = false;
        let quizComplete = false;
        let skippedQuestions = new Set();
        let timerInterval = null;

        // Initialize app
        function init() {
            loadQuestions();
            updateUI();
        }

        // Load questions from localStorage
        function loadQuestions() {
            const stored = localStorage.getItem('quiz-questions');
            if (stored) {
                questions = JSON.parse(stored);
            } else {
                // Default questions
                questions = [
                    {
                        question: "What is the capital of France?",
                        options: ["London", "Berlin", "Paris", "Madrid"],
                        correct: 2
                    },
                    {
                        question: "Which planet is known as the Red Planet?",
                        options: ["Venus", "Mars", "Jupiter", "Saturn"],
                        correct: 1
                    },
                    {
                        question: "What is 2 + 2?",
                        options: ["3", "4", "5", "6"],
                        correct: 1
                    }
                ];
                saveQuestions();
            }
            // Shuffle questions
            questions = shuffleArray(questions);
        }

        // Save questions to localStorage
        function saveQuestions() {
            localStorage.setItem('quiz-questions', JSON.stringify(questions));
        }

        // Shuffle array
        function shuffleArray(array) {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        }

        // Update UI
        function updateUI() {
            if (questions.length === 0) return;

            document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
            document.getElementById('totalQuestions').textContent = questions.length;
            document.getElementById('score').textContent = score;

            const question = questions[currentQuestionIndex];
            document.getElementById('questionText').textContent = question.question;

            const optionsContainer = document.getElementById('optionsContainer');
            optionsContainer.innerHTML = '';

            question.options.forEach((option, index) => {
                const button = document.createElement('button');
                button.className = 'option-btn';
                button.textContent = option;
                button.onclick = () => selectAnswer(index);
                
                if (isAnswered) {
                    if (index === question.correct) {
                        button.className += ' correct';
                    } else if (selectedAnswer === index) {
                        button.className += ' incorrect';
                    } else {
                        button.className += ' disabled';
                    }
                    button.disabled = true;
                }

                if (skippedQuestions.has(currentQuestionIndex)) {
                    button.disabled = true;
                    button.className += ' disabled';
                }

                optionsContainer.appendChild(button);
            });

            // Update timer color
            const timerContainer = document.getElementById('timerContainer');
            timerContainer.className = 'timer-container';
            if (timeLeft <= 3) {
                timerContainer.className += ' danger';
            } else if (timeLeft <= 6) {
                timerContainer.className += ' warning';
            }

            document.getElementById('timeLeft').textContent = timeLeft;

            // Hide skip button if answered
            document.getElementById('skipBtn').style.display = isAnswered ? 'none' : 'flex';
        }

        // Start timer
        function startTimer() {
            if (timerInterval) clearInterval(timerInterval);
            
            timerInterval = setInterval(() => {
                if (quizComplete || isAnswered) {
                    clearInterval(timerInterval);
                    return;
                }

                timeLeft--;
                updateUI();

                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    handleTimeout();
                }
            }, 1000);
        }

        // Handle timeout
        function handleTimeout() {
            isAnswered = true;
            updateUI();
            setTimeout(moveToNextQuestion, 2000);
        }

        // Select answer
        function selectAnswer(index) {
            if (isAnswered || timeLeft === 0 || skippedQuestions.has(currentQuestionIndex)) return;

            selectedAnswer = index;
            isAnswered = true;

            if (index === questions[currentQuestionIndex].correct) {
                score++;
            }

            clearInterval(timerInterval);
            updateUI();
            setTimeout(moveToNextQuestion, 2000);
        }

        // Skip question
        function skipQuestion() {
            if (isAnswered) return;
            
            skippedQuestions.add(currentQuestionIndex);
            isAnswered = true;
            clearInterval(timerInterval);
            updateUI();
            setTimeout(moveToNextQuestion, 1000);
        }

        // Move to next question
        function moveToNextQuestion() {
            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                timeLeft = 10;
                selectedAnswer = null;
                isAnswered = false;
                updateUI();
                startTimer();
            } else {
                showCompleteScreen();
            }
        }

        // Show complete screen
        function showCompleteScreen() {
            quizComplete = true;
            clearInterval(timerInterval);
            
            document.getElementById('quizScreen').classList.add('hidden');
            document.getElementById('completeScreen').classList.remove('hidden');
            document.getElementById('finalScore').textContent = score;
            document.getElementById('finalTotal').textContent = questions.length;
        }

        // Restart quiz
        function restartQuiz() {
            loadQuestions();
            currentQuestionIndex = 0;
            timeLeft = 10;
            score = 0;
            selectedAnswer = null;
            isAnswered = false;
            quizComplete = false;
            skippedQuestions = new Set();
            
            document.getElementById('completeScreen').classList.add('hidden');
            document.getElementById('quizScreen').classList.remove('hidden');
            
            updateUI();
            startTimer();
        }

        // Switch to admin
        function switchToAdmin() {
            clearInterval(timerInterval);
            document.getElementById('quizScreen').classList.add('hidden');
            document.getElementById('completeScreen').classList.add('hidden');
            document.getElementById('adminScreen').classList.remove('hidden');
            displayAdminQuestions();
        }

        // Switch to quiz
        function switchToQuiz() {
            document.getElementById('adminScreen').classList.add('hidden');
            
            if (quizComplete) {
                document.getElementById('completeScreen').classList.remove('hidden');
            } else {
                document.getElementById('quizScreen').classList.remove('hidden');
                startTimer();
            }
        }

        // Add question
        function addQuestion() {
            const questionText = document.getElementById('newQuestion').value.trim();
            const options = [
                document.getElementById('option0').value.trim(),
                document.getElementById('option1').value.trim(),
                document.getElementById('option2').value.trim(),
                document.getElementById('option3').value.trim()
            ];

            const correctAnswer = parseInt(document.querySelector('input[name="correctAnswer"]:checked').value);

            if (!questionText || options.some(opt => !opt)) {
                alert('Please fill in all fields');
                return;
            }

            const newQuestion = {
                question: questionText,
                options: options,
                correct: correctAnswer
            };

            // Get original questions (not shuffled)
            const stored = localStorage.getItem('quiz-questions');
            const originalQuestions = stored ? JSON.parse(stored) : [];
            originalQuestions.push(newQuestion);
            
            localStorage.setItem('quiz-questions', JSON.stringify(originalQuestions));

            // Clear form
            document.getElementById('newQuestion').value = '';
            document.getElementById('option0').value = '';
            document.getElementById('option1').value = '';
            document.getElementById('option2').value = '';
            document.getElementById('option3').value = '';
            document.querySelector('input[name="correctAnswer"]').checked = true;

            displayAdminQuestions();
            alert('Question added successfully!');
        }

        // Display admin questions
        function displayAdminQuestions() {
            const stored = localStorage.getItem('quiz-questions');
            const originalQuestions = stored ? JSON.parse(stored) : [];
            
            document.getElementById('questionCount').textContent = originalQuestions.length;
            
            const questionsList = document.getElementById('questionsList');
            questionsList.innerHTML = '';

            originalQuestions.forEach((q, index) => {
                const questionItem = document.createElement('div');
                questionItem.className = 'question-item';
                
                const header = document.createElement('div');
                header.className = 'question-item-header';
                
                const title = document.createElement('h3');
                title.className = 'question-item-title';
                title.textContent = q.question;
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;
                deleteBtn.onclick = () => deleteQuestion(index);
                
                header.appendChild(title);
                header.appendChild(deleteBtn);
                
                const optionsDiv = document.createElement('div');
                optionsDiv.className = 'question-options';
                
                q.options.forEach((opt, optIndex) => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = `question-option ${optIndex === q.correct ? 'correct' : 'incorrect'}`;
                    optionDiv.textContent = opt + (optIndex === q.correct ? ' ✓' : '');
                    optionsDiv.appendChild(optionDiv);
                });
                
                questionItem.appendChild(header);
                questionItem.appendChild(optionsDiv);
                questionsList.appendChild(questionItem);
            });
        }

        // Delete question
        function deleteQuestion(index) {
            if (!confirm('Are you sure you want to delete this question?')) return;
            
            const stored = localStorage.getItem('quiz-questions');
            const originalQuestions = stored ? JSON.parse(stored) : [];
            originalQuestions.splice(index, 1);
            
            localStorage.setItem('quiz-questions', JSON.stringify(originalQuestions));
            displayAdminQuestions();
        }

        // Start the app
        init();
        startTimer();