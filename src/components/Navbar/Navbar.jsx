import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiLogIn, FiLogOut, FiShoppingBag, FiShoppingCart, FiUser, FiChevronDown,
} from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = ({
  variant = 'default',
  brand = 'Khayrat Bladi',
  brandTo = '/home',
  isAuthenticated = false,
  user,
  onLogout,
  links,
  rightLinks,
  alwaysTransparent = false,
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (alwaysTransparent) return;
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [alwaysTransparent]);

  let cartCount = 0;
  try {
    const cart = useCart();
    cartCount = cart.cartCount || 0;
  } catch (_) {}

  const items = links || [];
  const rightItems = rightLinks || [];

  const renderItem = (item, index) => {
    const isCart = item.to === '/cart';
    const icon = isCart ? <FiShoppingCart /> : item.icon;
    const hasDropdown = item.dropdown && item.dropdown.length > 0;

    if (item.type === 'button') {
      return (
        <button
          key={`btn-${index}`}
          type="button"
          onClick={item.onClick}
          className="nav-link nav-btn"
        >
          {icon}<span>{item.label}</span>
        </button>
      );
    }

    if (hasDropdown) {
      return (
        <div
          key={`dd-${index}`}
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
        key={`lnk-${index}`}
        to={item.to}
        className="nav-link"
        id={item.id}
      >
        {isCart ? (
          <span className="nav-cart-wrap">
            <FiShoppingCart />
            {cartCount > 0 && (
              <span className="nav-cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
            )}
          </span>
        ) : icon}
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <nav className={`navbar${scrolled && !alwaysTransparent ? ' navbar-scrolled' : ''}`}>
      <div className="navbar-left">
        <Link to={brandTo} className="navbar-brand">
          <span className="brand-text">{brand}</span>
        </Link>
        <div className="navbar-main-links">
          {items.map((item, i) => renderItem(item, i))}
        </div>
      </div>
      <div className="navbar-right">
        {rightItems.map((item, i) => renderItem(item, i + 100))}
      </div>
    </nav>
  );
};

export default Navbar;