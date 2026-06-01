import React from 'react';
import { Lock, Unlock, CheckCircle } from 'lucide-react';
import './SessionCard.css';

/**
 * SessionCard displays a single session (chapter/lesson) within a course.
 * Props:
 *  - title: string – session title
 *  - isLocked: boolean – whether the session is locked for the student
 *  - progress: number (0‑100) – completion percent for unlocked sessions
 *  - onClick: optional click handler for unlocked sessions
 */
const SessionCard = ({ title, isLocked, progress = 0, onClick }) => {
  return (
    <div className="session-card" onClick={isLocked ? undefined : onClick} style={{ cursor: isLocked ? 'default' : 'pointer' }}>
      <div className="session-info">
        <h5 className="session-title">{title}</h5>
        {isLocked ? (
          <Lock size={18} className="icon lock-icon" />
        ) : (
          <Unlock size={18} className="icon unlock-icon" />
        )}
      </div>
      {!isLocked && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
          <span className="progress-percent">{progress}%</span>
        </div>
      )}
      {!isLocked && progress === 100 && (
        <CheckCircle size={16} className="icon completed-icon" />
      )}
    </div>
  );
};



export default SessionCard;
