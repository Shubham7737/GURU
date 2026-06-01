import React from 'react';
import './Notification.css';

// Toast Notification Component
export const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast-message toast-${type}`}>
      <div className="toast-content">
        <span className="toast-icon">{type === 'success' ? '✅' : '❌'}</span>
        <p>{message}</p>
      </div>
      <button className="toast-close" onClick={onClose}>✕</button>
    </div>
  );
};

// Modern Confirmation Modal Component
export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card animate-pop">
        <div className="modal-header">
          <span className="modal-warning-icon">⚠️</span>
          <h3>{title || 'Are you sure?'}</h3>
        </div>
        <div className="modal-body">
          <p>{message || 'Do you really want to delete this? This action cannot be undone.'}</p>
        </div>
        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>No, Cancel</button>
          <button className="modal-btn modal-btn-confirm" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
};
