import React, { useState, useEffect } from "react";
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
import { auth } from "./components/firebase";
import HealthPopup from "./components/HealthPopup";

function App() {
    const [activeSection, setActiveSection] = useState("Home");
    const [blogs, setBlogs] = useState([]);
    const [isWriting, setIsWriting] = useState(false);

    // Health popup state
    const [showHealth, setShowHealth] = useState(true);
    const [healthStatus, setHealthStatus] = useState("loading"); // loading | success | error
    const [healthMsg, setHealthMsg] = useState("");

    useEffect(() => {
        if (!showHealth) return;
        setHealthStatus("loading");
        setHealthMsg("");
        fetch("/health")
            .then(async (res) => {
                if (!res.ok) throw new Error("not ok");
                const data = await res.json();
                setHealthStatus("success");
                setHealthMsg(data.message);
            })
            .catch(() => {
                setHealthStatus("error");
                setHealthMsg("");
            });
    }, [showHealth]);

    const handleNavClick = (section) => {
        setActiveSection(section);
        setIsWriting(false);
    };

    const addBlog = async (newBlog) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert("Please log in to save your blog.");
            return;
        }
        try {
            const response = await fetch('https://fusionall-bckend.onrender.com/api/blogs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newBlog,
                    authorId: currentUser.uid,
                    authorName: currentUser.displayName
                }),
            });
            if (response.ok) {
                setBlogs([newBlog, ...blogs]);
                setIsWriting(false);
            } else {
                alert("Failed to save the blog. Please try again.");
            }
        } catch (error) {
            alert("Failed to save the blog. Please try again.");
        }
    };

    return (
        <div className="App">
            {showHealth && (
                <HealthPopup
                    status={healthStatus}
                    message={healthMsg}
                    onClose={() => setShowHealth(false)}
                />
            )}
            <HorizontalNav onNavClick={handleNavClick} />
            <VerticalNav onNavClick={handleNavClick} />

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
