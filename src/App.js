import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetToken from './pages/ResetToken';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>

          {/* Public routes */}
          <Route path="/login"                element={<Login />} />
          <Route path="/register"             element={<Register />} />
          <Route path="/forgot-password"      element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetToken />} />
          <Route path="/verify/:id/:hash"     element={<VerifyEmail />} />
          <Route path="/products"             element={<Products />} />

          {/* Protected routes */}
          <Route path="/home"     element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/profile"  element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/verify-email" element={<PrivateRoute><VerifyEmail /></PrivateRoute>} />
          <Route path="/cart"     element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/orders"   element={<PrivateRoute><OrderHistory /></PrivateRoute>} />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
