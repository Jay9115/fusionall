import React, { useState } from "react";
import "./App.css";
import LoginAndRegister from "./components/LoginAndRegister";
import HorizontalNav from "./components/Horizontalnav";
import VerticalNav from "./components/VerticalNav";
import Chat from "./components/chat";  // Ensure the Chat component is properly named
import AuthButtons from "./components/AuthButtons";

function App() {
    const [activeSection, setActiveSection] = useState("Home");

    const handleNavClick = (section) => {
        setActiveSection(section);
    };

    return (
        <div className="App">
            <HorizontalNav />
            <VerticalNav onNavClick={handleNavClick} />

            <div className="content">
                {activeSection === "Login" && <AuthButtons />}
                {activeSection === "Chat" && <Chat />}
            </div>
        </div>
    );
}

export default App;
