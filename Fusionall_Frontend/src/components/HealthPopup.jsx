import React from "react";

const popupStyles = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const boxStyles = {
  background: "#fff",
  borderRadius: "12px",
  padding: "2rem 2.5rem",
  boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
  minWidth: "320px",
  textAlign: "center",
};

const buttonStyles = {
  marginTop: "1.5rem",
  padding: "0.5rem 1.5rem",
  border: "none",
  borderRadius: "6px",
  background: "#007bff",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "1rem",
};

export default function HealthPopup({ status, message, onClose }) {
  let displayMsg = "";
  if (status === "loading") displayMsg = "Checking backend health...";
  else if (status === "error") displayMsg = "Could not connect to backend.";
  else if (status === "success") displayMsg = message;

  return (
    <div style={popupStyles}>
      <div style={boxStyles}>
        <h2>Backend Health</h2>
        <div style={{ fontSize: "1.2rem", margin: "1rem 0" }}>{displayMsg}</div>
        <button style={buttonStyles} onClick={onClose}>Continue</button>
      </div>
    </div>
  );
}
