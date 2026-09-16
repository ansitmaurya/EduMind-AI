import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import {
  Bot,
  Send,
  Sparkles,
  Mic,
  RotateCcw,
  BookOpen,
  Zap,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  FileText,
  HelpCircle,
  Clock,
  Info,
  Layers,
  BrainCircuit
} from 'lucide-react';

const INITIAL_CONVERSATION = [
  {
    id: 1,
    sender: 'user',
    text: "Can you explain linked lists in simple words?",
    time: "10:14 AM"
  },
  {
    id: 2,
    sender: 'ai',
    text: "A linked list is a data structure where elements are connected using links called pointers. Each element, called a node, stores data and a reference to the next node.",
    time: "10:14 AM"
  },
  {
    id: 3,
    sender: 'user',
    text: "Why are linked lists useful?",
    time: "10:15 AM"
  },
  {
    id: 4,
    sender: 'ai',
    text: "They are useful when you need flexible memory allocation and frequent insertion or deletion of elements.",
    time: "10:15 AM"
  }
];

export default function AiAssistantPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(INITIAL_CONVERSATION);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const chatBottomRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Suggestion Cards (4 cards)
  const suggestionCards = [
    {
      title: "Explain a difficult concept",
      prompt: "Can you explain Dijkstra's algorithm step-by-step with an example?",
      icon: Lightbulb,
      bg: "#eef2ff",
      color: "#4f46e5"
    },
    {
      title: "Summarize a topic",
      prompt: "Please summarize CPU Scheduling algorithms in Operating Systems.",
      icon: FileText,
      bg: "#f5f3ff",
      color: "#7c3aed"
    },
    {
      title: "Give me practice questions",
      prompt: "Give me 3 practice quiz questions on Database Normalization.",
      icon: Zap,
      bg: "#f0f9ff",
      color: "#0ea5e9"
    },
    {
      title: "Help me prepare for an exam",
      prompt: "How should I structure my answers for Computer Networks semester exams?",
      icon: BookOpen,
      bg: "#ecfdf5",
      color: "#10b981"
    }
  ];

  // Quick Prompt Chips
  const quickChips = [
    { label: "Explain simply", query: "Explain linked lists in simple terms" },
    { label: "Give an example", query: "Give an example of SQL Joins with sample tables" },
    { label: "Summarize", query: "Summarize Operating System Deadlock conditions" },
    { label: "Create quiz questions", query: "Create quiz questions on Computer Networks protocols" }
  ];

  // Simulated AI response generator
  const getSimulatedResponse = (query) => {
    const q = query.toLowerCase();

    if (q.includes('linked list') || q.includes('pointer') || q.includes('node')) {
      return "A linked list consists of nodes where each node contains data and a pointer to the next node.\n\nKey Concepts:\n• Singly Linked List: Forward navigation only (Node -> Next).\n• Doubly Linked List: Bidirectional navigation (Prev <- Node -> Next).\n• Circular Linked List: Last node points back to head.\n• Complexity: O(1) insertion/deletion at head, O(n) search time.";
    }

    if (q.includes('database') || q.includes('dbms') || q.includes('sql') || q.includes('normalization')) {
      return "In Database Management Systems (DBMS), Normalization organizes relational tables to eliminate redundancy and prevent update anomalies.\n\nNormal Forms Summary:\n• 1NF: Atomic values, no multi-valued attributes.\n• 2NF: 1NF + No partial dependencies on candidate keys.\n• 3NF: 2NF + No transitive dependencies.\n• BCNF: Every determinant is a candidate key.";
    }

    if (q.includes('operating system') || q.includes('os') || q.includes('deadlock') || q.includes('scheduling')) {
      return "Operating Systems manage computer hardware and execution environments.\n\nCore Concepts:\n• CPU Scheduling: FCFS, Shortest Job First (SJF), Round Robin (RR), and Priority Scheduling.\n• Deadlock Conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.\n• Memory Management: Paging, Segmentation, and Virtual Memory.";
    }

    if (q.includes('network') || q.includes('computer network') || q.includes('tcp') || q.includes('osi')) {
      return "Computer Networks enable data communication between distributed hosts.\n\nKey Concepts:\n• OSI Model (7 Layers): Physical, Data Link, Network, Transport, Session, Presentation, Application.\n• TCP vs UDP: TCP is connection-oriented and reliable (3-way handshake); UDP is connectionless and low-latency (ideal for streaming/gaming).\n• IP Addressing: IPv4 (32-bit) vs IPv6 (128-bit).";
    }

    if (q.includes('exam') || q.includes('prepare') || q.includes('study')) {
      return "Exam Preparation Strategy for Engineering Papers:\n1. Theory & Definitions: State concise definitions with standard terminology.\n2. Architecture & Diagrams: Draw neat block diagrams with labelled data flows.\n3. Algorithms & Complexity: Provide pseudocode with Big-O time/space analysis.\n4. Real-world Use Case: Mention practical industry applications.";
    }

    if (q.includes('quiz') || q.includes('question') || q.includes('test')) {
      return "Here is an interactive practice question for you:\n\nQuestion: Which CPU scheduling algorithm avoids starvation while remaining optimal for interactive time-sharing systems?\nA) First-Come, First-Served (FCFS)\nB) Shortest Job First (SJF)\nC) Round Robin (RR)\nD) Priority Scheduling (without aging)\n\nCorrect Answer: C) Round Robin! Time quantum slices guarantee bounded waiting time for all processes.";
    }

    if (q.includes('dijkstra') || q.includes('algorithm')) {
      return "Dijkstra's Algorithm finds the shortest path from a single source node to all other vertices in a non-negative weighted graph.\n\nKey Steps:\n1. Initialize distances: Source = 0, all other nodes = ∞.\n2. Use a Min-Priority Queue to extract the closest unvisited node.\n3. Relax neighboring edges.\n4. Time Complexity: O((V + E) log V) using a Min-Heap.";
    }

    // Default Fallback
    return "This is a prototype response. In the next phase, EduMind AI will connect this interface with an AI model to provide personalized answers.";
  };

  const handleSend = (textToSend = input) => {
    const query = textToSend.trim();
    if (!query) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: currentTime
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const responseText = getSimulatedResponse(query);
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 550);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleMicClick = () => {
    setMicActive(true);
    setTimeout(() => {
      setMicActive(false);
      setInput("Explain Binary Search Trees with an example");
    }, 1200);
  };

  return (
    <DashboardLayout>
      {/* 1. Page Header */}
      <div className="ai-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>AI Study Assistant</h1>
            <span className="badge badge-primary">
              <Sparkles size={13} />
              <span>AI Learning Assistant</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Ask questions, understand concepts, and prepare smarter.
          </p>
        </div>

        {/* Prototype Mode Subtle Indicator */}
        <div className="prototype-mode-badge">
          <Info size={14} />
          <span>Prototype Mode: AI responses are simulated</span>
        </div>
      </div>

      {/* Main Grid: Chat Workspace + Right Side Study Context */}
      <div className="ai-workspace-layout">
        {/* Chat Main Column */}
        <div className="ai-chat-column">
          {/* Welcome Area Suggestion Cards (Shown when chat is empty or as quick starters) */}
          {messages.length === 0 && (
            <div className="ai-welcome-box">
              <div className="welcome-headline">
                <div className="brand-icon" style={{ width: 42, height: 42 }}>
                  <BrainCircuit size={22} />
                </div>
                <div>
                  <h3>What would you like to learn today?</h3>
                  <p>
                    Ask EduMind AI to explain a concept, simplify a topic, create examples, or help you prepare for an exam.
                  </p>
                </div>
              </div>

              <div className="suggestions-grid">
                {suggestionCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={idx}
                      className="suggestion-card-btn"
                      onClick={() => handleSend(card.prompt)}
                    >
                      <div className="suggestion-icon" style={{ backgroundColor: card.bg, color: card.color }}>
                        <Icon size={18} />
                      </div>
                      <span className="suggestion-title">{card.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat Container Card */}
          <div className="ai-chat-card">
            {/* Chat Card Header */}
            <div className="ai-chat-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="brand-icon" style={{ width: 32, height: 32 }}>
                  <Bot size={17} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>EduMind Study Bot</h4>
                  <span style={{ fontSize: '0.74rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                    Active Session • Demo Mode
                  </span>
                </div>
              </div>

              <button
                onClick={handleClearChat}
                className="clear-chat-btn"
                title="Restart conversation"
              >
                <RotateCcw size={14} />
                <span>Clear Chat</span>
              </button>
            </div>

            {/* Chat Message Scroll Window */}
            <div className="ai-chat-messages-window">
              {messages.map((msg) => (
                <div key={msg.id} className={`ai-message-row ${msg.sender === 'user' ? 'msg-user' : 'msg-ai'}`}>
                  {msg.sender === 'ai' && (
                    <div className="ai-msg-avatar">
                      <Bot size={16} />
                    </div>
                  )}

                  <div className="ai-msg-content-box">
                    <div className="ai-bubble-body">
                      {msg.text}
                    </div>
                    <span className="ai-msg-timestamp">{msg.time}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="ai-message-row msg-ai">
                  <div className="ai-msg-avatar">
                    <Bot size={16} />
                  </div>
                  <div className="ai-msg-content-box">
                    <div className="ai-bubble-body typing-indicator">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                        EduMind AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="ai-quick-chips-bar">
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.2rem' }}>
                Quick Prompts:
              </span>
              {quickChips.map((chip, i) => (
                <button
                  key={i}
                  className="quick-chip-btn"
                  onClick={() => handleSend(chip.query)}
                >
                  💡 {chip.label}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <form
              className="ai-chat-input-container"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <button
                type="button"
                className={`mic-btn ${micActive ? 'mic-listening' : ''}`}
                onClick={handleMicClick}
                title="Voice Input (Demo)"
              >
                <Mic size={18} />
              </button>

              <input
                type="text"
                className="ai-chat-input-field"
                placeholder={micActive ? "Listening (Demo)..." : "Ask EduMind AI anything about your studies..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-md)' }}
                disabled={!input.trim()}
              >
                <Send size={16} />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* 7. Right Side / Study Context Panel */}
        <aside className="ai-study-context-panel">
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div className="brand-icon" style={{ width: 32, height: 32, borderRadius: 8 }}>
                <Layers size={17} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Study Context</h3>
            </div>

            <div className="context-item-group">
              <div className="context-item">
                <span className="context-label">Current Subject</span>
                <p className="context-value">Data Structures</p>
                <span className="badge badge-primary" style={{ marginTop: '0.3rem', fontSize: '0.72rem' }}>
                  CS301
                </span>
              </div>

              <div className="context-item" style={{ marginTop: '1rem' }}>
                <span className="context-label">Current Topic</span>
                <p className="context-value">Linked Lists</p>
              </div>

              <div className="context-item" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <span className="context-label" style={{ margin: 0 }}>Progress</span>
                  <span style={{ color: 'var(--primary)' }}>72%</span>
                </div>
                <div className="progress-track" style={{ height: 8 }}>
                  <div className="progress-fill" style={{ width: '72%', backgroundColor: 'var(--primary)' }} />
                </div>
              </div>

              <div className="context-suggestion-card" style={{ marginTop: '1.5rem' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.04em' }}>
                  Suggested Next Step
                </span>
                <h5 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0.4rem 0 0.85rem' }}>
                  Practice Linked List Questions
                </h5>
                <button
                  onClick={() => navigate('/quizzes')}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '0.88rem', padding: '0.6rem', justifyContent: 'center' }}
                >
                  <Zap size={16} />
                  <span>Start Quiz</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
