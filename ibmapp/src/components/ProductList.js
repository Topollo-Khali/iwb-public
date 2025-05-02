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
      // Store the intended purchase in localStorage to resume after login
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
        // Refresh products
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
      <h3>Products</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {products.map(product => (
          <li key={product.id}>
            {product.name} - ${product.price} (Stock: {product.stock_quantity})
            <button
              onClick={() => handleBuy(product.id, 1)}
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

export default ProductList;