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
  BookOpen,
  HelpCircle,
  Info,
  ChevronRight,
  Check,
  History,
  AlertTriangle,
  Loader2,
  Calendar,
  Layers,
  FileQuestion
} from 'lucide-react';
import QuizGeneratorSection from '../components/QuizGeneratorSection';
import {
  startQuizAttempt,
  submitQuizAttempt,
  getAttemptResult,
  getAttemptHistory
} from '../services/api';

// =============================================================================
// PHASE 1 CURRICULUM MODULES (Preserved for curriculum practice sets)
// =============================================================================
const QUIZZES_DATA = {
  ds: {
    id: "ds",
    title: "Data Structures",
    subjectCode: "CS301",
    topic: "Linked Lists & Trees",
    questionsCount: 10,
    difficulty: "Intermediate",
    timeLimitSeconds: 600,
    estimatedTime: "10 min",
    badgeColor: "#4f46e5",
    badgeBg: "#eef2ff",
    recommendedRevision: "Trees and Binary Search",
    recommendedDesc: "Reviewing tree traversals and binary search algorithms can strengthen your understanding.",
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
    timeLimitSeconds: 480,
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

  // Navigation mode: 'selection' | 'active' | 'result'
  const [viewMode, setViewMode] = useState('selection');
  // Tabs: 'generator' | 'history' | 'modules'
  const [quizTab, setQuizTab] = useState('generator');

  // Active attempt state
  const [activeAttempt, setActiveAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionId]: optionIndex }
  const [timeLeft, setTimeLeft] = useState(600);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [attemptStartTime, setAttemptStartTime] = useState(null);

  // Submission & evaluation states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);

  // Attempt history state
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  // Countdown timer effect
  useEffect(() => {
    let interval = null;
    if (viewMode === 'active' && isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && viewMode === 'active' && isTimerRunning) {
      // Auto-submit when time expires
      executeSubmission();
    }
    return () => clearInterval(interval);
  }, [viewMode, isTimerRunning, timeLeft]);

  // Load history when tab is clicked
  useEffect(() => {
    if (quizTab === 'history') {
      loadHistory();
    }
  }, [quizTab]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    setHistoryError(null);
    const res = await getAttemptHistory();
    setLoadingHistory(false);
    if (res.success && Array.isArray(res.data)) {
      setHistoryList(res.data);
    } else {
      setHistoryError(res.error || 'Failed to load attempt history.');
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ===========================================================================
  // START QUIZ ATTEMPT (SERVER-SIDE WITH PROTECTED ANSWERS)
  // ===========================================================================
  const handleStartBackendQuiz = async (quizId) => {
    setSubmitError(null);
    setIsSubmitting(true);

    const res = await startQuizAttempt(quizId);
    setIsSubmitting(false);

    if (res.success && res.data) {
      const data = res.data;
      setActiveAttempt({
        attemptId: data.attempt_id,
        quizId: data.quiz_id,
        quizTitle: data.quiz_title,
        subjectCode: data.subject_code,
        topic: data.topic,
        totalQuestions: data.total_questions,
        timeLimitSeconds: data.time_limit_seconds || 600,
        questions: data.questions, // ActiveQuizQuestion list (answers and explanations hidden)
        isModuleMock: false
      });
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setTimeLeft(data.time_limit_seconds || 600);
      setAttemptStartTime(Date.now());
      setIsTimerRunning(true);
      setShowConfirmModal(false);
      setEvaluationResult(null);
      setViewMode('active');
    } else {
      alert(`Could not start quiz: ${res.error || 'Unknown server error.'}`);
    }
  };

  // Start standard module quiz (Phase 1 prototype fallback)
  const handleStartModuleQuiz = (moduleId) => {
    const mod = QUIZZES_DATA[moduleId] || QUIZZES_DATA.ds;
    setActiveAttempt({
      attemptId: `mock-${moduleId}`,
      quizId: moduleId,
      quizTitle: mod.title,
      subjectCode: mod.subjectCode,
      topic: mod.topic,
      totalQuestions: mod.questions.length,
      timeLimitSeconds: mod.timeLimitSeconds,
      questions: mod.questions.map((q, idx) => ({
        id: q.id || idx + 1,
        question_text: q.question,
        options: q.options,
        difficulty: mod.difficulty,
        order_num: idx + 1
      })),
      isModuleMock: true,
      originalMockData: mod
    });
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeLeft(mod.timeLimitSeconds);
    setAttemptStartTime(Date.now());
    setIsTimerRunning(true);
    setShowConfirmModal(false);
    setEvaluationResult(null);
    setViewMode('active');
  };

  // Select an option for current question
  const handleSelectOption = (optionIndex) => {
    if (!activeAttempt || isSubmitting) return;
    const currentQ = activeAttempt.questions[currentQuestionIndex];
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex
    }));
  };

  // Navigation handlers
  const handleNext = () => {
    if (activeAttempt && currentQuestionIndex < activeAttempt.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleJumpToQuestion = (index) => {
    if (activeAttempt && index >= 0 && index < activeAttempt.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  // Answered counts
  const totalQuestionsCount = activeAttempt ? activeAttempt.questions.length : 0;
  const answeredCount = activeAttempt
    ? activeAttempt.questions.filter((q) => userAnswers[q.id] !== undefined).length
    : 0;
  const unansweredCount = totalQuestionsCount - answeredCount;

  // Open confirmation modal before final submission
  const handlePromptSubmit = () => {
    setSubmitError(null);
    setShowConfirmModal(true);
  };

  // ===========================================================================
  // SUBMIT QUIZ ATTEMPT (SERVER-SIDE EVALUATION)
  // ===========================================================================
  const executeSubmission = async () => {
    if (isSubmitting || !activeAttempt) return;
    setIsSubmitting(true);
    setIsTimerRunning(false);
    setSubmitError(null);

    const elapsedSeconds = attemptStartTime
      ? Math.max(1, Math.round((Date.now() - attemptStartTime) / 1000))
      : 60;

    // Standard Module Mock Evaluation (Phase 1)
    if (activeAttempt.isModuleMock) {
      const mock = activeAttempt.originalMockData;
      let correctCount = 0;
      const reviews = mock.questions.map((q, idx) => {
        const selected = userAnswers[q.id !== undefined ? q.id : idx + 1];
        const isCorrect = selected === q.correctIndex;
        if (isCorrect) correctCount++;
        return {
          question_id: q.id || idx + 1,
          question_text: q.question,
          options: q.options,
          selected_index: selected !== undefined ? selected : null,
          correct_index: q.correctIndex,
          is_correct: isCorrect,
          explanation: q.explanation,
          topic_tag: mock.topic
        };
      });

      const total = mock.questions.length;
      const attempted = Object.keys(userAnswers).length;
      const unanswered = total - attempted;
      const incorrect = total - correctCount - unanswered;
      const percentage = Math.round((correctCount / total) * 100);

      setEvaluationResult({
        attempt_id: 0,
        quiz_id: 0,
        quiz_title: mock.title,
        subject_code: mock.subjectCode,
        topic: mock.topic,
        status: 'completed',
        started_at: new Date(attemptStartTime).toISOString(),
        completed_at: new Date().toISOString(),
        total_questions: total,
        attempted_count: attempted,
        correct_count: correctCount,
        incorrect_count: incorrect,
        unanswered_count: unanswered,
        score_percentage: percentage,
        time_taken_seconds: elapsedSeconds,
        feedback_summary: percentage >= 75
          ? 'Great performance on curriculum practice questions!'
          : 'Keep practicing curriculum concepts with EduMind AI.',
        question_reviews: reviews
      });

      setShowConfirmModal(false);
      setIsSubmitting(false);
      setViewMode('result');
      return;
    }

    // Server-Side Evaluation for Real Quizzes (Phase 2 Step 4)
    const responsesPayload = activeAttempt.questions.map((q) => ({
      question_id: q.id,
      selected_index: userAnswers[q.id] !== undefined ? userAnswers[q.id] : null
    }));

    const submissionData = {
      responses: responsesPayload,
      time_taken_seconds: elapsedSeconds
    };

    const res = await submitQuizAttempt(activeAttempt.attemptId, submissionData);
    setIsSubmitting(false);

    if (res.success && res.data) {
      setEvaluationResult(res.data);
      setShowConfirmModal(false);
      setViewMode('result');
      // Silently refresh history in background
      loadHistory();
    } else {
      setSubmitError(res.error || 'Server submission failed. Please try again.');
    }
  };

  // View past attempt result from history
  const handleViewPastAttempt = async (attemptId) => {
    setLoadingHistory(true);
    const res = await getAttemptResult(attemptId);
    setLoadingHistory(false);
    if (res.success && res.data) {
      setEvaluationResult(res.data);
      setActiveAttempt({
        attemptId: res.data.attempt_id,
        quizId: res.data.quiz_id,
        quizTitle: res.data.quiz_title,
        subjectCode: res.data.subject_code,
        topic: res.data.topic,
        totalQuestions: res.data.total_questions,
        isModuleMock: false
      });
      setViewMode('result');
    } else {
      alert(`Could not load past result: ${res.error || 'Unknown error'}`);
    }
  };

  // Retry quiz (initiates brand new server-side attempt)
  const handleRetryCurrentQuiz = () => {
    if (activeAttempt && !activeAttempt.isModuleMock && activeAttempt.quizId) {
      handleStartBackendQuiz(activeAttempt.quizId);
    } else if (activeAttempt && activeAttempt.isModuleMock) {
      handleStartModuleQuiz(activeAttempt.quizId);
    } else {
      setViewMode('selection');
    }
  };

  const currentQ = activeAttempt ? activeAttempt.questions[currentQuestionIndex] : null;

  return (
    <DashboardLayout>
      <div className="quiz-page-container">
        {/* ===================================================================
            VIEW 1: QUIZ SELECTION & TABS
            =================================================================== */}
        {viewMode === 'selection' && (
          <div>
            {/* Header */}
            <div className="ai-page-header" style={{ marginBottom: '1.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                  <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Smart Quiz</h1>
                  <span className="badge badge-primary">
                    <Zap size={13} />
                    <span>Step 4: Real Attempts & Evaluation</span>
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Attempt generated quizzes, receive instant server-side scoring, and review question explanations.
                </p>
              </div>

              <div className="prototype-mode-badge">
                <Sparkles size={14} />
                <span>Protected Answers • Server-Side Scoring • Full SQLite Persistence</span>
              </div>
            </div>

            {/* Navigation Tabs (3 Tabs) */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1.75rem',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '0.65rem',
              flexWrap: 'wrap'
            }}>
              <button
                type="button"
                onClick={() => setQuizTab('generator')}
                style={{
                  padding: '0.55rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: quizTab === 'generator' ? 'var(--primary-light)' : 'transparent',
                  color: quizTab === 'generator' ? 'var(--primary)' : 'var(--text-secondary)',
                  border: quizTab === 'generator' ? '1px solid rgba(79, 70, 229, 0.25)' : '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={16} />
                <span>AI Quizzes & Generator</span>
              </button>

              <button
                type="button"
                onClick={() => setQuizTab('history')}
                style={{
                  padding: '0.55rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: quizTab === 'history' ? 'var(--primary-light)' : 'transparent',
                  color: quizTab === 'history' ? 'var(--primary)' : 'var(--text-secondary)',
                  border: quizTab === 'history' ? '1px solid rgba(79, 70, 229, 0.25)' : '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer'
                }}
              >
                <History size={16} />
                <span>Attempt History ({historyList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setQuizTab('modules')}
                style={{
                  padding: '0.55rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: quizTab === 'modules' ? 'var(--primary-light)' : 'transparent',
                  color: quizTab === 'modules' ? 'var(--primary)' : 'var(--text-secondary)',
                  border: quizTab === 'modules' ? '1px solid rgba(79, 70, 229, 0.25)' : '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer'
                }}
              >
                <BookOpen size={16} />
                <span>Standard Practice Modules</span>
              </button>
            </div>

            {/* TAB 1: AI Quizzes & Generator */}
            {quizTab === 'generator' && (
              <QuizGeneratorSection onStartQuiz={handleStartBackendQuiz} />
            )}

            {/* TAB 2: Attempt History */}
            {quizTab === 'history' && (
              <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <History size={18} style={{ color: 'var(--primary)' }} />
                      <span>Saved Attempt History</span>
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                      Verified evaluations and test scores loaded directly from SQLite database.
                    </p>
                  </div>

                  <button
                    onClick={loadHistory}
                    disabled={loadingHistory}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <RotateCcw size={13} className={loadingHistory ? 'spin-anim' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>

                {loadingHistory ? (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Loader2 size={24} className="spin-anim" style={{ margin: '0 auto 0.75rem', display: 'block', color: 'var(--primary)' }} />
                    Loading attempt records...
                  </div>
                ) : historyError ? (
                  <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', color: '#991b1b', fontSize: '0.9rem' }}>
                    {historyError}
                  </div>
                ) : historyList.length === 0 ? (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-light)' }}>
                    <FileQuestion size={32} style={{ color: 'var(--text-light)', margin: '0 auto 0.75rem', display: 'block' }} />
                    <p style={{ fontWeight: 700, margin: '0 0 0.35rem' }}>No Quiz Attempts Found</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
                      You haven't completed any quiz attempts yet. Start an AI assessment to track your performance!
                    </p>
                    <button onClick={() => setQuizTab('generator')} className="btn btn-primary btn-sm">
                      Take Your First Quiz
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {historyList.map((item) => {
                      const pct = Math.round(item.score_percentage);
                      const isHigh = pct >= 75;
                      const isMid = pct >= 50 && pct < 75;

                      const formattedDate = item.started_at
                        ? new Date(item.started_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Recently';

                      return (
                        <div
                          key={item.id}
                          style={{
                            border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1rem 1.25rem',
                            backgroundColor: 'var(--bg-main)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '1rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '220px' }}>
                            <div style={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              backgroundColor: isHigh ? '#ecfdf5' : isMid ? '#eff6ff' : '#fffbeb',
                              border: `2px solid ${isHigh ? '#10b981' : isMid ? '#3b82f6' : '#f59e0b'}`,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <span style={{
                                fontWeight: 800,
                                fontSize: '0.88rem',
                                color: isHigh ? '#065f46' : isMid ? '#1e40af' : '#92400e'
                              }}>
                                {pct}%
                              </span>
                            </div>

                            <div>
                              <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                {item.quiz_title}
                              </h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                <span>{item.subject_code}</span>
                                <span>•</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Calendar size={12} />
                                  {formattedDate}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'center' }}>
                              <span style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                {item.correct_count} / {item.total_questions}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Score</span>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                              <span style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                {formatTime(item.time_taken_seconds || 0)}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Time</span>
                            </div>

                            <button
                              onClick={() => handleViewPastAttempt(item.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem' }}
                            >
                              <span>View Results</span>
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Standard Subject Modules */}
            {quizTab === 'modules' && (
              <div>
                <div className="section-header-compact" style={{ marginBottom: '1.25rem' }}>
                  <h3>Choose a Practice Module</h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>3 Active Curriculum Practice Sets</span>
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
                        onClick={() => handleStartModuleQuiz(quiz.id)}
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
          </div>
        )}

        {/* ===================================================================
            VIEW 2: ACTIVE QUIZ INTERFACE (ANSWERS FULLY PROTECTED)
            =================================================================== */}
        {viewMode === 'active' && activeAttempt && currentQ && (
          <div className="active-quiz-wrapper">
            {/* Quiz Top Bar */}
            <div className="active-quiz-header-card">
              <div className="quiz-header-left">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{activeAttempt.quizTitle}</h2>
                  <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                    {activeAttempt.subjectCode}
                  </span>
                  <span className="badge" style={{ backgroundColor: '#ecfdf5', color: '#065f46', fontSize: '0.72rem', border: '1px solid #a7f3d0' }}>
                    Protected Attempt
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Question <strong>{currentQuestionIndex + 1}</strong> of <strong>{totalQuestionsCount}</strong>
                </p>
              </div>

              <div className="quiz-header-right">
                {/* Answered & Unanswered Tracker Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    <CheckCircle2 size={13} />
                    <span>{answeredCount} Answered</span>
                  </span>

                  <span style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    backgroundColor: unansweredCount > 0 ? '#fffbeb' : '#f8fafc',
                    color: unansweredCount > 0 ? '#b45309' : 'var(--text-muted)',
                    border: `1px solid ${unansweredCount > 0 ? '#fde68a' : 'var(--border-light)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    <AlertTriangle size={13} />
                    <span>{unansweredCount} Remaining</span>
                  </span>
                </div>

                {/* Countdown Timer */}
                <div className="quiz-timer-box" style={{
                  borderColor: timeLeft < 120 ? '#ef4444' : 'var(--border-light)',
                  color: timeLeft < 120 ? '#ef4444' : 'var(--text-main)'
                }}>
                  <Clock size={16} color={timeLeft < 120 ? '#ef4444' : 'var(--primary)'} />
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.98rem' }}>
                    {formatTime(timeLeft)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to exit? Your answers will not be saved.')) {
                      setIsTimerRunning(false);
                      setViewMode('selection');
                    }
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.4rem 0.75rem' }}
                >
                  Exit
                </button>
              </div>
            </div>

            {/* Question Quick-Jump Navigator (Pills) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              margin: '0.85rem 0',
              overflowX: 'auto',
              padding: '0.35rem 0.2rem'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.25rem', whiteSpace: 'nowrap' }}>
                Questions:
              </span>
              {activeAttempt.questions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isAnswered = userAnswers[q.id] !== undefined;

                return (
                  <button
                    key={q.id || idx}
                    type="button"
                    onClick={() => handleJumpToQuestion(idx)}
                    style={{
                      minWidth: 32,
                      height: 32,
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: isCurrent
                        ? '2px solid var(--primary)'
                        : isAnswered
                        ? '1px solid #10b981'
                        : '1px solid var(--border-light)',
                      backgroundColor: isCurrent
                        ? 'var(--primary-light)'
                        : isAnswered
                        ? '#ecfdf5'
                        : 'var(--bg-surface)',
                      color: isCurrent
                        ? 'var(--primary)'
                        : isAnswered
                        ? '#065f46'
                        : 'var(--text-secondary)',
                      boxShadow: isCurrent ? '0 0 0 2px rgba(79, 70, 229, 0.2)' : 'none'
                    }}
                    title={`Question ${idx + 1} (${isAnswered ? 'Answered' : 'Unanswered'})`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Question Card */}
            <div className="quiz-question-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div className="question-number-pill">
                  Question {currentQuestionIndex + 1} of {totalQuestionsCount}
                </div>
                {userAnswers[currentQ.id] !== undefined ? (
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Check size={14} /> Answer Recorded
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>
                    Select an option below
                  </span>
                )}
              </div>

              <h3 className="question-text-title" style={{ fontSize: '1.15rem', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                {currentQ.question_text}
              </h3>

              {/* 4 Interactive Options */}
              <div className="quiz-options-list">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = userAnswers[currentQ.id] === optIdx;
                  const optionLetters = ["A", "B", "C", "D"];

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      className={`quiz-option-btn ${isSelected ? 'option-selected' : ''}`}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'left'
                      }}
                    >
                      <div className={`option-letter-badge ${isSelected ? 'badge-selected' : ''}`}>
                        {optionLetters[optIdx]}
                      </div>
                      <span className="option-label-text" style={{ fontSize: '0.92rem' }}>
                        {option}
                      </span>
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
              <div className="quiz-controls-bar" style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
                <button
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className="btn btn-secondary"
                  style={{ opacity: currentQuestionIndex === 0 ? 0.45 : 1 }}
                >
                  <ArrowLeft size={16} />
                  <span>Previous</span>
                </button>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {currentQuestionIndex < totalQuestionsCount - 1 && (
                    <button onClick={handleNext} className="btn btn-secondary">
                      <span>Next</span>
                      <ArrowRight size={16} />
                    </button>
                  )}

                  <button
                    onClick={handlePromptSubmit}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Submit Quiz ({answeredCount}/{totalQuestionsCount})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Confirmation Dialog Before Final Submission */}
            {showConfirmModal && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.25rem',
                zIndex: 9999
              }}>
                <div style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  padding: '1.75rem',
                  maxWidth: '480px',
                  width: '100%',
                  boxShadow: 'var(--shadow-xl)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: unansweredCount > 0 ? '#fffbeb' : '#ecfdf5',
                      color: unansweredCount > 0 ? '#d97706' : '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {unansweredCount > 0 ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Confirm Quiz Submission</h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {activeAttempt.quizTitle}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem',
                    margin: '1rem 0',
                    border: '1px solid var(--border-light)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Total Questions:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{totalQuestionsCount}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Questions Answered:</span>
                      <strong style={{ color: '#10b981' }}>{answeredCount}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Unanswered Questions:</span>
                      <strong style={{ color: unansweredCount > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
                        {unansweredCount}
                      </strong>
                    </div>
                  </div>

                  {unansweredCount > 0 ? (
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fef3c7',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      color: '#92400e',
                      marginBottom: '1.25rem',
                      display: 'flex',
                      gap: '0.4rem'
                    }}>
                      <Info size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                      <span>
                        You have <strong>{unansweredCount}</strong> unanswered questions. Unanswered questions will receive zero points upon submission.
                      </span>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                      All questions answered! Your responses will be evaluated server-side and recorded in your database history.
                    </p>
                  )}

                  {submitError && (
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      color: '#991b1b',
                      marginBottom: '1rem'
                    }}>
                      {submitError}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setShowConfirmModal(false)}
                      className="btn btn-secondary"
                      style={{ padding: '0.55rem 1rem' }}
                    >
                      Return to Quiz
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={executeSubmission}
                      className="btn btn-primary"
                      style={{
                        padding: '0.55rem 1.25rem',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="spin-anim" />
                          <span>Evaluating...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Confirm & Submit</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            VIEW 3: RESULT SCREEN & QUESTION REVIEW (ANSWERS & EXPLANATIONS REVEALED)
            =================================================================== */}
        {viewMode === 'result' && evaluationResult && (
          <div className="quiz-result-container">
            {/* Score Overview Card */}
            <div className="quiz-result-hero-card">
              <div className="result-hero-top">
                <div className="result-trophy-icon">
                  <Award size={32} />
                </div>
                <h2>Quiz Evaluated! 🎉</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                  {evaluationResult.quiz_title} • {evaluationResult.subject_code} • {evaluationResult.topic}
                </p>
              </div>

              <div className="result-score-highlight">
                <div className="score-circle">
                  <span className="score-num">{Math.round(evaluationResult.score_percentage)}%</span>
                  <span className="score-sub">
                    {evaluationResult.correct_count} / {evaluationResult.total_questions} Correct
                  </span>
                </div>
              </div>

              {/* 4 Stats Breakdown */}
              <div className="result-stats-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="result-stat-col">
                  <span className="res-stat-val" style={{ color: '#10b981' }}>{evaluationResult.correct_count}</span>
                  <span className="res-stat-lbl">Correct</span>
                </div>
                <div className="result-stat-col">
                  <span className="res-stat-val" style={{ color: '#ef4444' }}>{evaluationResult.incorrect_count}</span>
                  <span className="res-stat-lbl">Incorrect</span>
                </div>
                <div className="result-stat-col">
                  <span className="res-stat-val" style={{ color: '#f59e0b' }}>{evaluationResult.unanswered_count}</span>
                  <span className="res-stat-lbl">Unanswered</span>
                </div>
                <div className="result-stat-col">
                  <span className="res-stat-val" style={{ color: 'var(--primary)' }}>
                    {formatTime(evaluationResult.time_taken_seconds || 0)}
                  </span>
                  <span className="res-stat-lbl">Time Taken</span>
                </div>
              </div>

              <div className="result-feedback-box">
                <p>{evaluationResult.feedback_summary}</p>
              </div>

              <div className="result-actions-group">
                <button onClick={handleRetryCurrentQuiz} className="btn btn-outline">
                  <RotateCcw size={16} />
                  <span>Retry Quiz</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode('selection');
                    setQuizTab('history');
                  }}
                  className="btn btn-secondary"
                >
                  <History size={16} />
                  <span>Attempt History</span>
                </button>
                <button onClick={() => setViewMode('selection')} className="btn btn-primary">
                  <span>Back to Quizzes</span>
                </button>
              </div>
            </div>

            {/* Answer Review Section */}
            <div className="answer-review-section">
              <div className="section-header-compact" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <h3>Review Answers & Explanations</h3>
                  <p>Question-by-question breakdown with server-validated answers and saved explanations</p>
                </div>
              </div>

              <div className="review-cards-list">
                {evaluationResult.question_reviews.map((rev, idx) => {
                  const optionLetters = ["A", "B", "C", "D"];
                  const isAnswered = rev.selected_index !== null && rev.selected_index !== undefined;

                  return (
                    <div key={rev.question_id || idx} className="review-item-card">
                      <div className="review-item-header">
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          Question {idx + 1}
                        </span>

                        {rev.is_correct ? (
                          <span className="badge badge-success">
                            <CheckCircle2 size={13} />
                            <span>Correct (+1)</span>
                          </span>
                        ) : !isAnswered ? (
                          <span className="badge" style={{ backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                            <AlertTriangle size={13} />
                            <span>Unanswered (0)</span>
                          </span>
                        ) : (
                          <span className="badge" style={{ backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>
                            <XCircle size={13} />
                            <span>Incorrect (0)</span>
                          </span>
                        )}
                      </div>

                      <h4 className="review-question-text">{rev.question_text}</h4>

                      <div className="review-answers-comparison">
                        <div className="answer-box">
                          <span className="ans-label">Your Selection:</span>
                          <span className={`ans-val ${rev.is_correct ? 'ans-correct-text' : isAnswered ? 'ans-incorrect-text' : ''}`} style={{ color: !isAnswered ? '#94a3b8' : undefined }}>
                            {isAnswered
                              ? `${optionLetters[rev.selected_index]}) ${rev.options[rev.selected_index]}`
                              : 'Not Answered (Skipped)'}
                          </span>
                        </div>

                        {!rev.is_correct && (
                          <div className="answer-box">
                            <span className="ans-label">Correct Answer:</span>
                            <span className="ans-val ans-correct-text">
                              {optionLetters[rev.correct_index]}) {rev.options[rev.correct_index]}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Saved explanation (never fabricated) */}
                      {rev.explanation && (
                        <div className="review-explanation-box">
                          <p><strong>💡 Explanation:</strong> {rev.explanation}</p>
                        </div>
                      )}
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
                    Personalized AI Assistant
                  </span>
                  <h4>Have questions about your score?</h4>
                  <p>Ask EduMind AI to explain any question or generate a targeted study plan.</p>
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
