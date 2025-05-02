import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

function ServiceList() {
  const { user, token } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/api/services')
      .then(response => response.json())
      .then(data => setServices(data))
      .catch(err => setError('Failed to fetch services'));
  }, []);

  const handleBuy = async (serviceId, quantity) => {
    if (!user) {
      // Store the intended purchase in localStorage to resume after login
      localStorage.setItem('pendingPurchase', JSON.stringify({ type: 'service', id: serviceId, quantity }));
      navigate('/signin');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/services/${serviceId}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });
      const data = await response.json();
      if (data.success) {
        alert('Service purchased successfully!');
      } else {
        setError(data.error || 'Failed to purchase service');
      }
    } catch (err) {
      setError('Failed to purchase service');
    }
  };

  return (
    <div>
      <h3>Services</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {services.map(service => (
          <li key={service.id}>
            {service.name} - ${service.price}
            <button
              onClick={() => handleBuy(service.id, 1)}
              style={{ marginLeft: '10px', padding: '5px 10px' }}
            >
              Buy
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ServiceList;