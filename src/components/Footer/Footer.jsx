import React from 'react';
import './Footer.css';

const Footer = ({ brand = 'khayrat bladi' }) => (
  <footer className="honey-footer">
    <div className="honey-footer-inner">
      <div className="honey-footer-brand">
        <span>{brand}</span>
      </div>
      <p>© 2026 {brand} - Tous droits reserves</p>
    </div>
  </footer>
);

export default Footer;
