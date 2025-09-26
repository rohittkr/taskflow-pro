import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="gradient-bg">
      <div className="container py-16">
        <div className="text-center">
          <h1 className="hero-title">
            Welcome to <span className="text-blue">TaskFlow Pro</span>
          </h1>
          <p className="hero-subtitle">
            The ultimate task management platform designed for modern teams. 
            Streamline workflows, boost productivity, and achieve your goals faster.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-primary">
              Get Started Free
            </Link>
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;