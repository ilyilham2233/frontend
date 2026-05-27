import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiLogIn,
  FiLogOut,
  FiShoppingBag,
  FiShoppingCart,
  FiUser,
} from 'react-icons/fi';
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
  const navClassName = variant === 'honey' ? 'honey-nav' : 'navbar';
  const brandClassName = variant === 'honey' ? 'honey-brand' : 'navbar-brand';
  const brandTextClassName = variant === 'honey' ? 'honey-brand-text' : 'brand-text';

  const defaultLinks = isAuthenticated
    ? [
        { to: '/products', label: 'Produits', icon: <FiShoppingBag /> },
        { to: '/profile', label: user?.prenom || 'Profil', icon: <FiUser /> },
        onLogout && { type: 'button', label: 'Deconnexion', icon: <FiLogOut />, onClick: onLogout },
      ].filter(Boolean)
    : [
        { to: '/login', label: 'Connexion', icon: <FiLogIn /> },
      ];

  const items = links || defaultLinks;

  return (
    <nav className={navClassName}>
      <Link to={brandTo} className={brandClassName}>
        <span className={brandTextClassName}>{brand}</span>
      </Link>

      <div className="navbar-links">
        {items.map((item, index) => {
          const icon = item.iconName === 'cart' ? <FiShoppingCart /> : item.icon;

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
              {icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
