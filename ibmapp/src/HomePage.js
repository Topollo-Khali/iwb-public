import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './components/AuthContext';
import ProductList from './components/ProductList';
import ServiceList from './components/ServiceList';
import QueryForm from './components/QueryForm';

function HomePage() {
  const { user, logout } = useContext(AuthContext);
  const [view, setView] = useState('welcome'); // 'welcome', 'products', 'services', 'queries'
  const navigate = useNavigate();

  // Decode token to get user role
  const token = localStorage.getItem('token');
  const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Invalid token:', e);
      return null;
    }
  };
  const userRole = decodeToken(token)?.role;

  // Common styles
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    backgroundColor: '#f4f4f9',
    minHeight: '100vh'
  };

  const headerStyle = {
    textAlign: 'center',
    fontSize: '2.5rem',
    color: '#333',
    marginBottom: '20px',
    fontWeight: 'bold',
    letterSpacing: '1px'
  };

  const navStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '30px',
    flexWrap: 'wrap'
  };

  const navLinkStyle = {
    padding: '10px 20px',
    fontSize: '1rem',
    textDecoration: 'none',
    color: '#333',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    fontWeight: '600',
    border: '2px solid #4CAF50',
    backgroundColor: '#ffffff'
  };

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '30px',
    flexWrap: 'wrap'
  };

  const buttonStyle = {
    padding: '12px 25px',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    fontWeight: '600',
    backgroundColor: '#4CAF50',
    color: 'white'
  };

  const sectionStyle = {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
    marginBottom: '40px'
  };

  const sectionHeaderStyle = {
    fontSize: '2rem',
    marginBottom: '20px',
    color: '#222',
    borderBottom: '2px solid #eee',
    paddingBottom: '10px'
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleLogout = () => {
    logout();
    setView('welcome');
    navigate('/');
  };

  return (
    <div style={containerStyle}>
      {/* Navigation */}
      <nav style={navStyle}>
        {user ? (
          <>
            <span
              style={{ ...navLinkStyle, backgroundColor: '#4CAF50', color: 'white' }}
            >
              Welcome, {user.email}
            </span>
            {['finance', 'investor'].includes(userRole) && (
              <Link to="/finance" style={{ ...navLinkStyle, backgroundColor: '#FF9800', color: 'white', border: '2px solid #FF9800' }}>
                Finance Dashboard
              </Link>
            )}
            <button
              onClick={handleLogout}
              style={{ ...navLinkStyle, backgroundColor: '#FF4444', color: 'white', border: 'none' }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/signin" style={navLinkStyle}>Sign In to Buy</Link>
        )}
      </nav>

      {/* Main Header */}
      <h1 style={headerStyle}>Welcome to the IWB Customer Portal</h1>

      {/* Welcome Message */}
      {view === 'welcome' && (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
            maxWidth: '800px',
            margin: '0 auto'
          }}
        >
          <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
            Hello! We're glad to have you here. Use the buttons below to explore our products, services, or get in touch with us.
          </p>
          <div style={buttonContainerStyle}>
            <button
              onClick={() => handleViewChange('products')}
              style={buttonStyle}
            >
              View Products
            </button>
            <button
              onClick={() => handleViewChange('services')}
              style={{ ...buttonStyle, backgroundColor: '#2196F3' }}
            >
              View Services
            </button>
            <button
              onClick={() => handleViewChange('queries')}
              style={{ ...buttonStyle, backgroundColor: '#FF9800' }}
            >
              Contact Us
            </button>
          </div>
        </div>
      )}

      {/* Products Section */}
      {view === 'products' && (
        <div style={sectionStyle}>
          <h2 style={sectionHeaderStyle}>Product Portal</h2>
          <ProductList />
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={() => setView('welcome')}
              style={{
                ...buttonStyle,
                backgroundColor: '#999',
                color: 'white'
              }}
            >
              Back to Welcome
            </button>
          </div>
        </div>
      )}

      {/* Services Section */}
      {view === 'services' && (
        <div style={sectionStyle}>
          <h2 style={sectionHeaderStyle}>Service Portal</h2>
          <ServiceList />
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={() => setView('welcome')}
              style={{
                ...buttonStyle,
                backgroundColor: '#999',
                color: 'white'
              }}
            >
              Back to Welcome
            </button>
          </div>
        </div>
      )}

      {/* Queries Section */}
      {view === 'queries' && (
        <div style={sectionStyle}>
          <h2 style={sectionHeaderStyle}>Queries Portal</h2>
          <QueryForm />
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={() => setView('welcome')}
              style={{
                ...buttonStyle,
                backgroundColor: '#999',
                color: 'white'
              }}
            >
              Back to Welcome
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
        © {new Date().getFullYear()} IWB Customer Portal. All rights reserved.
      </footer>
    </div>
  );
}

export default HomePage;