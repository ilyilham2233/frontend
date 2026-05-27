import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiShoppingCart } from 'react-icons/fi';
import Particles from '../Particles/Particles';

const ProductsHero = ({ heroRef, contentRef }) => (
  <section className="honey-hero hero-video-section" ref={heroRef}>
    <video className="hero-video-bg" autoPlay muted loop playsInline>
      <source src={`${process.env.PUBLIC_URL}/images/video 2.mp4`} type="video/mp4" />
    </video>

    <div className="hero-video-overlay" />
    <Particles />

    <div className="honey-hero-content hero-parallax-content" ref={contentRef}>
      <span className="honey-hero-tag hero-tag-animated">
        Artisanal &amp; 100% Naturel
      </span>

      <h1 className="hero-title-animated">
        Decouvrez nos miels<br />
        <span className="honey-gold hero-gold-shine">d'exception</span>
      </h1>

      <p className="hero-desc-animated">
        Des miels purs, recoltes avec passion dans les plus belles regions.<br />
        Du producteur directement a votre table.
      </p>

      <div className="hero-cta-group">
        <a href="#products-section" className="btn honey-btn-primary hero-btn-pulse">
          <span className="btn-content">
            <FiShoppingCart /> Voir les produits
          </span>
        </a>
        <Link to="/register" className="hero-btn-secondary">
          Creer un compte
        </Link>
      </div>
    </div>

    <a href="#products-section" className="hero-scroll-indicator" aria-label="Defiler">
      <FiChevronDown />
    </a>
  </section>
);

export default ProductsHero;
