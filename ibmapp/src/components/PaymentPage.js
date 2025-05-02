import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

function PaymentPage() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    accountNumber: '',
    phoneNumber: '',
    email: user?.email || '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate form data
    const { name, accountNumber, phoneNumber, email, address } = formData;
    if (!name || !accountNumber || !phoneNumber || !email || !address) {
      setError('All fields are required.');
      return;
    }

    // Simulate payment processing
    try {
      // Assuming the pending purchase is stored in localStorage
      const pendingPurchase = JSON.parse(localStorage.getItem('pendingPurchase'));
      if (!pendingPurchase) {
        setError('No pending purchase found.');
        return;
      }

      const { type, id, quantity } = pendingPurchase;
      const endpoint = type === 'product' ? `/api/products/${id}/buy` : `/api/services/${id}/buy`;

      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });

      const data = await response.json();
      if (!data.success) {
        setError(data.error || 'Payment processing failed.');
        return;
      }

      // Clear pending purchase and show success
      localStorage.removeItem('pendingPurchase');
      setSuccess(true);

      // Optionally, you could save payment details to a new table (e.g., payments)
      // For simplicity, we're assuming the transaction is already recorded in the backend

    } catch (err) {
      setError('Failed to process payment. Please try again.');
      console.error('Payment error:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const containerStyle = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    backgroundColor: '#f4f4f9',
    minHeight: '100vh'
  };

  const formStyle = {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
    marginBottom: '20px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ddd'
  };

  const buttonStyle = {
    padding: '12px 25px',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    margin: '10px 5px'
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Payment Details</h2>
      
      {success ? (
        <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#e6f7e6', borderRadius: '8px' }}>
          <h3>Payment Successful!</h3>
          <p>Thank you for your purchase. Your transaction has been recorded.</p>
          <button
            onClick={() => navigate('/products')}
            style={{ ...buttonStyle, backgroundColor: '#4CAF50', color: 'white' }}
          >
            Back to Products
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={formStyle}>
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          
          <div>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
          </div>
          
          <div>
            <label>Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
          </div>
          
          <div>
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
          </div>
          
          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
          </div>
          
          <div>
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              style={{ ...buttonStyle, backgroundColor: '#4CAF50', color: 'white' }}
            >
              Submit Payment
            </button>
            <button
              onClick={handleLogout}
              style={{ ...buttonStyle, backgroundColor: '#FF4444', color: 'white' }}
            >
              Logout
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default PaymentPage;