import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import CreateReel from './pages/CreateReel';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateReel />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 