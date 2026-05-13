import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLogOut, FiShield, FiMail, FiShoppingBag, FiLogIn } from 'react-icons/fi';

const Home = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="page-wrapper home-wallpaper" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/honey-hero.png)` }}>
      {/* Navbar */}
      <nav className="navbar" id="main-navbar">
        <Link to="/home" className="navbar-brand">
          <span className="brand-text">Maison du Miel</span>
        </Link>
        <div className="navbar-links">
          <Link to="/products" className="nav-link" id="nav-products">
            <FiShoppingBag />
            <span>Produits</span>
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="nav-link" id="nav-profile">
                <FiUser />
                <span>Profil</span>
              </Link>
              <button onClick={logout} className="nav-link nav-btn" id="nav-logout">
                <FiLogOut />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" id="nav-login"><FiLogIn /> Se connecter</Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="nav-register">Créer un compte</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero section */}
      <section
        className="hero"
        id="hero-section"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/honey-hero.png)` }}
      >
        <div className="hero-bg">
          <div className="hero-shape hero-shape-1" />
          <div className="hero-shape hero-shape-2" />
          <div className="hero-shape hero-shape-3" />
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            {isAuthenticated
              ? `Bienvenue, ${user?.name || 'Utilisateur'} 👋`
              : 'Des miels d\'exception, récoltés avec passion'}
          </h1>
          <p className="hero-subtitle">
            {isAuthenticated
              ? 'Explorez notre catalogue de miels artisanaux et gérez votre profil.'
              : 'Découvrez notre sélection de miels artisanaux 100% naturels. Du producteur à votre table.'}
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <>
                <Link to="/products" className="btn btn-primary" id="hero-products">
                  <span className="btn-content">
                    <FiShoppingBag />
                    Nos Produits
                  </span>
                </Link>
                <Link to="/profile" className="btn btn-glass" id="hero-profile">
                  <span className="btn-content">
                    <FiUser />
                    Mon Profil
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary" id="hero-register">
                  <span className="btn-content">Commencer</span>
                </Link>
                <Link to="/products" className="btn btn-glass" id="hero-browse">
                  <span className="btn-content">
                    <FiShoppingBag />
                    Voir les produits
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="features" id="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><FiShield /></div>
            <h3>100% Naturel</h3>
            <p>Nos miels sont récoltés sans additifs ni traitements. Un produit pur directement de la ruche.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FiUser /></div>
            <h3>Artisanal</h3>
            <p>Chaque pot est le fruit du savoir-faire de nos apiculteurs passionnés depuis des générations.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FiMail /></div>
            <h3>Livraison Rapide</h3>
            <p>Commandez en ligne et recevez vos miels directement chez vous, partout au Maroc.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
