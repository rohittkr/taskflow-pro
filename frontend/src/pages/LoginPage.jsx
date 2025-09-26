import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', formData);
      
      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // Redirect to dashboard (we'll create this later)
        alert('Login successful!');
        window.location.href = '/dashboard';
        console.log('User logged in:', response.data.data.user);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg">
      <div className="container" style={{ padding: '2rem 20px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ 
          background: 'white', 
          padding: '3rem', 
          borderRadius: '12px', 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
          width: '100%', 
          maxWidth: '400px' 
        }}>
          <div className="text-center mb-8">
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>
              Welcome Back
            </h1>
            <p style={{ color: '#6b7280' }}>Sign in to your TaskFlow Pro account</p>
          </div>

          {error && (
            <div style={{ 
              background: '#fef2f2', 
              color: '#dc2626', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '0.5rem' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                placeholder="Enter your email"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '0.5rem' }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ 
                width: '100%', 
                marginBottom: '1.5rem',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center">
            <p style={{ color: '#6b7280' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>
                Create one here
              </Link>
            </p>
            <Link to="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem', marginTop: '1rem', display: 'inline-block' }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;