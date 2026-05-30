import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiLogIn, FiLogOut, FiShoppingBag, FiShoppingCart, FiUser, FiChevronDown,
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
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  let baseClass = 'navbar';
  if (variant === 'honey') baseClass = 'honey-nav';
  if (variant === 'transparent') baseClass = 'honey-nav navbar-transparent';

  const brandClassName     = (variant === 'honey' || variant === 'transparent') ? 'honey-brand' : 'navbar-brand';
  const brandTextClassName = (variant === 'honey' || variant === 'transparent') ? 'honey-brand-text' : 'brand-text';

  let cartCount = 0;
  try {
    const cart = useCart();
    cartCount = cart.cartCount || 0;
  } catch (_) {}

  const defaultLinks = isAuthenticated
    ? [
        { to: '/products', label: 'Produits', icon: <FiShoppingBag /> },
        { to: '/profile',  label: user?.prenom || 'Profil', icon: <FiUser /> },
        onLogout && { type: 'button', label: 'Deconnexion', icon: <FiLogOut />, onClick: onLogout },
      ].filter(Boolean)
    : [{ to: '/login', label: 'Connexion', icon: <FiLogIn /> }];

  const items = links || defaultLinks;

  return (
    <nav className={baseClass}>
      <Link to={brandTo} className={brandClassName}>
        <span className={brandTextClassName}>{brand}</span>
      </Link>
      <div className="navbar-links">
        {items.map((item, index) => {
          const isCart = item.to === '/cart' || item.iconName === 'cart';
          const icon   = isCart ? <FiShoppingCart /> : item.icon;
          const hasDropdown = item.dropdown && item.dropdown.length > 0;

          if (item.type === 'button') {
            return (
              <button
                key={`${item.label}-${index}`}
                type="button"
                onClick={item.onClick}
                className={item.className || 'nav-link nav-btn'}
              >
                {icon}<span>{item.label}</span>
              </button>
            );
          }

          if (hasDropdown) {
            return (
              <div
                key={`${item.to}-${index}`}
                className="nav-dropdown-wrap"
                onMouseEnter={() => setOpenDropdown(index)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link to={item.to} className="nav-link nav-link-dropdown">
                  {icon}
                  <span>{item.label}</span>
                  <FiChevronDown className={`nav-chevron${openDropdown === index ? ' open' : ''}`} />
                </Link>
                {openDropdown === index && (
                  <div className="nav-dropdown">
                    {item.dropdown.map((sub, si) => (
                      sub.type === 'button' ? (
                        <button
                          key={si}
                          type="button"
                          className="nav-dropdown-item"
                          onClick={() => { sub.onClick(); setOpenDropdown(null); }}
                        >
                          {sub.icon && <span className="nav-dd-icon">{sub.icon}</span>}
                          <span>{sub.label}</span>
                        </button>
                      ) : (
                        <Link
                          key={si}
                          to={sub.to}
                          className="nav-dropdown-item"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {sub.icon && <span className="nav-dd-icon">{sub.icon}</span>}
                          <span>{sub.label}</span>
                        </Link>
                      )
                    ))}
                  </div>
                )}
              </div>
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