let currentQuestionIndex = 0;
let score = 0;
let selectedDomain = "";
let userName = "";

const quizData = {
  javascript: [
    { question: "Which keyword is used to declare a variable in ES6?", options: ["var", "let", "const", "define"], answer: "let" },
    { question: "Which symbol is used for comments in JavaScript?", options: ["//", "/*", "#", "<!--"], answer: "//" }
  ],
  python: [
    { question: "What keyword is used to define a function in Python?", options: ["function", "def", "lambda", "fun"], answer: "def" },
    { question: "What is the output of: print(3 * 'hi')?", options: ["hihihi", "hi3", "error", "3hi"], answer: "hihihi" }
  ],
  java: [
    { question: "Which method is the entry point of any Java program?", options: ["start()", "main()", "run()", "init()"], answer: "main()" },
    { question: "Which keyword is used to inherit a class in Java?", options: ["extends", "implements", "inherits", "instanceof"], answer: "extends" }
  ]
};

function startQuiz() {
  const nameInput = document.getElementById("username");
  const domainSelect = document.getElementById("domain");

  userName = nameInput.value.trim();
  selectedDomain = domainSelect.value;

  if (userName === "" || !selectedDomain) {
    alert("Please enter your name and select a domain.");
    return;
  }

  document.getElementById("intro-section").style.display = "none";
  document.getElementById("quiz-section").style.display = "block";

  currentQuestionIndex = 0;
  score = 0;
  showQuestion();
}

function showQuestion() {
  const questionData = quizData[selectedDomain][currentQuestionIndex];
  const questionEl = document.getElementById("question");
  const optionsEl = document.getElementById("options");
  const feedbackEl = document.getElementById("feedback");

  feedbackEl.textContent = "";
  questionEl.textContent = questionData.question;
  optionsEl.innerHTML = "";

  questionData.options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.onclick = () => checkAnswer(option);
    optionsEl.appendChild(btn);
  });
}

function checkAnswer(selected) {
  const correctAnswer = quizData[selectedDomain][currentQuestionIndex].answer;
  const feedbackEl = document.getElementById("feedback");

  if (selected === correctAnswer) {
    feedbackEl.textContent = "✅ Correct!";
    score++;
  } else {
    feedbackEl.textContent = `❌ Wrong! Correct answer: ${correctAnswer}`;
  }

  currentQuestionIndex++;

  setTimeout(() => {
    if (currentQuestionIndex < quizData[selectedDomain].length) {
      showQuestion();
    } else {
      showResult();
    }
  }, 1000);
}

function showResult() {
  const questionEl = document.getElementById("question");
  const optionsEl = document.getElementById("options");
  const feedbackEl = document.getElementById("feedback");
  const scoreEl = document.getElementById("score");

  const totalQuestions = quizData[selectedDomain].length;
  const scorePercent = Math.round((score / totalQuestions) * 100);

  questionEl.textContent = `🎉 Quiz Completed!`;
  optionsEl.innerHTML = "";
  feedbackEl.textContent = "";
  scoreEl.innerHTML = `${userName}, your score is ${score}/${totalQuestions} (${scorePercent}%)`;

  if (scorePercent >= 60) {
    generateCertificate(userName, selectedDomain, scorePercent);
  } else {
    scoreEl.innerHTML += "<br>❌ You did not pass. Try again to earn a certificate.";
  }
}
function generateCertificate(name, role, scorePercent) {
  fetch('/generate_certificate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, role, score: scorePercent })
  })
  .then(response => {
    if (!response.ok) throw new Error('Certificate generation failed');
    return response.blob();
  })
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_')}_${role}_certificate.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  })
  .catch(error => {
    console.error('Error generating certificate:', error);
    alert('Certificate generation failed.');
  });
}

