import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';
import './Footer.css';

const Footer = ({ brand = 'Khayrat Bladi' }) => (
  <footer className="footer">
    <div className="footer-inner">

      {/* ── Brand ── */}
      <div className="footer-col">
        <h3 className="footer-brand">{brand}</h3>
        <p className="footer-desc">
          Le meilleur du terroir marocain, récolté avec passion et livré directement chez vous.
        </p>
        <div className="footer-socials">
          <a href="#" className="footer-social"><FiInstagram /></a>
          <a href="#" className="footer-social"><FiFacebook /></a>
          <a href="#" className="footer-social"><FiTwitter /></a>
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="footer-col">
        <h4 className="footer-col-title">Navigation</h4>
        <ul className="footer-links">
          <li><Link to="/home">Accueil</Link></li>
          <li><Link to="/products">Produits</Link></li>
          <li><Link to="/profile">Mon Profil</Link></li>
          <li><Link to="/orders">Mes Commandes</Link></li>
          <li><Link to="/cart">Panier</Link></li>
        </ul>
      </div>

      {/* ── Contact ── */}
      <div className="footer-col">
        <h4 className="footer-col-title">Contact</h4>
        <ul className="footer-links">
          <li><FiMail size={13} /> khayratbladi568@gmail.com</li>
          <li><FiPhone size={13} /> +212 781 036 015</li>
          <li><FiMapPin size={13} /> Casablanca, Maroc</li>
        </ul>
      </div>

    </div>

    {/* ── Bottom ── */}
    <div className="footer-bottom">
      <p>© 2026 {brand} — Tous droits réservés</p>
    </div>
  </footer>
);

export default Footer;