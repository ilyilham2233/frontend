import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiLogOut, FiShoppingCart, FiUser, FiShoppingBag, FiPackage } from 'react-icons/fi';import { removeFromCart, updateCart } from '../../api/catalogue';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { CartItem, CartSummary, Navbar } from '../../components';
import './Cart.css';

const Cart = () => {
  const { logout, user } = useAuth();
  const { cartItems: cart, setCartItems, refreshCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchCart = useCallback(() => {
    setLoading(true);
    setError('');
    refreshCart()
      .catch((err) => setError(err.response?.data?.message || 'Impossible de charger le panier.'))
      .finally(() => setLoading(false));
  }, [refreshCart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdate = async (articleId, newQty) => {
    if (newQty < 1) return;
    setUpdating(articleId);
    try {
      await updateCart(articleId, newQty);
      setCartItems(cart.map((item) =>
        item.id === articleId ? { ...item, quantite: newQty } : item
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur mise a jour.');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (articleId) => {
    setUpdating(articleId);
    try {
      await removeFromCart(articleId);
      setCartItems(cart.filter((item) => item.id !== articleId));
    } catch {
      setError('Erreur suppression.');
    } finally {
      setUpdating(null);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.produit?.prix || 0) * item.quantite, 0);

  return (
    <div className="cart-page">
      <Navbar
  variant="default"
  brand="Khayrat Bladi"
  brandTo="/home"
  links={[
    { to: '/home',     label: 'Accueil',      icon: <FiShoppingBag /> },
    { to: '/products', label: 'Produits',     icon: <FiShoppingBag /> },
    { to: '/orders',   label: 'Commandes',    icon: <FiPackage /> },
    { to: '/cart',     label: 'Panier',       icon: <FiShoppingCart /> },
  ]}
  rightLinks={[
    { to: '/profile',  label: 'Profil',       icon: <FiUser /> },
    { type: 'button',  label: 'Déconnexion',  icon: <FiLogOut />, onClick: logout },
  ]}
/>

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
            {[1, 2, 3].map((index) => <div key={index} className="cart-skeleton" />)}
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
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  updating={updating}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            <CartSummary
              cart={cart}
              total={total}
              onCheckout={() => navigate('/checkout')}
              actionLabel="Passer la commande"
              actionIcon={<FiArrowRight />}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
