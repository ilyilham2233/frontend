import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft, FiCheckCircle, FiLogOut, FiShoppingBag, FiUser } from 'react-icons/fi';
import { processOrder } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CheckoutItem, Navbar } from '../components';
import './Cart.css';

const Checkout = () => {
  const { logout, user } = useAuth();
  const { cartItems: cart, refreshCart, setCartItems } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

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
      setMessage(res.message || 'Commande passee avec succes ! Un e-mail de confirmation vous a ete envoye.');
      setTimeout(() => navigate('/orders'), 2500);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Erreur lors de la commande. Reessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cart-page">
      <Navbar
        variant="honey"
        brandTo="/products"
        links={[
          { to: '/profile', label: user?.prenom || 'Profil', icon: <FiUser /> },
          { type: 'button', label: 'Deconnexion', icon: <FiLogOut />, onClick: logout },
        ]}
      />

      <div className="cart-container">
        <div className="cart-header">
          <h1><FiShoppingBag /> Confirmer la commande</h1>
          <Link to="/cart" className="cart-back-link">
            <FiArrowLeft /> Retour au panier
          </Link>
        </div>

        {message && (
          <div className={`cart-alert ${status === 'success' ? 'cart-alert-success' : 'cart-alert-error'}`}>
            {status === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
            {message}
          </div>
        )}

        {loading ? (
          <div className="cart-loading">
            {[1, 2].map((index) => <div key={index} className="cart-skeleton" />)}
          </div>
        ) : cart.length === 0 ? (
          <div className="cart-empty">
            <span>Panier</span>
            <p>Votre panier est vide.</p>
            <Link to="/products" className="cart-btn-primary">Voir les produits</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              <h2 className="checkout-section-title">Articles commandes</h2>
              {cart.map((item) => (
                <CheckoutItem key={item.id} item={item} />
              ))}
            </div>

            <div className="cart-summary">
              <h2>Recapitulatif</h2>
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Nombre d'articles</span>
                  <span>{cart.reduce((sum, item) => sum + item.quantite, 0)}</span>
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

              <div className="checkout-client-info">
                <p><strong>Client :</strong> {user?.prenom} {user?.nom}</p>
                <p><strong>E-mail :</strong> {user?.email}</p>
              </div>

              <button
                type="button"
                className="cart-btn-primary cart-checkout-btn"
                onClick={handleOrder}
                disabled={submitting || status === 'success'}
              >
                {submitting ? 'Traitement...' : status === 'success' ? 'Commande confirmee' : 'Confirmer la commande'}
              </button>

              <p className="checkout-note">
                Un recu PDF sera envoye a votre adresse e-mail.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
