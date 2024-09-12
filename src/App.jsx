import React, { useState } from "react";
import "./App.css";
import LoginAndRegister from "./components/LoginAndRegister";
import HorizontalNav from "./components/Horizontalnav";
import VerticalNav from "./components/VerticalNav";

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
                {activeSection === "Login" ? (
                    <LoginAndRegister />
                ) : (
                    ["Home", "Chat", "Groups", "Blogs", "Calendar", "Materials", "Profile", "Setting", "About", "Contact"].map((section) => (
                        <div
                            key={section}
                            id={section}
                            className={`page-section ${activeSection === section ? "active" : ""}`}
                            style={{ display: activeSection === section ? "block" : "none" }}
                        >
                            <h2>{section} Page</h2>
                            <p>Welcome to the {section} page of Fusion All.</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default App;
