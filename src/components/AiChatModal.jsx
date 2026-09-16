import React, { useState } from 'react';
import { Sparkles, Send, X, Bot, User, HelpCircle, CheckCircle2 } from 'lucide-react';

const SAMPLE_CONVERSATIONS = {
  "Explain Dijkstra's algorithm": "Dijkstra's Algorithm finds the shortest path from a single source vertex to all other vertices in a weighted graph with non-negative edge weights.\n\nKey Concepts:\n1. Greedy Approach: Always selects the unvisited node with the smallest tentative distance.\n2. Priority Queue: Optimal time complexity is O((V + E) log V).\n3. Real-world Use: GPS navigation (Google Maps) and network routing protocols (OSPF).",
  "Quiz on CPU Scheduling": "Here is a quick question for you!\n\nQuestion: Which CPU scheduling algorithm may suffer from the 'Convoy Effect'?\nA) Shortest Job First (SJF)\nB) Round Robin (RR)\nC) First-Come, First-Served (FCFS)\nD) Priority Scheduling\n\nCorrect Answer: C) FCFS! Because short processes queue behind long CPU-bound processes.",
  "What is Normalization in DBMS?": "Normalization is the process of organizing data in a database to reduce data redundancy and improve data integrity.\n\nKey Normal Forms:\n• 1NF: Atomic values, no repeating groups\n• 2NF: 1NF + No partial dependency on candidate keys\n• 3NF: 2NF + No transitive dependency\n• BCNF: Stricter version of 3NF for multi-key databases"
};

export default function AiChatModal({ isOpen, onClose, initialQuery = '' }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello Alex! 👋 I'm your EduMind AI Study Assistant. What concept or topic would you like to review today?"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = (textToSend = inputText) => {
    const query = textToSend.trim();
    if (!query) return;

    const newMessages = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      // Find matching mock response or provide smart general response
      let response = "That's a great exam question! In engineering exams, examiners look for definitions, architectural diagrams, time/space complexity, and a practical example.";
      
      for (const [key, val] of Object.entries(SAMPLE_CONVERSATIONS)) {
        if (query.toLowerCase().includes(key.toLowerCase().split(' ')[0]) || query.toLowerCase().includes(key.toLowerCase())) {
          response = val;
          break;
        }
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: response }
      ]);
      setIsTyping(false);
    }, 600);
  };

  const handleQuickPrompt = (promptText) => {
    handleSend(promptText);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="brand-icon" style={{ width: 34, height: 34 }}>
              <Bot size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>EduMind AI Study Assistant</h3>
              <p style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                Ready to solve doubts & generate exam summaries
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-history">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-msg ${msg.sender}`}>
              <div className="msg-bubble" style={{ whiteSpace: 'pre-line' }}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="chat-msg ai">
              <div className="msg-bubble" style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} className="animate-spin" />
                <span>EduMind is synthesizing notes...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick prompt pills */}
        <div className="quick-prompts-bar">
          <button
            className="quick-prompt-pill"
            onClick={() => handleQuickPrompt("Explain Dijkstra's algorithm")}
          >
            💡 Explain Dijkstra's Algorithm
          </button>
          <button
            className="quick-prompt-pill"
            onClick={() => handleQuickPrompt("Quiz on CPU Scheduling")}
          >
            🎯 1-Minute Quiz on OS
          </button>
          <button
            className="quick-prompt-pill"
            onClick={() => handleQuickPrompt("What is Normalization in DBMS?")}
          >
            📊 DBMS Normalization
          </button>
        </div>

        {/* Input */}
        <form
          className="chat-input-box"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            className="chat-input"
            placeholder="Ask anything (e.g. 'Explain 3NF with example', 'Generate quiz')..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.1rem' }}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
