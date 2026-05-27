import React from 'react';
import { Link } from 'react-router-dom';
import { FiLogIn, FiLogOut, FiMail, FiShield, FiShoppingBag, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { FeatureCard, Navbar } from '../components';

const Home = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div
      className="page-wrapper home-wallpaper"
      style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/home2.jpeg)` }}
    >
      <Navbar
        brand="khayrat bladi"
        brandTo="/home"
        isAuthenticated={isAuthenticated}
        onLogout={logout}
        links={
          isAuthenticated
            ? [
              { to: '/ Acceuil', label: 'Acceuil', icon: <FiShoppingBag />, id: 'nav-Acceuil' },
                { to: '/products', label: 'Produits', icon: <FiShoppingBag />, id: 'nav-products' },
                 { to: '/categories', label: 'Catégories', icon: <FiShoppingBag />, id: 'nav-categories' },
                  { to: '/A propos de nos ', label: 'A propos de nos', icon: <FiShoppingBag />, id: 'nav-A propos de nos'},
                { to: '/profile', label: 'Profil', icon: <FiUser />, id: 'nav-profile' },
                { type: 'button', label: 'Deconnexion', icon: <FiLogOut />, onClick: logout },
              ]
            : [
                { to: '/products', label: 'Produits', icon: <FiShoppingBag />, id: 'nav-products' },
                { to: '/login', label: 'Se connecter', icon: <FiLogIn />, id: 'nav-login' },
                { to: '/register', label: 'Creer un compte', className: 'btn btn-primary btn-sm', id: 'nav-register' },
              ]
        }
      />

      <section
        className="hero"
        id="hero-section"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/home2.jpeg)` }}
      >
        <div className="hero-bg">
          <div className="hero-shape hero-shape-1" />
          <div className="hero-shape hero-shape-2" />
          <div className="hero-shape hero-shape-3" />
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            {isAuthenticated
              ? `Bienvenue, ${user?.name || 'Utilisateur'}`
              : "Des miels d'exception, recoltes avec passion"}
          </h1>
          <p className="hero-subtitle">
            {isAuthenticated
              ? 'Explorez notre catalogue de miels artisanaux et gerez votre profil.'
              : 'Decouvrez notre selection de miels artisanaux 100% naturels. Du producteur a votre table.'}
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

      <section className="features" id="features-section">
        <div className="features-grid">
          <FeatureCard
            icon={<FiShield />}
            title="100% Naturel"
            description="Nos miels sont recoltes sans additifs ni traitements. Un produit pur directement de la ruche."
          />
          <FeatureCard
            icon={<FiUser />}
            title="Artisanal"
            description="Chaque pot est le fruit du savoir-faire de nos apiculteurs passionnes depuis des generations."
          />
          <FeatureCard
            icon={<FiMail />}
            title="Livraison Rapide"
            description="Commandez en ligne et recevez vos miels directement chez vous, partout au Maroc."
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
