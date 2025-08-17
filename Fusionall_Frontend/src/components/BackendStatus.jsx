import React, { useState, useEffect } from 'react';

const statusStyles = {
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: '10px',
    cursor: 'pointer',
  },
  indicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginRight: '6px',
  },
  label: {
    fontSize: '0.8rem',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#333',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
    zIndex: 1000,
    top: '40px',
    transform: 'translateX(-40%)',
    width: 'max-content',
    maxWidth: '200px',
  },
};

const BackendStatus = ({ onShowHealthPopup }) => {
  const [status, setStatus] = useState('checking');
  const [showTooltip, setShowTooltip] = useState(false);
  
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('https://fusionall-bckend.onrender.com/api/health', { 
          signal: AbortSignal.timeout(5000) 
        });
        
        if (response.ok) {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch (error) {
        setStatus('offline');
      }
    };
    
    checkStatus();
    
    // Check status every 60 seconds
    const interval = setInterval(checkStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const getStatusColor = () => {
    switch (status) {
      case 'online': return '#10b981';
      case 'offline': return '#ef4444';
      default: return '#f59e0b';
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'online': return 'Backend Online';
      case 'offline': return 'Backend Offline';
      default: return 'Checking...';
    }
  };
  
  return (
    <div 
      style={statusStyles.container}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={onShowHealthPopup}
    >
      <div 
        style={{
          ...statusStyles.indicator,
          backgroundColor: getStatusColor(),
        }} 
      />
      <span style={statusStyles.label}>{status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : '...'}</span>
      
      {showTooltip && (
        <div style={statusStyles.tooltip}>
          {getStatusText()}
          <div style={{ marginTop: '4px', fontSize: '0.7rem' }}>
            Click to check connection
          </div>
        </div>
      )}
    </div>
  );
};

export default BackendStatus;
