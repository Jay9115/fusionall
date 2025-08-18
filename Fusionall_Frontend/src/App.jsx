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
    
    const checkBackendHealth = () => {
        setHealthStatus("loading");
        setHealthMsg("Checking backend connection...");
        const backendHealthUrl = "https://fusionall-bckend.onrender.com/api/health";
        
        // Set a timeout for 60 seconds (1 minute)
        const timeoutId = setTimeout(() => {
            setHealthStatus("error");
            setHealthMsg("Connection timed out after 1 minute. Backend might be unavailable.");
        }, 60000);
        
        fetch(backendHealthUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-cache',
        })
        .then(async (res) => {
            // Clear the timeout since we got a response
            clearTimeout(timeoutId);
            
            if (!res.ok) throw new Error("Server responded with an error");
            
            // Clone the response to avoid the "body stream already read" error
            const responseClone = res.clone();
            
            try {
                const data = await res.json();
                console.log("Backend health response:", data);
                setHealthStatus("success");
                setHealthMsg(data.message || "Backend is connected successfully!");
            } catch (error) {
                // If we can't parse the JSON but got a response, try as text instead
                console.log("Failed to parse JSON, trying text:", error);
                try {
                    const textData = await responseClone.text();
                    console.log("Backend health response (text):", textData);
                    setHealthStatus("success");
                    setHealthMsg("Backend is connected successfully!");
                } catch (textError) {
                    console.error("Failed to read response as text:", textError);
                    setHealthStatus("success"); // Still consider it a success if we got a response
                    setHealthMsg("Backend is connected!");
                }
            }
        })
        .catch((err) => {
            // Clear the timeout since we already know the result
            clearTimeout(timeoutId);
            
            console.error("Backend health check error:", err);
            setHealthStatus("error");
            setHealthMsg("Could not connect to backend. Please try again later.");
        });
    };

    useEffect(() => {
        if (!showHealth) return;
        
        checkBackendHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
