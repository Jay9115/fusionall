import React from 'react';
import './Home.css';

const Home = () => {
    return (
        <div className="homepage">
            {/* Header Section */}
            <header className="header">
                <div className="logo">FusionAll</div>
                <nav className="navbar">
                    <a href="#about">About</a>
                    <a href="#features">Features</a>
                    <a href="#contact">Contact</a>
                    <button className="cta-button">Join Now</button>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="hero">
                <h1>Welcome to FusionAll</h1>
                <p className="subheading">Connecting Studentss, Sharing Knowledge, Building Futures.</p>
            </section>

           {/* About Section */}
<section className="about" id="about">
    <h2>About FusionAll</h2>
    <p>
        FusionAll is your ultimate learning companion, designed exclusively for students who want to excel in their academic journey. 
        Our platform bridges the gap between traditional learning and modern education by integrating essential tools for seamless collaboration.
    </p>
    <p>
        Whether you're working on group projects, preparing for exams, or sharing resources, FusionAll empowers you to stay connected and organized. 
        From real-time chat to file sharing, study groups, and blogging tools, everything you need to succeed is in one place.
    </p>
    <p>
        FusionAll isn’t just about education; it’s about creating a community. Join study groups, share your insights, and collaborate with peers 
        who share your goals. With our intuitive interface and student-centered design, FusionAll makes learning more interactive and enjoyable.
    </p>
    <p>
        We understand the challenges students face in the digital age, which is why FusionAll is here to simplify your academic life, 
        one tool at a time. Discover the power of collaboration and unlock your full potential with FusionAll.
    </p>
</section>


            {/* Features Section */}
            <section className="features" id="features">
                <h2>Key Features</h2>
                <div className="features-grid">
                    <div className="feature">
                        <i className="icon chat-icon"></i>
                        <h3>Real-Time Chat</h3>
                        <p>Stay connected with peers and educators instantly.</p>
                    </div>
                    <div className="feature">
                        <i className="icon file-icon"></i>
                        <h3>File Sharing</h3>
                        <p>Share and access resources effortlessly and securely.</p>
                    </div>
                    <div className="feature">
                        <i className="icon blog-icon"></i>
                        <h3>Knowledge Blogs</h3>
                        <p>Explore ideas, share insights, and grow together.</p>
                    </div>
                    <div className="feature">
                        <i className="icon group-icon"></i>
                        <h3>Study Groups</h3>
                        <p>Collaborate in groups to achieve your academic goals.</p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="contact" id="contact">
                <h2>Contact Us</h2>
                <p>Email: <a href="mailto:fusionall@gmail.com">fusionall@gmail.com</a></p>
            </section>

            {/* Footer */}
            <footer className="footer">
                <p>© 2024 FusionAll. Empowering Learning, Empowering Lives.</p>
            </footer>
        </div>
    );
};

export default Home;
