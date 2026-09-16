import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import {
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Award,
  Sparkles,
  Bot,
  BarChart3,
  Layers,
  BookOpen,
  HelpCircle,
  Info,
  ChevronRight,
  Check
} from 'lucide-react';

// =============================================================================
// QUIZ DATA DEFINITION (10 B.Tech-Level Questions per Subject)
// =============================================================================
const QUIZZES_DATA = {
  ds: {
    id: "ds",
    title: "Data Structures",
    subjectCode: "CS301",
    topic: "Linked Lists & Trees",
    questionsCount: 10,
    difficulty: "Intermediate",
    timeLimitSeconds: 600, // 10 minutes
    estimatedTime: "10 min",
    badgeColor: "#4f46e5",
    badgeBg: "#eef2ff",
    recommendedRevision: "Trees and Binary Search",
    recommendedDesc: "Based on your quiz performance, reviewing tree traversals and binary search algorithms can strengthen your understanding.",
    questions: [
      {
        id: 1,
        question: "Which data structure follows the LIFO (Last-In, First-Out) principle?",
        options: ["Queue", "Stack", "Linked List", "Tree"],
        correctIndex: 1,
        explanation: "A Stack operates on the LIFO principle where the last inserted element is the first one removed."
      },
      {
        id: 2,
        question: "What is the time complexity to access an element by its index in an Array?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        correctIndex: 0,
        explanation: "Arrays offer constant time O(1) random access because elements are stored in contiguous memory addresses calculated using the base address."
      },
      {
        id: 3,
        question: "Which data structure uses pointers to connect non-contiguous memory nodes?",
        options: ["Array", "Linked List", "Stack (Array Implementation)", "Binary Heap"],
        correctIndex: 1,
        explanation: "A Linked List stores elements in dynamically allocated nodes linked via pointer references."
      },
      {
        id: 4,
        question: "In a standard FIFO Queue, where are new elements always inserted?",
        options: ["At the Front", "At the Rear", "At the Middle", "At Random Positions"],
        correctIndex: 1,
        explanation: "In a Queue (FIFO), new elements are enqueued at the Rear and dequeued from the Front."
      },
      {
        id: 5,
        question: "What is the maximum number of children any node can have in a Binary Tree?",
        options: ["1", "2", "3", "Unlimited"],
        correctIndex: 1,
        explanation: "By definition, each node in a binary tree has at most two children, typically referred to as the left and right child."
      },
      {
        id: 6,
        question: "Which searching algorithm requires the input array to be sorted beforehand?",
        options: ["Linear Search", "Binary Search", "Breadth-First Search", "Depth-First Search"],
        correctIndex: 1,
        explanation: "Binary Search requires sorted elements to repeatedly divide the search interval in half with O(log n) time complexity."
      },
      {
        id: 7,
        question: "What is the average time complexity of the Quick Sort algorithm?",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
        correctIndex: 1,
        explanation: "Quick Sort has an average-case time complexity of O(n log n) using divide-and-conquer partitioning."
      },
      {
        id: 8,
        question: "In a Doubly Linked List, what reference pointers does each node maintain?",
        options: [
          "Only Next pointer",
          "Only Previous pointer",
          "Both Previous and Next pointers",
          "Parent and Child pointers"
        ],
        correctIndex: 2,
        explanation: "Each node in a doubly linked list contains two pointers: one referencing the previous node and one referencing the next node."
      },
      {
        id: 9,
        question: "Which tree traversal algorithm visits nodes in the order: Left Subtree → Root → Right Subtree?",
        options: [
          "Preorder Traversal",
          "Inorder Traversal",
          "Postorder Traversal",
          "Level Order Traversal"
        ],
        correctIndex: 1,
        explanation: "Inorder traversal processes the left subtree, then the root node, and finally the right subtree. In a BST, it produces sorted order."
      },
      {
        id: 10,
        question: "Which sorting algorithm repeatedly finds the minimum element from the unsorted part and places it at the beginning?",
        options: ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"],
        correctIndex: 1,
        explanation: "Selection Sort divides the list into sorted and unsorted subarrays, finding the minimum from unsorted and swapping it to the front."
      }
    ]
  },
  dbms: {
    id: "dbms",
    title: "Database Management",
    subjectCode: "CS303",
    topic: "SQL & Normalization",
    questionsCount: 10,
    difficulty: "Intermediate",
    timeLimitSeconds: 600,
    estimatedTime: "10 min",
    badgeColor: "#7c3aed",
    badgeBg: "#f5f3ff",
    recommendedRevision: "DBMS Normal Forms (2NF & 3NF)",
    recommendedDesc: "Review functional dependencies and lossless decomposition to ace relational database exams.",
    questions: [
      {
        id: 1,
        question: "What is the main purpose of Database Normalization?",
        options: [
          "To increase data redundancy",
          "To minimize redundancy and prevent insertion/deletion anomalies",
          "To format query outputs",
          "To encrypt sensitive passwords"
        ],
        correctIndex: 1,
        explanation: "Normalization organizes tables to reduce data duplication and prevent anomalies."
      },
      {
        id: 2,
        question: "Which SQL command is used to remove all rows from a table without logging individual row deletions?",
        options: ["DELETE", "TRUNCATE", "DROP", "REMOVE"],
        correctIndex: 1,
        explanation: "TRUNCATE TABLE is a DDL operation that quickly resets the table and deallocates data pages."
      },
      {
        id: 3,
        question: "A relation is in First Normal Form (1NF) if and only if:",
        options: [
          "Every determinant is a candidate key",
          "All attribute values are atomic with no repeating groups",
          "There are no transitive dependencies",
          "All foreign keys are indexed"
        ],
        correctIndex: 1,
        explanation: "1NF requires that each column contains atomic (indivisible) values and each row is unique."
      },
      {
        id: 4,
        question: "Which of the following is NOT part of the ACID properties of a database transaction?",
        options: ["Atomicity", "Consistency", "Integrity", "Durability"],
        correctIndex: 2,
        explanation: "The ACID properties are Atomicity, Consistency, Isolation, and Durability."
      },
      {
        id: 5,
        question: "Which SQL clause is used to filter records resulting from a GROUP BY aggregation?",
        options: ["WHERE", "HAVING", "ORDER BY", "DISTINCT"],
        correctIndex: 1,
        explanation: "HAVING is used to filter aggregated grouped data, whereas WHERE filters individual rows before grouping."
      },
      {
        id: 6,
        question: "What type of key uniquely identifies a row in another referenced table?",
        options: ["Primary Key", "Foreign Key", "Candidate Key", "Super Key"],
        correctIndex: 1,
        explanation: "A Foreign Key enforces referential integrity between child and parent tables."
      },
      {
        id: 7,
        question: "In 2NF, what type of dependency must be eliminated from 1NF relations?",
        options: [
          "Partial dependency on a candidate key",
          "Transitive dependency",
          "Multi-valued dependency",
          "Join dependency"
        ],
        correctIndex: 0,
        explanation: "2NF requires 1NF + no non-prime attribute should be partially dependent on any candidate key."
      },
      {
        id: 8,
        question: "Which SQL JOIN returns all records from the left table and matched records from the right table?",
        options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
        correctIndex: 1,
        explanation: "A LEFT OUTER JOIN returns all rows from the left table with matching data or NULLs from the right table."
      },
      {
        id: 9,
        question: "Which database component maintains a record of all modifications to ensure durability?",
        options: ["Data Dictionary", "Write-Ahead Transaction Log (WAL)", "Query Optimizer", "B-Tree Index"],
        correctIndex: 1,
        explanation: "The transaction log records state changes before applying them to database disk blocks to guarantee Durability."
      },
      {
        id: 10,
        question: "What is the degree of a database relation?",
        options: [
          "Total number of tuples (rows)",
          "Total number of attributes (columns)",
          "Number of primary keys",
          "Number of foreign constraints"
        ],
        correctIndex: 1,
        explanation: "The Degree of a relation is the number of attributes (columns), whereas Cardinality is the number of rows."
      }
    ]
  },
  cn: {
    id: "cn",
    title: "Computer Networks",
    subjectCode: "CS304",
    topic: "Network Fundamentals",
    questionsCount: 10,
    difficulty: "Beginner",
    timeLimitSeconds: 480, // 8 minutes
    estimatedTime: "8 min",
    badgeColor: "#0ea5e9",
    badgeBg: "#f0f9ff",
    recommendedRevision: "TCP/IP & OSI Model Protocols",
    recommendedDesc: "Review layering abstractions and transport protocol headers to master communication networks.",
    questions: [
      {
        id: 1,
        question: "How many layers are defined in the standard ISO-OSI Reference Model?",
        options: ["4 Layers", "5 Layers", "7 Layers", "9 Layers"],
        correctIndex: 2,
        explanation: "The OSI model consists of 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application."
      },
      {
        id: 2,
        question: "Which layer of the OSI model is responsible for end-to-end packet delivery and logical routing?",
        options: ["Data Link Layer", "Network Layer", "Transport Layer", "Physical Layer"],
        correctIndex: 1,
        explanation: "The Network Layer manages IP logical addressing, routing, and packet forwarding across subnets."
      },
      {
        id: 3,
        question: "Which transport layer protocol provides connection-oriented, reliable data transfer?",
        options: ["UDP", "TCP", "ICMP", "IP"],
        correctIndex: 1,
        explanation: "TCP establishes a reliable 3-way handshake with sequence acknowledgments and flow control."
      },
      {
        id: 4,
        question: "What is the standard size of an IPv4 address?",
        options: ["16 bits", "32 bits", "64 bits", "128 bits"],
        correctIndex: 1,
        explanation: "An IPv4 address consists of 32 bits divided into four 8-bit octets (e.g. 192.168.1.1)."
      },
      {
        id: 5,
        question: "Which protocol automatically translates human-readable domain names (e.g., google.com) into IP addresses?",
        options: ["HTTP", "DNS", "DHCP", "FTP"],
        correctIndex: 1,
        explanation: "Domain Name System (DNS) resolves human-friendly hostnames into numeric IP addresses on port 53."
      },
      {
        id: 6,
        question: "What does DHCP stand for in computer networks?",
        options: [
          "Dynamic Host Configuration Protocol",
          "Direct Host Connection Protocol",
          "Data Handling & Control Protocol",
          "Distributed Host Communication Protocol"
        ],
        correctIndex: 0,
        explanation: "DHCP dynamically assigns IP addresses and gateway configurations to client devices joining a network."
      },
      {
        id: 7,
        question: "At which layer of the OSI model do MAC (Physical) addresses operate?",
        options: ["Physical Layer", "Data Link Layer", "Network Layer", "Transport Layer"],
        correctIndex: 1,
        explanation: "MAC addresses (48-bit hardware identifiers) operate at Layer 2 (Data Link Layer)."
      },
      {
        id: 8,
        question: "Which protocol is utilized for sending ping requests and diagnosing network reachability?",
        options: ["SMTP", "ICMP", "ARP", "SNMP"],
        correctIndex: 1,
        explanation: "Internet Control Message Protocol (ICMP) carries diagnostic messages such as Echo Request/Reply used by ping."
      },
      {
        id: 9,
        question: "What is the default port number used by secure HTTPS traffic?",
        options: ["Port 80", "Port 443", "Port 22", "Port 8080"],
        correctIndex: 1,
        explanation: "HTTPS encrypts web traffic using SSL/TLS on standard TCP port 443."
      },
      {
        id: 10,
        question: "Which network topology connects every node directly to a central hub or switch?",
        options: ["Ring Topology", "Star Topology", "Bus Topology", "Mesh Topology"],
        correctIndex: 1,
        explanation: "In a Star topology, all devices link directly to a central switch/hub, preventing individual node failure from taking down the network."
      }
    ]
  }
};

export default function QuizzesPage() {
  const navigate = useNavigate();

  // Mode: 'selection' | 'active' | 'result'
  const [viewMode, setViewMode] = useState('selection');
  const [selectedQuizId, setSelectedQuizId] = useState('ds');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionIndex]: optionIndex }
  const [timeLeft, setTimeLeft] = useState(600);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const activeQuiz = QUIZZES_DATA[selectedQuizId] || QUIZZES_DATA.ds;
  const currentQuestion = activeQuiz.questions[currentQuestionIndex];
  const totalQuestions = activeQuiz.questions.length;

  // Countdown timer effect
  useEffect(() => {
    let interval = null;
    if (viewMode === 'active' && isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && viewMode === 'active') {
      handleSubmitQuiz();
    }
    return () => clearInterval(interval);
  }, [viewMode, isTimerRunning, timeLeft]);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start selected quiz
  const handleStartQuiz = (quizId) => {
    setSelectedQuizId(quizId);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeLeft(QUIZZES_DATA[quizId].timeLimitSeconds);
    setIsTimerRunning(true);
    setViewMode('active');
  };

  // Select an option for current question
  const handleSelectOption = (optionIndex) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Submit and calculate results
  const handleSubmitQuiz = () => {
    setIsTimerRunning(false);
    setViewMode('result');
  };

  // Reset to retry current quiz
  const handleRetryQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeLeft(activeQuiz.timeLimitSeconds);
    setIsTimerRunning(true);
    setViewMode('active');
  };

  // Calculate score & statistics
  const calculateResults = () => {
    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });
    const attemptedCount = Object.keys(userAnswers).length;
    const incorrectCount = attemptedCount - correctCount;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    let feedbackMessage = "Great work! You have a good understanding of this topic. Keep practicing to improve further.";
    if (percentage < 50) {
      feedbackMessage = "Keep practicing! Review the core concepts with EduMind AI to strengthen your exam foundation.";
    } else if (percentage < 80) {
      feedbackMessage = "Good effort! Review the missed topics to turn your strong score into an outstanding one.";
    }

    return { correctCount, incorrectCount, attemptedCount, percentage, feedbackMessage };
  };

  const results = calculateResults();

  return (
    <DashboardLayout>
      <div className="quiz-page-container">
        {/* ===================================================================
            VIEW 1: QUIZ SELECTION
            =================================================================== */}
        {viewMode === 'selection' && (
          <div>
            {/* Header */}
            <div className="ai-page-header" style={{ marginBottom: '2rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                  <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Smart Quiz</h1>
                  <span className="badge badge-primary">
                    <Zap size={13} />
                    <span>Practice Mode</span>
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Test your knowledge and identify areas where you can improve.
                </p>
              </div>

              <div className="prototype-mode-badge">
                <Info size={14} />
                <span>Prototype Quiz: Practice sets for college prep</span>
              </div>
            </div>

            {/* Selection Section */}
            <div className="section-header-compact" style={{ marginBottom: '1.25rem' }}>
              <h3>Choose a Quiz</h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>3 Active Subject Modules</span>
            </div>

            <div className="quiz-selection-grid">
              {Object.values(QUIZZES_DATA).map((quiz) => (
                <div key={quiz.id} className="quiz-select-card">
                  <div className="quiz-select-top">
                    <div className="quiz-select-header-badge" style={{ backgroundColor: quiz.badgeBg, color: quiz.badgeColor }}>
                      <Zap size={16} />
                      <span>{quiz.subjectCode}</span>
                    </div>
                    <span className="quiz-difficulty-tag">{quiz.difficulty}</span>
                  </div>

                  <h3 className="quiz-select-title">{quiz.title}</h3>
                  <p className="quiz-select-topic">Topic: <strong>{quiz.topic}</strong></p>

                  <div className="quiz-select-meta-row">
                    <span className="quiz-meta-item">
                      <CheckCircle2 size={14} color="#10b981" />
                      <span>{quiz.questionsCount} Questions</span>
                    </span>
                    <span className="quiz-meta-item">
                      <Clock size={14} color="#64748b" />
                      <span>{quiz.estimatedTime}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleStartQuiz(quiz.id)}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}
                  >
                    <PlayCircle size={16} />
                    <span>Start Quiz</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            VIEW 2: ACTIVE QUIZ INTERFACE
            =================================================================== */}
        {viewMode === 'active' && (
          <div className="active-quiz-wrapper">
            {/* Quiz Top Bar */}
            <div className="active-quiz-header-card">
              <div className="quiz-header-left">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{activeQuiz.title} Quiz</h2>
                  <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                    {activeQuiz.subjectCode}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Question <strong>{currentQuestionIndex + 1}</strong> of <strong>{totalQuestions}</strong>
                </p>
              </div>

              <div className="quiz-header-right">
                {/* Countdown Timer */}
                <div className="quiz-timer-box" style={{ borderColor: timeLeft < 120 ? '#ef4444' : 'var(--border-light)', color: timeLeft < 120 ? '#ef4444' : 'var(--text-main)' }}>
                  <Clock size={16} color={timeLeft < 120 ? '#ef4444' : 'var(--primary)'} />
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.98rem' }}>
                    {formatTime(timeLeft)}
                  </span>
                </div>

                <button
                  onClick={() => setViewMode('selection')}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.4rem 0.75rem' }}
                >
                  Exit
                </button>
              </div>
            </div>

            {/* Linear Progress Bar */}
            <div className="progress-container" style={{ margin: '1rem 0 1.5rem' }}>
              <div className="progress-track" style={{ height: 6 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                    backgroundColor: 'var(--primary)'
                  }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="quiz-question-card">
              <div className="question-number-pill">
                Question {currentQuestionIndex + 1}
              </div>

              <h3 className="question-text-title">
                {currentQuestion.question}
              </h3>

              {/* Options List */}
              <div className="quiz-options-list">
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = userAnswers[currentQuestionIndex] === optIdx;
                  const optionLetters = ["A", "B", "C", "D"];

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      className={`quiz-option-btn ${isSelected ? 'option-selected' : ''}`}
                    >
                      <div className={`option-letter-badge ${isSelected ? 'badge-selected' : ''}`}>
                        {optionLetters[optIdx]}
                      </div>
                      <span className="option-label-text">{option}</span>
                      {isSelected && (
                        <div className="option-check-icon">
                          <Check size={16} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Controls */}
              <div className="quiz-controls-bar">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className="btn btn-secondary"
                  style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
                >
                  <ArrowLeft size={16} />
                  <span>Previous</span>
                </button>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button onClick={handleNext} className="btn btn-primary">
                      <span>Next</span>
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      className="btn btn-primary"
                      style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Submit Quiz</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            VIEW 3: RESULT SCREEN & ANSWER REVIEW
            =================================================================== */}
        {viewMode === 'result' && (
          <div className="quiz-result-container">
            {/* Score Overview Card */}
            <div className="quiz-result-hero-card">
              <div className="result-hero-top">
                <div className="result-trophy-icon">
                  <Award size={32} />
                </div>
                <h2>Quiz Completed! 🎉</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                  {activeQuiz.title} — Topic Mastery Assessment
                </p>
              </div>

              <div className="result-score-highlight">
                <div className="score-circle">
                  <span className="score-num">{results.percentage}%</span>
                  <span className="score-sub">{results.correctCount} / {totalQuestions} Correct</span>
                </div>
              </div>

              <div className="result-stats-strip">
                <div className="result-stat-col">
                  <span className="res-stat-val" style={{ color: '#10b981' }}>{results.correctCount}</span>
                  <span className="res-stat-lbl">Correct Answers</span>
                </div>
                <div className="result-stat-col">
                  <span className="res-stat-val" style={{ color: '#ef4444' }}>{results.incorrectCount}</span>
                  <span className="res-stat-lbl">Incorrect Answers</span>
                </div>
                <div className="result-stat-col">
                  <span className="res-stat-val" style={{ color: 'var(--primary)' }}>{results.attemptedCount}</span>
                  <span className="res-stat-lbl">Questions Attempted</span>
                </div>
              </div>

              <div className="result-feedback-box">
                <p>{results.feedbackMessage}</p>
              </div>

              <div className="result-actions-group">
                <button onClick={handleRetryQuiz} className="btn btn-outline">
                  <RotateCcw size={16} />
                  <span>Retry Quiz</span>
                </button>
                <button onClick={() => setViewMode('selection')} className="btn btn-secondary">
                  <span>Back to Quizzes</span>
                </button>
                <button onClick={() => navigate('/progress')} className="btn btn-primary">
                  <BarChart3 size={16} />
                  <span>View Progress</span>
                </button>
              </div>
            </div>

            {/* Answer Review Section */}
            <div className="answer-review-section">
              <div className="section-header-compact" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <h3>Review Answers</h3>
                  <p>Detailed breakdown of questions and explanations</p>
                </div>
              </div>

              <div className="review-cards-list">
                {activeQuiz.questions.map((q, idx) => {
                  const userSelection = userAnswers[idx];
                  const isCorrect = userSelection === q.correctIndex;
                  const optionLetters = ["A", "B", "C", "D"];

                  return (
                    <div key={q.id} className="review-item-card">
                      <div className="review-item-header">
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          Question {idx + 1}
                        </span>
                        {isCorrect ? (
                          <span className="badge badge-success">
                            <CheckCircle2 size={13} />
                            <span>Correct</span>
                          </span>
                        ) : (
                          <span className="badge" style={{ backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>
                            <XCircle size={13} />
                            <span>Incorrect</span>
                          </span>
                        )}
                      </div>

                      <h4 className="review-question-text">{q.question}</h4>

                      <div className="review-answers-comparison">
                        <div className="answer-box">
                          <span className="ans-label">Your Answer:</span>
                          <span className={`ans-val ${isCorrect ? 'ans-correct-text' : 'ans-incorrect-text'}`}>
                            {userSelection !== undefined ? (
                              `${optionLetters[userSelection]}) ${q.options[userSelection]}`
                            ) : (
                              'Not Attempted'
                            )}
                          </span>
                        </div>

                        {!isCorrect && (
                          <div className="answer-box">
                            <span className="ans-label">Correct Answer:</span>
                            <span className="ans-val ans-correct-text">
                              {optionLetters[q.correctIndex]}) {q.options[q.correctIndex]}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="review-explanation-box">
                        <p><strong>💡 Explanation:</strong> {q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommended Next Step */}
            <div className="quiz-recommended-card">
              <div className="rec-left">
                <div className="brand-icon" style={{ width: 40, height: 40 }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Recommended Next Step
                  </span>
                  <h4>Revise: {activeQuiz.recommendedRevision}</h4>
                  <p>{activeQuiz.recommendedDesc}</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/assistant')}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.4rem' }}
              >
                <Bot size={17} />
                <span>Ask EduMind AI</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
