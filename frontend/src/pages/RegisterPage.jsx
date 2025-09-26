import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      const response = await axios.post('http://localhost:3001/api/auth/register', formData);
      
      if (response.data.success) {
        setSuccess(true);
        // Store token in localStorage
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        alert('Registration successful! Welcome to TaskFlow Pro!');
        window.location.href = '/dashboard';
        console.log('User registered:', response.data.data.user);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="gradient-bg">
        <div className="container" style={{ padding: '2rem 20px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ 
            background: 'white', 
            padding: '3rem', 
            borderRadius: '12px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
            width: '100%', 
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ color: '#16a34a', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
              Welcome to TaskFlow Pro!
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Your account has been created successfully. You're now ready to start managing your tasks!
            </p>
            <Link to="/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-bg">
      <div className="container" style={{ padding: '2rem 20px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ 
          background: 'white', 
          padding: '3rem', 
          borderRadius: '12px', 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
          width: '100%', 
          maxWidth: '450px' 
        }}>
          <div className="text-center mb-8">
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>
              Create Account
            </h1>
            <p style={{ color: '#6b7280' }}>Join TaskFlow Pro and boost your productivity</p>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '0.5rem' }}>
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  placeholder="John"
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '0.5rem' }}>
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
                placeholder="johndoe"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '0.5rem' }}>
                Email Address *
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
                  fontSize: '1rem'
                }}
                placeholder="john@example.com"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '0.5rem' }}>
                Password *
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
                  fontSize: '1rem'
                }}
                placeholder="Minimum 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ 
                width: '100%', 
                marginBottom: '1.5rem',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center">
            <p style={{ color: '#6b7280' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>
                Sign in here
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

export default RegisterPage;
