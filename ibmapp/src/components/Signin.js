import React, { useState, useContext } from 'react';
import { AuthContext } from '../components/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Signin() {
  const { signin } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await signin(email, password);
    if (result.success) {
      alert('Login successful!');
      const pendingPurchase = JSON.parse(localStorage.getItem('pendingPurchase'));
      if (pendingPurchase) {
        navigate('/payment'); // Redirect to payment page
      } else {
        navigate('/products');
      }
    } else {
      setError(result.error || 'Sign-in failed.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Sign In</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', margin: '8px 0' }}
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', margin: '8px 0' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px', backgroundColor: '#2196F3', color: 'white' }}>
          Sign In
        </button>
      </form>
      <p style={{ marginTop: '10px' }}>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}

export default Signin;