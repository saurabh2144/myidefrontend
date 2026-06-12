import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from './config';

function Auth({ onLoginSuccess, theme }) {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let response;
      
      if (authMode === 'login') {
        response = await axios.post(`${API_URL}/auth/login`, {
          email: formData.email,
          password: formData.password
        });
      } else if (authMode === 'signup') {
        response = await axios.post(`${API_URL}/auth/signup`, {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      } else if (authMode === 'forgot') {
        response = await axios.post(`${API_URL}/auth/forgot-password`, {
          email: formData.email
        });
        setMessage(`Your password is: ${response.data.password}`);
        setLoading(false);
        return;
      }

      if (response.data.success) {
        // Save user to localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onLoginSuccess(response.data.user);
      }

    } catch (error) {
      setMessage(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme === 'light' ? '#f5f5f5' : '#1e1e1e'
    }}>
      <div style={{
        backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{
          margin: '0 0 30px 0',
          color: theme === 'light' ? '#333' : '#fff',
          textAlign: 'center',
          fontSize: '28px'
        }}>
          {authMode === 'login' ? 'Login' : authMode === 'signup' ? 'Sign Up' : 'Forgot Password'}
        </h1>

        <form onSubmit={handleSubmit}>
          {authMode === 'signup' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: theme === 'light' ? '#666' : '#aaa',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${theme === 'light' ? '#ddd' : '#444'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: theme === 'light' ? '#fff' : '#1e1e1e',
                  color: theme === 'light' ? '#333' : '#ddd',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: theme === 'light' ? '#666' : '#aaa',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${theme === 'light' ? '#ddd' : '#444'}`,
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: theme === 'light' ? '#fff' : '#1e1e1e',
                color: theme === 'light' ? '#333' : '#ddd',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {authMode !== 'forgot' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: theme === 'light' ? '#666' : '#aaa',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
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
                  padding: '12px',
                  border: `1px solid ${theme === 'light' ? '#ddd' : '#444'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: theme === 'light' ? '#fff' : '#1e1e1e',
                  color: theme === 'light' ? '#333' : '#ddd',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {message && (
            <div style={{
              padding: '12px',
              marginBottom: '20px',
              borderRadius: '8px',
              backgroundColor: message.includes('success') || message.includes('password is') 
                ? (theme === 'light' ? '#d4edda' : '#1e4620')
                : (theme === 'light' ? '#f8d7da' : '#5c1a1a'),
              color: message.includes('success') || message.includes('password is')
                ? (theme === 'light' ? '#155724' : '#c3e6cb')
                : (theme === 'light' ? '#721c24' : '#f5c6cb'),
              fontSize: '13px'
            }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '15px'
            }}
          >
            {loading ? 'Please wait...' : authMode === 'login' ? 'Login' : authMode === 'signup' ? 'Sign Up' : 'Recover Password'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          {authMode === 'login' && (
            <>
              <p style={{
                margin: '10px 0',
                color: theme === 'light' ? '#666' : '#aaa',
                fontSize: '14px'
              }}>
                Don't have an account?{' '}
                <span
                  onClick={() => setAuthMode('signup')}
                  style={{ color: '#4CAF50', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Sign Up
                </span>
              </p>
              <p style={{
                margin: '10px 0',
                color: theme === 'light' ? '#666' : '#aaa',
                fontSize: '14px'
              }}>
                <span
                  onClick={() => setAuthMode('forgot')}
                  style={{ color: '#2196F3', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Forgot Password?
                </span>
              </p>
            </>
          )}

          {authMode === 'signup' && (
            <p style={{
              margin: '10px 0',
              color: theme === 'light' ? '#666' : '#aaa',
              fontSize: '14px'
            }}>
              Already have an account?{' '}
              <span
                onClick={() => setAuthMode('login')}
                style={{ color: '#4CAF50', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Login
              </span>
            </p>
          )}

          {authMode === 'forgot' && (
            <p style={{
              margin: '10px 0',
              color: theme === 'light' ? '#666' : '#aaa',
              fontSize: '14px'
            }}>
              <span
                onClick={() => setAuthMode('login')}
                style={{ color: '#4CAF50', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Back to Login
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;
