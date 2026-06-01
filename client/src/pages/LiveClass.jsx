import React, { useState } from 'react';
import { 
  Users, 
  MessageCircle, 
  Send, 
  Mic, 
  Video as VideoIcon, 
  Hand, 
  ScreenShare,
  X,
  Settings,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import './LiveClass.css';

const LiveClass = () => {
  const [chat, setChat] = useState([
    { user: 'Admin', text: 'Welcome to the live session!', time: '10:00 AM' },
    { user: 'Rahul', text: 'Hello Sir!', time: '10:02 AM' },
    { user: 'Sneha', text: 'Is this session recorded?', time: '10:05 AM' }
  ]);
  const [message, setMessage] = useState('');

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message) return;
    setChat([...chat, { user: 'Me', text: message, time: '10:10 AM' }]);
    setMessage('');
  };

  return (
    <div className="live-session-page">
      <div className="live-main-container">
        {/* Left: Video Area */}
        <div className="video-area">
          <div className="live-header-bar">
            <div className="live-status">
              <span className="live-dot"></span>
              <strong>Live: Advanced React Patterns</strong>
            </div>
            <div className="live-stats">
              <Users size={16} /> <span>124 watching</span>
            </div>
          </div>

          <div className="main-video-stream">
            <div className="presenter-view">
              <img src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1200&auto=format&fit=crop" alt="Live stream" />
              <div className="presenter-name">Sarah Jenkins (Mentor)</div>
            </div>
            <div className="participant-grid">
               <div className="mini-stream"><img src="https://ui-avatars.com/api/?name=You&background=4F46E5&color=fff" alt="User" /></div>
            </div>
          </div>

          <div className="video-controls-bar">
             <div className="controls-group">
                <button className="control-btn"><Mic size={20} /></button>
                <button className="control-btn"><VideoIcon size={20} /></button>
             </div>
             <div className="controls-group">
                <button className="control-btn danger"><X size={20} /></button>
             </div>
             <div className="controls-group">
                <button className="control-btn active"><ScreenShare size={20} /></button>
                <button className="control-btn"><Hand size={20} /></button>
                <button className="control-btn"><Settings size={20} /></button>
             </div>
          </div>
        </div>

        {/* Right: Chat Area */}
        <aside className="chat-area">
          <div className="chat-header">
            <h3>Live Chat</h3>
            <button className="icon-btn"><MoreVertical size={18} /></button>
          </div>
          <div className="chat-messages">
            {chat.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.user === 'Me' ? 'own' : ''}`}>
                <div className="chat-meta">
                  <strong>{msg.user}</strong>
                  <span>{msg.time}</span>
                </div>
                <p>{msg.text}</p>
              </div>
            ))}
          </div>
          <form className="chat-input" onSubmit={sendMessage}>
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="send-btn"><Send size={18} /></button>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default LiveClass;
