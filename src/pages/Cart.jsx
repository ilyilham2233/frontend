import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiArrowRight, FiUser, FiLogOut } from 'react-icons/fi';
import { updateCart, removeFromCart } from '../api/catalogue';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { logout, user } = useAuth();
  const { cartItems: cart, setCartItems, refreshCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchCart = useCallback(() => {
    setLoading(true);
    setError('');
    refreshCart()
      .catch((err) => setError(err.response?.data?.message || 'Impossible de charger le panier.'))
      .finally(() => setLoading(false));
  }, [refreshCart]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleUpdate = async (articleId, newQty) => {
    if (newQty < 1) return;
    setUpdating(articleId);
    try {
      await updateCart(articleId, newQty);
      setCartItems(cart.map(item =>
        item.id === articleId ? { ...item, quantite: newQty } : item
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur mise à jour.');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (articleId) => {
    setUpdating(articleId);
    try {
      await removeFromCart(articleId);
      setCartItems(cart.filter(item => item.id !== articleId));
    } catch {
      setError('Erreur suppression.');
    } finally {
      setUpdating(null);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.produit?.prix || 0) * item.quantite, 0);

  return (
    <div className="cart-page">
      {/* Navbar */}
      <nav className="honey-nav">
        <Link to="/products" className="honey-brand">
          <span className="honey-brand-icon">🍯</span>
          <span className="honey-brand-text">Maison du Miel</span>
        </Link>
        <div className="navbar-links">
          <Link to="/profile" className="nav-link"><FiUser /> {user?.prenom || 'Profil'}</Link>
          <button onClick={logout} className="nav-link nav-btn"><FiLogOut /> Déconnexion</button>
        </div>
      </nav>

      <div className="cart-container">
        <div className="cart-header">
          <h1><FiShoppingCart /> Mon Panier</h1>
          <Link to="/products" className="cart-back-link">
            <FiArrowLeft /> Continuer mes achats
          </Link>
        </div>

        {error && <div className="cart-alert cart-alert-error">{error}</div>}

        {loading ? (
          <div className="cart-loading">
            {[1,2,3].map(i => <div key={i} className="cart-skeleton" />)}
          </div>
        ) : cart.length === 0 ? (
          <div className="cart-empty">
            <span>🛒</span>
            <p>Votre panier est vide.</p>
            <Link to="/products" className="cart-btn-primary">Voir les produits</Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Articles */}
            <div className="cart-items">
              {cart.map(item => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-img">
                    <img
                      src={item.produit?.image_url || `${process.env.PUBLIC_URL}/images/honey-pure.png`}
                      alt={item.produit?.nom}
                      onError={e => { e.target.src = `${process.env.PUBLIC_URL}/images/honey-pure.png`; }}
                    />
                  </div>
                  <div className="cart-item-info">
                    <h3>{item.produit?.nom}</h3>
                    <p className="cart-item-category">{item.produit?.categorie?.nom}</p>
                    <p className="cart-item-price">{item.produit?.prix} DH / unité</p>
                  </div>
                  <div className="cart-item-qty">
                    <button
                      className="qty-btn"
                      onClick={() => handleUpdate(item.id, item.quantite - 1)}
                      disabled={updating === item.id || item.quantite <= 1}
                    >
                      <FiMinus />
                    </button>
                    <span className="qty-value">
                      {updating === item.id ? '...' : item.quantite}
                    </span>
                    <button
                      className="qty-btn"
                      onClick={() => handleUpdate(item.id, item.quantite + 1)}
                      disabled={updating === item.id}
                    >
                      <FiPlus />
                    </button>
                  </div>
                  <div className="cart-item-subtotal">
                    {((item.produit?.prix || 0) * item.quantite).toFixed(2)} DH
                  </div>
                  <button
                    className="cart-remove-btn"
                    onClick={() => handleRemove(item.id)}
                    disabled={updating === item.id}
                    title="Supprimer"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>

            {/* Résumé */}
            <div className="cart-summary">
              <h2>Résumé de commande</h2>
              <div className="summary-rows">
                {cart.map(item => (
                  <div className="summary-row" key={item.id}>
                    <span>{item.produit?.nom} × {item.quantite}</span>
                    <span>{((item.produit?.prix || 0) * item.quantite).toFixed(2)} DH</span>
                  </div>
                ))}
              </div>
              <div className="summary-divider" />
              <div className="summary-total">
                <span>Total</span>
                <span className="summary-total-amount">{total.toFixed(2)} DH</span>
              </div>
              <button
                className="cart-btn-primary cart-checkout-btn"
                onClick={() => navigate('/checkout')}
              >
                Passer la commande <FiArrowRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
