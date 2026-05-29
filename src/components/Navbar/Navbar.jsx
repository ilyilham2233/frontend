import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiLogIn, FiLogOut, FiShoppingBag, FiShoppingCart, FiUser,
} from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = ({
  variant = 'default',
  brand = 'khayrat bladi',
  brandTo = '/home',
  isAuthenticated = false,
  user,
  onLogout,
  links,
  fixed = false,
}) => {

  // ── Scroll state (actif uniquement si fixed) ──
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    if (!fixed) return;
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [fixed]);

  // ── Classes dynamiques ──
  const baseClass =
    variant === 'honey'       ? 'honey-nav' :
    variant === 'transparent' ? 'honey-nav navbar-transparent' :
    'navbar';

  const navClassName = [
    baseClass,
    fixed            ? 'navbar-fixed'  : '',
    fixed && scrolled ? 'navbar-scrolled' : '',
  ].filter(Boolean).join(' ');

  const brandClassName =
    (variant === 'honey' || variant === 'transparent')
      ? 'honey-brand'
      : 'navbar-brand';

  const brandTextClassName =
    (variant === 'honey' || variant === 'transparent')
      ? 'honey-brand-text'
      : 'brand-text';

  // ── Cart count ──
  let cartCount = 0;
  try {
    const cart = useCart();
    cartCount = cart.cartCount || 0;
  } catch (_) {}

  // ── Links par défaut ──
  const defaultLinks = isAuthenticated
    ? [
        { to: '/products', label: 'Produits',                icon: <FiShoppingBag /> },
        { to: '/profile',  label: user?.prenom || 'Profil',  icon: <FiUser /> },
        onLogout && {
          type: 'button',
          label: 'Deconnexion',
          icon: <FiLogOut />,
          onClick: onLogout,
        },
      ].filter(Boolean)
    : [
        { to: '/login', label: 'Connexion', icon: <FiLogIn /> },
      ];

  const items = links || defaultLinks;

  // ── Render ──
  return (
    <nav className={navClassName}>
      <Link to={brandTo} className={brandClassName}>
        <span className={brandTextClassName}>{brand}</span>
      </Link>

      <div className="navbar-links">
        {items.map((item, index) => {
          const isCart = item.to === '/cart' || item.iconName === 'cart';
          const icon   = isCart ? <FiShoppingCart /> : item.icon;

          if (item.type === 'button') {
            return (
              <button
                key={`${item.label}-${index}`}
                type="button"
                onClick={item.onClick}
                className={item.className || 'nav-link nav-btn'}
              >
                {icon}
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={`${item.to}-${index}`}
              to={item.to}
              className={item.className || 'nav-link'}
              id={item.id}
            >
              {isCart ? (
                <span className="nav-cart-wrap">
                  <FiShoppingCart />
                  {cartCount > 0 && (
                    <span className="nav-cart-badge">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </span>
              ) : icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;