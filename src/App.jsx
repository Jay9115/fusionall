import React, { useState } from "react";
import "./App.css";
import HorizontalNav from "./components/Horizontalnav";
import VerticalNav from "./components/VerticalNav";
import Chat from "./components/chat";
import AuthButtons from "./components/AuthButtons";
import Group from "./components/group";
import BlogList from "./components/Bloglist";
import BlogEditor from "./components/Blogeditor";
import Home from './components/Home';
import Materials from "./components/Materials";

function App() {
    const [activeSection, setActiveSection] = useState("Home");
    const [blogs, setBlogs] = useState([]);
    const [isWriting, setIsWriting] = useState(false);
    const [isVerticalNavVisible, setVerticalNavVisible] = useState(false); // New state for toggling VerticalNav

    const handleNavClick = (section) => {
        setActiveSection(section);
        setIsWriting(false);
    };

    const toggleVerticalNav = () => {
        setVerticalNavVisible(!isVerticalNavVisible); // Toggle VerticalNav visibility
    };

    const addBlog = (newBlog) => {
        setBlogs([newBlog, ...blogs]);
        setIsWriting(false);
    };

    return (
        <div className="App">
            <HorizontalNav onNavClick={handleNavClick} toggleVerticalNav={toggleVerticalNav} />
            {isVerticalNavVisible && <VerticalNav onNavClick={handleNavClick} />} {/* Conditionally render VerticalNav */}

            <div className="content">
                {activeSection === "Home" && <Home />}
                {activeSection === "Login" && <AuthButtons />}
                {activeSection === "Chat" && <Chat />}
                {activeSection === "Groups" && <Group />}
                {activeSection === "Materials" && <Materials />}

                {activeSection === "Blog" && (
                    <div className={`page-section ${activeSection === "Blog" ? "active" : ""}`}>
                        {isWriting ? (
                            <BlogEditor onSave={addBlog} onCancel={() => setIsWriting(false)} />
                        ) : (
                            <>
                                <button onClick={() => setIsWriting(true)}>Add a New Blog</button>
                                <BlogList blogs={blogs} />
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
