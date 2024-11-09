import React, { useState } from "react";
import "./App.css";

import HorizontalNav from "./components/Horizontalnav";
import VerticalNav from "./components/VerticalNav";
import Chat from "./components/chat"; // Ensure the Chat component is properly named
import AuthButtons from "./components/AuthButtons";
import Group from "./components/group";
// import Homepage from './components/homepage';
import Home from './components/Home';
import Materials from "./components/Materials";

function App() {
    const [activeSection, setActiveSection] = useState("Home"); // Default is "Home"

    // Function to handle navigation clicks
    const handleNavClick = (section) => {
        setActiveSection(section); // Update the active section based on user click
    };

    return (
        <div className="App">
            {/* Horizontal and Vertical Navigation */}
            <HorizontalNav onNavClick={handleNavClick} />
            <VerticalNav onNavClick={handleNavClick} />

            {/* Main Content Area */}
            <div className="content">
                {/* Conditional rendering of sections */}
                {/* {activeSection === "Home" && <Homepage />} */}
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
