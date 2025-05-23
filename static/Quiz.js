let currentQuestionIndex = 0;
let score = 0;
let selectedDomain = "";
let userName = "";

const quizData = {
  javascript: [
    { question: "Which keyword declares a block-scoped variable?", options: ["var", "let", "const", "define"], answer: "let" },
    { question: "Which method converts JSON string to object?", options: ["JSON.stringify()", "JSON.parse()", "JSON.objectify()", "JSON.convert()"], answer: "JSON.parse()" },
    { question: "What is the output of typeof NaN?", options: ["number", "NaN", "undefined", "object"], answer: "number" },
    { question: "How do you write a comment in JavaScript?", options: ["//", "/* */", "#", "<!-- -->"], answer: "//" },
    { question: "Which symbol is used for template literals?", options: ["''", '""', "``", "()"], answer: "``" },
    { question: "What does '===' mean?", options: ["Assign", "Equal value and type", "Equal value only", "Not equal"], answer: "Equal value and type" },
    { question: "Which method adds an element at the end of an array?", options: ["push()", "pop()", "shift()", "unshift()"], answer: "push()" },
    { question: "What is a closure?", options: ["A function bundled with its scope", "A type of loop", "A conditional", "An error"], answer: "A function bundled with its scope" },
    { question: "Which event triggers when a user clicks a button?", options: ["onclick", "onmouseover", "onchange", "onsubmit"], answer: "onclick" },
    { question: "What is the default scope of variables declared with var?", options: ["Block", "Global", "Function", "Module"], answer: "Function" }
  ],

  python: [
    { question: "How to define a function in Python?", options: ["function", "def", "lambda", "fun"], answer: "def" },
    { question: "What is the output of print(3 * 'hi')?", options: ["hihihi", "hi3", "error", "3hi"], answer: "hihihi" },
    { question: "Which data type is mutable?", options: ["tuple", "list", "string", "int"], answer: "list" },
    { question: "What does 'len' function do?", options: ["Length", "Lowercase", "Largest", "List"], answer: "Length" },
    { question: "Which keyword is used for exception handling?", options: ["catch", "try", "except", "handle"], answer: "except" },
    { question: "How do you start a comment?", options: ["#", "//", "/*", "--"], answer: "#" },
    { question: "What is list comprehension?", options: ["Loop inside list", "Filtering list", "Creating list with loop", "Deleting list"], answer: "Creating list with loop" },
    { question: "Which module is used for regular expressions?", options: ["regex", "re", "regexp", "express"], answer: "re" },
    { question: "How to open a file in read mode?", options: ['open("file.txt", "r")', 'open("file.txt", "w")', 'open("file.txt")', 'open("file.txt", "a")'], answer: 'open("file.txt", "r")' },
    { question: "What does 'pass' do?", options: ["Ends loop", "Placeholder statement", "Raises error", "Returns value"], answer: "Placeholder statement" }
  ],

  java: [
    { question: "Entry point method in Java?", options: ["start()", "main()", "run()", "init()"], answer: "main()" },
    { question: "Keyword to inherit a class?", options: ["extends", "implements", "inherits", "instanceof"], answer: "extends" },
    { question: "JVM stands for?", options: ["Java Variable Method", "Java Virtual Machine", "Java Visual Model", "Java Verified Method"], answer: "Java Virtual Machine" },
    { question: "Keyword for constant?", options: ["constant", "final", "static", "const"], answer: "final" },
    { question: "Which collection is ordered and allows duplicates?", options: ["Set", "Map", "List", "Queue"], answer: "List" },
    { question: "How to create an object?", options: ["new Object()", "Object.create()", "new Class()", "Class()"], answer: "new Class()" },
    { question: "Which package is used for input-output operations?", options: ["java.io", "java.net", "java.util", "java.sql"], answer: "java.io" },
    { question: "What is method overloading?", options: ["Same method name, different parameters", "Same method name, different class", "Same method body, different class", "Multiple inheritance"], answer: "Same method name, different parameters" },
    { question: "Which keyword handles exceptions?", options: ["try", "catch", "throw", "All of the above"], answer: "All of the above" },
    { question: "Which type is used to store fractional numbers?", options: ["int", "float", "boolean", "char"], answer: "float" }
  ],

  devops: [
    { question: "Purpose of CI/CD?", options: ["Code Integration", "Continuous Integration and Deployment", "Code Inspection", "Code Inheritance"], answer: "Continuous Integration and Deployment" },
    { question: "Popular containerization tool?", options: ["Docker", "Jenkins", "Git", "Ansible"], answer: "Docker" },
    { question: "IaC stands for?", options: ["Infrastructure as Code", "Integration as Code", "Interface as Container", "Infrastructure and Code"], answer: "Infrastructure as Code" },
    { question: "AWS service for infrastructure provisioning?", options: ["EC2", "S3", "CloudFormation", "Lambda"], answer: "CloudFormation" },
    { question: "What is Jenkins used for?", options: ["Build Automation", "Cloud Storage", "Code Repository", "Container Management"], answer: "Build Automation" },
    { question: "Git is used for?", options: ["Version Control", "Build", "Testing", "Deployment"], answer: "Version Control" },
    { question: "Which tool is used for configuration management?", options: ["Ansible", "Git", "Docker", "Kubernetes"], answer: "Ansible" },
    { question: "Which is an orchestration tool?", options: ["Kubernetes", "Docker", "Git", "Terraform"], answer: "Kubernetes" },
    { question: "What is a rollback in deployment?", options: ["Revert to previous version", "Deploy new version", "Start build", "Stop server"], answer: "Revert to previous version" },
    { question: "Which protocol is commonly used for secure file transfer?", options: ["FTP", "SFTP", "HTTP", "SMTP"], answer: "SFTP" }
  ],

  data_science: [
    { question: "Library for data manipulation in Python?", options: ["NumPy", "Pandas", "Matplotlib", "Seaborn"], answer: "Pandas" },
    { question: "Overfitting means?", options: ["Model fits training data too well", "Model generalizes well", "Model underperforms", "Model is too simple"], answer: "Model fits training data too well" },
    { question: "Classification algorithm?", options: ["Linear Regression", "K-Nearest Neighbors", "PCA", "K-Means"], answer: "K-Nearest Neighbors" },
    { question: "EDA stands for?", options: ["Exploratory Data Analysis", "Estimated Data Accuracy", "Electronic Data Access", "Efficient Data Allocation"], answer: "Exploratory Data Analysis" },
    { question: "Which plot is used to show data distribution?", options: ["Histogram", "Pie chart", "Line chart", "Scatter plot"], answer: "Histogram" },
    { question: "What is the target variable in ML?", options: ["Input", "Output", "Parameter", "Feature"], answer: "Output" },
    { question: "Supervised learning requires?", options: ["Labeled data", "Unlabeled data", "No data", "Random data"], answer: "Labeled data" },
    { question: "Which algorithm is unsupervised?", options: ["Linear Regression", "K-Means", "Decision Trees", "Random Forest"], answer: "K-Means" },
    { question: "Which Python library is used for plotting?", options: ["TensorFlow", "Matplotlib", "Scikit-learn", "Keras"], answer: "Matplotlib" },
    { question: "What is a feature?", options: ["Input variable", "Output variable", "Model", "Algorithm"], answer: "Input variable" }
  ],

  sql: [
    { question: "Retrieve data from table?", options: ["SELECT", "INSERT", "UPDATE", "DELETE"], answer: "SELECT" },
    { question: "Remove table from DB?", options: ["DROP", "DELETE", "REMOVE", "CLEAR"], answer: "DROP" },
    { question: "JOIN keyword?", options: ["Combine rows from tables", "Delete rows", "Filter rows", "Create new table"], answer: "Combine rows from tables" },
    { question: "Sort query results?", options: ["ORDER BY", "GROUP BY", "SORT", "FILTER"], answer: "ORDER BY" },
    { question: "Which is aggregate function?", options: ["COUNT()", "WHERE", "GROUP BY", "JOIN"], answer: "COUNT()" },
    { question: "Command to change data?", options: ["UPDATE", "ALTER", "INSERT", "DELETE"], answer: "UPDATE" },
    { question: "Primary key must be?", options: ["Unique", "Null", "Duplicate", "Index"], answer: "Unique" },
    { question: "What is a foreign key?", options: ["Unique key", "References primary key", "Duplicate key", "Index"], answer: "References primary key" },
    { question: "Command to add a new row?", options: ["INSERT", "UPDATE", "ALTER", "CREATE"], answer: "INSERT" },
    { question: "Which command groups rows?", options: ["GROUP BY", "ORDER BY", "JOIN", "WHERE"], answer: "GROUP BY" }
  ],

  cloud_computing: [
    { question: "What is SaaS?", options: ["Software as a Service", "Storage as a Service", "Security as a Service", "Server as a Service"], answer: "Software as a Service" },
    { question: "Which cloud provider uses EC2?", options: ["AWS", "Azure", "Google Cloud", "IBM Cloud"], answer: "AWS" },
    { question: "What is elasticity?", options: ["Scale resources up/down automatically", "Data backup", "Security feature", "Cost management"], answer: "Scale resources up/down automatically" },
    { question: "What does IaaS stand for?", options: ["Infrastructure as a Service", "Integration as a Service", "Internet as a Service", "Interface as a Service"], answer: "Infrastructure as a Service" },
    { question: "What is a region in cloud?", options: ["Physical location of data centers", "Virtual machine", "Storage bucket", "Network zone"], answer: "Physical location of data centers" },
    { question: "Which is an example of PaaS?", options: ["Heroku", "EC2", "S3", "CloudFront"], answer: "Heroku" },
    { question: "What is multi-tenancy?", options: ["Multiple users share resources", "Single user per server", "Multiple VMs on a server", "Multiple servers"], answer: "Multiple users share resources" },
    { question: "What is serverless computing?", options: ["Run code without managing servers", "No servers used", "Dedicated server per user", "Cloud storage"], answer: "Run code without managing servers" },
    { question: "What does CDN stand for?", options: ["Content Delivery Network", "Cloud Data Node", "Centralized Data Network", "Content Data Node"], answer: "Content Delivery Network" },
    { question: "Which service is object storage?", options: ["AWS S3", "AWS EC2", "AWS Lambda", "AWS RDS"], answer: "AWS S3" }
  ],

  cybersecurity: [
    { question: "What is phishing?", options: ["Fake emails to steal data", "Network attack", "Data backup", "Password manager"], answer: "Fake emails to steal data" },
    { question: "Which is a strong password?", options: ["Password123", "Qwerty", "P@ssw0rd!", "123456"], answer: "P@ssw0rd!" },
    { question: "What does SSL stand for?", options: ["Secure Sockets Layer", "Secure Software Link", "Safe Socket Layer", "Security Socket Link"], answer: "Secure Sockets Layer" },
    { question: "Two-factor authentication means?", options: ["Two passwords", "Password + another verification", "Password only", "Username + password"], answer: "Password + another verification" },
    { question: "What is a firewall?", options: ["Network security system", "Virus", "Software update", "Encryption"], answer: "Network security system" },
    { question: "What is malware?", options: ["Malicious software", "Hardware issue", "Network protocol", "Software update"], answer: "Malicious software" },
    { question: "Which is a common encryption algorithm?", options: ["AES", "HTTP", "FTP", "IP"], answer: "AES" },
    { question: "What is social engineering?", options: ["Manipulating people to give info", "Software hacking", "Hardware hacking", "Network attack"], answer: "Manipulating people to give info" },
    { question: "What is a VPN?", options: ["Virtual Private Network", "Virus Protection Network", "Verified Private Network", "Virtual Protocol Network"], answer: "Virtual Private Network" },
    { question: "Which is used for secure communication?", options: ["HTTPS", "HTTP", "FTP", "SMTP"], answer: "HTTPS" }
  ],

  frontend: [
    { question: "Which language is used for styling web pages?", options: ["HTML", "CSS", "JavaScript", "Python"], answer: "CSS" },
    { question: "Which HTML tag is used to include JavaScript?", options: ["<js>", "<script>", "<javascript>", "<code>"], answer: "<script>" },
    { question: "Which CSS property changes text color?", options: ["background-color", "color", "font-style", "text-color"], answer: "color" },
    { question: "What does DOM stand for?", options: ["Document Object Model", "Data Object Model", "Document Order Model", "Data Order Model"], answer: "Document Object Model" },
    { question: "Which tool is used for version control?", options: ["Git", "Docker", "Jenkins", "Webpack"], answer: "Git" },
    { question: "Which framework is used for building UI?", options: ["React", "Django", "Flask", "Laravel"], answer: "React" },
    { question: "How do you select an element with class 'header' in CSS?", options: [".header", "#header", "*header", "header"], answer: ".header" },
    { question: "What does 'responsive design' mean?", options: ["Design adapts to screen size", "Only works on mobile", "Only works on desktop", "Requires fixed screen size"], answer: "Design adapts to screen size" },
    { question: "Which CSS unit is relative to the font size?", options: ["px", "em", "%", "vh"], answer: "em" },
    { question: "What is a CSS Flexbox?", options: ["Layout module for flexible boxes", "Animation tool", "Color tool", "Image slider"], answer: "Layout module for flexible boxes" }
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

