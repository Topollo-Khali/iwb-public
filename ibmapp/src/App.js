import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import HomePage from './HomePage';
import Signup from './components/Signup';
import Signin from './components/Signin';
import ProductList from './components/ProductList';
import ServiceList from './components/ServiceList';
import PaymentPage from './components/PaymentPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="container">
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/services" element={<ServiceList />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
