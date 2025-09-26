import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      // If no user data, redirect to login
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Verify token is still valid by calling profile endpoint
      fetchUserProfile(token);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get('http://localhost:3001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // If token is invalid, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to home page
    navigate('/');
  };

  if (loading) {
    return (
      <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e5e7eb', 
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Navigation Header */}
      <header style={{ 
        backgroundColor: 'white', 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '1rem 0'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              T
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
              TaskFlow Pro
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#6b7280' }}>Welcome, {user.firstName || user.username}!</span>
            <button 
              onClick={handleLogout}
              className="btn-secondary"
              style={{ padding: '8px 16px' }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ padding: '3rem 20px' }}>
        {/* Welcome Section */}
        <div style={{ 
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>
            🎉 Welcome to your Dashboard!
          </h2>
          <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            Great job setting up your TaskFlow Pro account. You're now ready to start managing your tasks and projects efficiently.
          </p>
          
          {/* User Info Card */}
          <div style={{ 
            background: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>Your Account Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <strong style={{ color: '#111827' }}>Name:</strong>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.username}
                </p>
              </div>
              <div>
                <strong style={{ color: '#111827' }}>Email:</strong>
                <p style={{ color: '#6b7280', margin: 0 }}>{user.email}</p>
              </div>
              <div>
                <strong style={{ color: '#111827' }}>Role:</strong>
                <p style={{ color: '#6b7280', margin: 0, textTransform: 'capitalize' }}>{user.role}</p>
              </div>
              <div>
                <strong style={{ color: '#111827' }}>User ID:</strong>
                <p style={{ color: '#6b7280', margin: 0 }}>#{user.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
            <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Projects</h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Create and manage your projects
            </p>
            <button className="btn-primary" style={{ width: '100%' }}>
              Coming Soon
            </button>
          </div>

          <div style={{ 
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Tasks</h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Manage your daily tasks
            </p>
            <button className="btn-primary" style={{ width: '100%' }}>
              Coming Soon
            </button>
          </div>

          <div style={{ 
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
            <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Team</h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Collaborate with your team
            </p>
            <button className="btn-primary" style={{ width: '100%' }}>
              Coming Soon
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div style={{ 
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontWeight: '700', color: '#111827', marginBottom: '1.5rem' }}>What's Next?</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                background: '#10b981', 
                borderRadius: '50%' 
              }}></div>
              <span style={{ color: '#374151' }}>✅ Account created successfully</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                background: '#f59e0b', 
                borderRadius: '50%' 
              }}></div>
              <span style={{ color: '#374151' }}>🚧 Project management (coming soon)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                background: '#f59e0b', 
                borderRadius: '50%' 
              }}></div>
              <span style={{ color: '#374151' }}>🚧 Task management (coming soon)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                background: '#f59e0b', 
                borderRadius: '50%' 
              }}></div>
              <span style={{ color: '#374151' }}>🚧 Real-time collaboration (coming soon)</span>
            </div>
          </div>
        </div>
      </main>

      {/* Add spinning animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;