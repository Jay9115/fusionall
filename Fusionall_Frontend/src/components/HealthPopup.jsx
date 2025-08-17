import React from "react";
import "./HealthPopup.css";

export default function HealthPopup({ status, message, onClose, onRetry }) {
  // Messages based on status
  let displayMsg = "";
  if (status === "loading") displayMsg = "Checking backend health...";
  else if (status === "error") displayMsg = message || "Could not connect to backend.";
  else if (status === "success") displayMsg = message || "Backend is running correctly!";

  console.log("HealthPopup status:", status, "message:", message);

  // Render status icon based on current state
  const renderStatusIcon = () => {
    switch (status) {
      case "loading":
        return <div className="health-popup-status-loading"></div>;
      case "success":
        return (
          <div className="health-popup-status-success">
            <span>✓</span>
          </div>
        );
      case "error":
        return (
          <div className="health-popup-status-error">
            <span>✕</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="health-popup-overlay">
      <div className="health-popup-container">
        <h2 className="health-popup-title">Backend Health Check</h2>
        {renderStatusIcon()}
        <div className="health-popup-message">{displayMsg}</div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {status === "error" && onRetry && (
            <button 
              className="health-popup-continue"
              onClick={(e) => {
                e.preventDefault();
                if (onRetry) onRetry();
              }}
              style={{ background: '#6b7280' }}
            >
              Retry Connection
            </button>
          )}
          <button 
            className="health-popup-continue" 
            onClick={(e) => {
              e.preventDefault();
              if (onClose) onClose();
            }}
          >
            {status === "error" ? "Continue Anyway" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
