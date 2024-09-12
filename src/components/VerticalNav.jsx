import React, { useState } from 'react';

const VerticalNav = ({ onNavClick }) => {
    const [activeSection, setActiveSection] = useState("Home");

    const handleNavClick = (section) => {
        setActiveSection(section);
        onNavClick(section); // Keeping the original onNavClick functionality
    };

    return (
        <nav className="vertical-nav" id="vertical-nav">
            <ul className="nav-list">
                {["Home", "Chat", "Groups", "Blogs", "Calendar", "Materials","Login"].map((section) => (
                    <li key={section}>
                        <a
                            href={`#${section}`}
                            className={`nav-link ${activeSection === section ? "active" : ""}`}
                            onClick={() => handleNavClick(section)}
                        >
                            <i className={`fa fa-${section.toLowerCase()}`}></i>{section}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default VerticalNav;
