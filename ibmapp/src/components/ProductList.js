import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

function ProductList() {
  const { user, token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/api/products')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(err => setError('Failed to fetch products'));
  }, []);

  const handleBuy = async (productId, quantity) => {
    if (!user) {
      localStorage.setItem('pendingPurchase', JSON.stringify({ type: 'product', id: productId, quantity }));
      navigate('/signin');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/products/${productId}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });
      const data = await response.json();
      if (data.success) {
        alert('Product purchased successfully!');
        fetch('http://localhost:3001/api/products')
          .then(response => response.json())
          .then(data => setProducts(data));
      } else {
        setError(data.error || 'Failed to purchase product');
      }
    } catch (err) {
      setError('Failed to purchase product');
    }
  };

  return (
    <div>
      <h3 style={{ color: '#fff', textAlign: 'center', padding: '10px' }}>Products</h3>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', padding: '20px' }}>
        {products.map(product => {
          let productImage = '/default-product.png';
          const nameLower = product.name.toLowerCase();
          if (nameLower.includes('hard drive')) productImage = '/hard-drive.png';
          else if (nameLower.includes('cpu')) productImage = '/images/CPU.png';
          else if (nameLower.includes('motherboard')) productImage = '/images/Motherboard.png';
          else if (nameLower.includes('nic')) productImage = '/images/NICs.png';
          else if (nameLower.includes('optical drive')) productImage = '/images/OpticalCables.png';
          else if (nameLower.includes('psu')) productImage = '/images/PSUs.png';
          else if (nameLower.includes('gpu')) productImage = '/images/GPUs.png';

          return (
            <div
              key={product.id}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '10px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                textAlign: 'center',
                transition: 'transform 0.3s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <img
                src={productImage}
                alt={product.name}
                style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '5px' }}
              />
              <h4 style={{ color: '#fff', margin: '5px 0', fontSize: '16px' }}>{product.name}</h4>
              <p style={{ color: '#fbcf34', fontSize: '14px', margin: '3px 0' }}>
                M{product.price.toFixed(2)}
              </p>
              <p style={{ color: '#fff', fontSize: '12px', margin: '3px 0' }}>
                Stock: {product.stock_quantity}
              </p>
              <button
                onClick={() => handleBuy(product.id, 1)}
                style={{ marginTop: '5px', padding: '5px 10px', background: '#24cf5f', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                Buy
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProductList;