import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="hero">
        <div className="hero-content">
          <h1>Create Engaging Video Reels</h1>
          <p className="hero-subtitle">
            Synchronize video clips to music with our easy-to-use tool. Perfect for social media reels in 9:16 format.
          </p>
          <div className="hero-buttons">
            <Link to="/create" className="btn btn-primary">
              Create a Reel
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="phone-mockup">
            <div className="phone-screen">
              <div className="reel-preview">
                <div className="reel-clip"></div>
                <div className="reel-clip"></div>
                <div className="reel-clip"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="features">
        <h2 className="section-title">Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🎵</div>
            <h3>Music Synchronization</h3>
            <p>Automatically sync multiple video clips to a music track with precision.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✂️</div>
            <h3>Video Splitting</h3>
            <p>Split multiple clips within a video file with custom timestamps.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Video Search</h3>
            <p>Search for videos using prompts and our YouTube integration.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Optimized Format</h3>
            <p>Create reels in 9:16 aspect ratio, perfect for social media platforms.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload or Search</h3>
            <p>Upload your videos or search for videos using our YouTube integration.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Add Music</h3>
            <p>Upload a music file or provide a YouTube link for the soundtrack.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Set Timestamps</h3>
            <p>Define when each video clip should play in sync with the music.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Generate Reel</h3>
            <p>Create your reel and save it to your computer.</p>
          </div>
        </div>
        <div className="cta-container">
          <Link to="/create" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 