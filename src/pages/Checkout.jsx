import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiAlertCircle, FiArrowLeft, FiShoppingBag, FiUser, FiLogOut } from 'react-icons/fi';
import { processOrder } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Checkout = () => {
  const { logout, user } = useAuth();
  const { cartItems: cart, refreshCart, setCartItems } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus]     = useState('idle'); // idle | success | error
  const [message, setMessage]   = useState('');

  useEffect(() => {
    refreshCart()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshCart]);

  const total = cart.reduce((sum, item) => sum + (item.produit?.prix || 0) * item.quantite, 0);

  const handleOrder = async () => {
    setSubmitting(true);
    setMessage('');
    try {
      const res = await processOrder();
      setStatus('success');
      setCartItems([]);
      setMessage(res.message || 'Commande passée avec succès ! Un e-mail de confirmation vous a été envoyé.');
      setTimeout(() => navigate('/orders'), 2500);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Erreur lors de la commande. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1><FiShoppingBag /> Confirmer la commande</h1>
          <Link to="/cart" className="cart-back-link">
            <FiArrowLeft /> Retour au panier
          </Link>
        </div>

        {/* Message */}
        {message && (
          <div className={`cart-alert ${status === 'success' ? 'cart-alert-success' : 'cart-alert-error'}`}>
            {status === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
            {message}
          </div>
        )}

        {loading ? (
          <div className="cart-loading">
            {[1,2].map(i => <div key={i} className="cart-skeleton" />)}
          </div>
        ) : cart.length === 0 ? (
          <div className="cart-empty">
            <span>🛒</span>
            <p>Votre panier est vide.</p>
            <Link to="/products" className="cart-btn-primary">Voir les produits</Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Récapitulatif des articles */}
            <div className="cart-items">
              <h2 className="checkout-section-title">Articles commandés</h2>
              {cart.map(item => (
                <div className="cart-item checkout-item" key={item.id}>
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
                  </div>
                  <div className="checkout-item-qty">× {item.quantite}</div>
                  <div className="cart-item-subtotal">
                    {((item.produit?.prix || 0) * item.quantite).toFixed(2)} DH
                  </div>
                </div>
              ))}
            </div>

            {/* Résumé final */}
            <div className="cart-summary">
              <h2>Récapitulatif</h2>
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Nombre d'articles</span>
                  <span>{cart.reduce((sum, i) => sum + i.quantite, 0)}</span>
                </div>
                <div className="summary-row">
                  <span>Sous-total</span>
                  <span>{total.toFixed(2)} DH</span>
                </div>
                <div className="summary-row">
                  <span>Livraison</span>
                  <span className="summary-free">Gratuite</span>
                </div>
              </div>
              <div className="summary-divider" />
              <div className="summary-total">
                <span>Total</span>
                <span className="summary-total-amount">{total.toFixed(2)} DH</span>
              </div>

              {/* Infos client */}
              <div className="checkout-client-info">
                <p><strong>Client :</strong> {user?.prenom} {user?.nom}</p>
                <p><strong>E-mail :</strong> {user?.email}</p>
              </div>

              <button
                className="cart-btn-primary cart-checkout-btn"
                onClick={handleOrder}
                disabled={submitting || status === 'success'}
              >
                {submitting ? 'Traitement...' : status === 'success' ? '✓ Commande confirmée' : 'Confirmer la commande'}
              </button>

              <p className="checkout-note">
                Un reçu PDF sera envoyé à votre adresse e-mail.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
