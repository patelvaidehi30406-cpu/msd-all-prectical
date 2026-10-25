import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import './App.css';

function Home() {
  const features = [
    {
      icon: '⚡',
      title: 'Fast Client-Side Routing',
      desc: 'Instant page transitions without full browser reloads using React Router DOM.'
    },
    {
      icon: '🎨',
      title: 'Modern Responsive UI',
      desc: 'Crafted with modern glassmorphism, smooth animations, and clean typography.'
    },
    {
      icon: '🚀',
      title: 'MERN Stack Ready',
      desc: 'Built as a scalable Single Page Application (SPA) foundation for full-stack apps.'
    }
  ];

  return (
    <div className="page">
      <div className="hero-badge">✨ MSD Practical 4 — Single Page Application</div>
      <h1>Welcome to Vaidu Website</h1>
      <p className="subtitle">
        This is the Home Page of our React SPA. Explore seamless navigation powered by React Router without refreshing the page.
      </p>

      <div className="cta-group">
        <Link to="/about" className="btn btn-primary">Explore About Us →</Link>
        <Link to="/contact" className="btn btn-secondary">Get in Touch</Link>
      </div>

      <div className="card-grid">
        {features.map((item, index) => (
          <div className="info-card" key={index}>
            <span className="card-icon">{item.icon}</span>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function About() {
  const stack = [
    { name: 'MongoDB', role: 'NoSQL Database', badge: 'M' },
    { name: 'Express.js', role: 'Backend Framework', badge: 'E' },
    { name: 'React.js', role: 'Frontend Library', badge: 'R' },
    { name: 'Node.js', role: 'Runtime Environment', badge: 'N' }
  ];

  return (
    <div className="page">
      <div className="hero-badge">📘 Who We Are</div>
      <h1>About Us</h1>
      <p className="subtitle">
        This website demonstrates React Router navigation. We are learning MERN Stack Development to build modern, high-performance web applications.
      </p>

      <div className="about-highlights">
        <div className="info-card highlight-box">
          <h3>🎯 Objective of Practical 4</h3>
          <p>
            To understand and implement declarative routing in React using{' '}
            <code>BrowserRouter</code>, <code>Routes</code>, <code>Route</code>, and{' '}
            <code>Link</code> components for a smooth Single Page Application experience.
          </p>
        </div>

        <h2 className="section-title">Our Core Tech Stack (MERN)</h2>
        <div className="stack-grid">
          {stack.map((tech, index) => (
            <div className="stack-card" key={index}>
              <div className="stack-badge">{tech.badge}</div>
              <div>
                <h4>{tech.name}</h4>
                <span>{tech.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Contact() {
  return (
    <div className="page">
      <div className="hero-badge">📬 Reach Out</div>
      <h1>Contact Us</h1>
      <p className="subtitle">
        Have questions about our project or coursework? Feel free to connect with us through the details below.
      </p>

      <div className="contact-container">
        <div className="contact-details">
          <div className="contact-item">
            <span className="contact-icon">📧</span>
            <div>
              <h4>Email</h4>
              <p>vaidehi@gmail.com</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon">🎓</span>
            <div>
              <h4>Course</h4>
              <p>B.Sc. CA & IT</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon">💻</span>
            <div>
              <h4>Subject</h4>
              <p>MERN Stack Development (Practical 4)</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon">📍</span>
            <div>
              <h4>Department</h4>
              <p>Computer Applications & Information Technology</p>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
          <h3>Send a Quick Message</h3>
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea rows="4" placeholder="Write your message here..." required></textarea>
          <button type="submit" className="btn btn-primary full-width">
            Send Message ✨
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <div className="logo-area">
            <span className="logo-dot"></span>
            <h2>Vaidu Website</h2>
          </div>
          <div className="nav-links">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active-link' : '')}>
              Home
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'active-link' : '')}>
              About
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active-link' : '')}>
              Contact
            </NavLink>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        <footer>
          <p>Practical 4 | React Router SPA • Built with React & Vite</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
