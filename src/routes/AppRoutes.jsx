import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Cart from '../pages/Cart/Cart';
import Checkout from '../pages/Checkout/Checkout';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword';
import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import OrderHistory from '../pages/Orders/OrderHistory';
import Products from '../pages/Products/Products';
import Profile from '../pages/Profile/Profile';
import Register from '../pages/Register/Register';
import ResetToken from '../pages/ResetPassword/ResetToken';
import VerifyEmail from '../pages/VerifyEmail/VerifyEmail';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';
import Dashboard from '../pages/Dashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import LivreurDashboard from '../pages/livreur/livreurdashboard.jsx';
import LivreurHistorique from '../pages/livreur/LivreurHistorique';
import VendeurDashboard from '../pages/vendeur/VendeurDashboard';
import { Footer } from '../components';

const AppRoutes = () => (
  <>
    <Routes>
      <Route path="/login"                 element={<Login />} />
      <Route path="/register"              element={<Register />} />
      <Route path="/forgot-password"       element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetToken />} />
      <Route path="/verify/:id/:hash"      element={<VerifyEmail />} />
      <Route path="/products"              element={<Products />} />
      <Route path="/home"                  element={<Home />} />
      <Route path="/profile"               element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/verify-email"          element={<PrivateRoute><VerifyEmail /></PrivateRoute>} />
      <Route path="/cart"                  element={<PrivateRoute><Cart /></PrivateRoute>} />
      <Route path="/checkout"              element={<PrivateRoute><Checkout /></PrivateRoute>} />
      <Route path="/orders"                element={<PrivateRoute><OrderHistory /></PrivateRoute>} />

      {/* Vendeur */}
     <Route path="/vendeur/dashboard" element={
  <RoleRoute role="vendeur"><VendeurDashboard/></RoleRoute>
} />
      {/* Livreur */}
<Route path="/livreur/historique" element={<RoleRoute role="livreur"><LivreurHistorique /></RoleRoute>} />
      <Route path="*"                   element={<Navigate to="/home" replace />} />
<Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
<Route path="/livreur/dashboard"  element={<RoleRoute role="livreur"><LivreurDashboard /></RoleRoute>} />
<Route path="/admin/dashboard" element={<RoleRoute role="admin"><AdminDashboard/></RoleRoute>} />

    </Routes>
    <Footer brand="Khayrat Bladi" />
  </>
);

export default AppRoutes;
