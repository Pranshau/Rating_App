import React, { useState } from 'react';
import { register, registerOwner } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); 
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);

    if (!name || !email || !password) {
      setLoading(false);
      return setErr('Please fill in all required fields.');
    }

    // Choose API based on role
    let apiCall;
    if (role === 'owner') apiCall = registerOwner;
    else apiCall = register; 

    try {
      const res = await apiCall({ name, email, address, password });

      if (res.error) {
        setErr(res.error);
      } else if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));

        // Redirect based on role
        switch (res.user.role) {
          case 'owner':
            navigate('/owner/dashboard');
            break;
          default:
            navigate('/stores');
        }
      } else {
        setErr('Unexpected response from server.');
      }
    } catch (error) {
      console.error(error);
      setErr('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          Create Account
        </h2>

        {err && (
          <div
            style={{
              color: 'red',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            {err}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                marginTop: '5px',
                fontSize: '16px',
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                marginTop: '5px',
                fontSize: '16px',
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                marginTop: '5px',
                fontSize: '16px',
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                marginTop: '5px',
                fontSize: '16px',
              }}
            />
          </div>
          

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#4f46e5',
              color: 'white',
              fontSize: '16px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background 0.3s',
            }}
            onMouseOver={(e) => (e.target.style.background = '#4338ca')}
            onMouseOut={(e) => (e.target.style.background = '#4f46e5')}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#555' }}>
          Already have an account?{' '}
          <span
            style={{ color: '#4f46e5', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
