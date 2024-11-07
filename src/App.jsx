import React, { useState } from "react";
import "./App.css";

import HorizontalNav from "./components/Horizontalnav";
import VerticalNav from "./components/VerticalNav";
import Chat from "./components/chat";  // Ensure the Chat component is properly named
import AuthButtons from "./components/AuthButtons";
import Group from "./components/group";
import Home from "./components/Home";
import Materials from "./components/Materials";
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
                {activeSection === "Home" && <Home/>}
                {activeSection === "Chat" && <Chat />}
                {activeSection === "Groups" && <Group />}
                {activeSection === "Materials" && <Materials />}
            </div>
        </div>
    );
}

export default App;
