import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiLogIn, FiLogOut, FiMail, FiShield,
  FiShoppingBag, FiUser, FiPackage, FiStar, FiArrowRight
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components';
import { getCategories, getProducts } from '../../api/catalogue';
import './Home.css';

const Home = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories]       = useState([]);
  const [vedettes, setVedettes]           = useState([]);
  const [populaires, setPopulaires]       = useState([]);

  useEffect(() => {
    getCategories()
      .then(res => setCategories(res?.data ?? res ?? []))
      .catch(() => {});

    // Produits vedettes — les plus récents
    getProducts({ sort: 'created_at', order: 'desc', per_page: 4 })
      .then(res => {
        const payload = res?.data ?? res;
        const items = payload?.data ?? payload ?? [];
        setVedettes(Array.isArray(items) ? items.slice(0, 4) : []);
      })
      .catch(() => {});

    // Produits populaires — par prix desc
    getProducts({ sort: 'prix', order: 'desc', per_page: 4 })
      .then(res => {
        const payload = res?.data ?? res;
        const items = payload?.data ?? payload ?? [];
        setPopulaires(Array.isArray(items) ? items.slice(0, 4) : []);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="wild-page">

      {/* ── NAVBAR ── */}
      <Navbar
        variant="default"
        brand="Khayrat Bladi"
        brandTo="/home"
        isAuthenticated={isAuthenticated}
        onLogout={logout}
        links={
          isAuthenticated
            ? [
                { to: '/home',     label: 'Accueil',     icon: <FiShoppingBag /> },
                { to: '/products', label: 'Produits',    icon: <FiShoppingBag /> },
                { to: '/profile',  label: 'Profil',      icon: <FiUser /> },
                { type: 'button',  label: 'Déconnexion', icon: <FiLogOut />, onClick: logout },
              ]
            : [
                { to: '/products', label: 'Produits',     icon: <FiShoppingBag /> },
                { to: '/login',    label: 'Se connecter', icon: <FiLogIn /> },
              ]
        }
      />

      {/* ── HERO ── */}
      <section
        className="wild-hero"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/home2.jpeg)` }}
      >
        <div className="wild-overlay" />
        <div className="wild-hero-content">
          <p className="wild-eyebrow">100% Naturel · Artisanal · Marocain</p>
          <h1 className="wild-title">
            {isAuthenticated
              ? `Bienvenue,\n${user?.prenom || 'Cher client'}`
              : 'Khayrat\nBladi'}
          </h1>
          <p className="wild-subtitle">
            {isAuthenticated
              ? 'Explorez notre sélection de produits du terroir marocain.'
              : 'Le meilleur du terroir marocain,\nrécolté avec passion et tradition.'}
          </p>
          <div className="wild-actions">
            <Link to="/products" className="wild-btn-primary">
              <FiShoppingBag /> Nos Produits
            </Link>
            {isAuthenticated
              ? <Link to="/profile" className="wild-btn-ghost"><FiUser /> Mon Profil</Link>
              : <Link to="/register" className="wild-btn-ghost">Créer un compte</Link>
            }
          </div>
        </div>

        {/* ── STATS BAR ── */}
        <div className="wild-stats">
          <div className="wild-stat">
            <span className="wild-stat-val">⭐ 4.9</span>
            <span className="wild-stat-lbl">Note moyenne</span>
          </div>
          <div className="wild-stat-sep" />
          <div className="wild-stat">
            <span className="wild-stat-val">5K+</span>
            <span className="wild-stat-lbl">Clients satisfaits</span>
          </div>
          <div className="wild-stat-sep" />
          <div className="wild-stat">
            <span className="wild-stat-val">100%</span>
            <span className="wild-stat-lbl">Naturel & Certifié</span>
          </div>
          <div className="wild-stat-sep" />
          <div className="wild-stat">
            <span className="wild-stat-val">48h</span>
            <span className="wild-stat-lbl">Livraison rapide</span>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="wild-features">
        <div className="wild-features-grid">
          <div className="wild-feat">
            <div className="wild-feat-icon"><FiShield /></div>
            <h3>100% Naturel</h3>
            <p>Sans additifs ni traitements. Un produit pur directement de la nature.</p>
          </div>
          <div className="wild-feat">
            <div className="wild-feat-icon"><FiUser /></div>
            <h3>Artisanal</h3>
            <p>Savoir-faire transmis de génération en génération par nos producteurs.</p>
          </div>
          <div className="wild-feat">
            <div className="wild-feat-icon"><FiPackage /></div>
            <h3>Livraison Rapide</h3>
            <p>Recevez vos produits directement chez vous, partout au Maroc.</p>
          </div>
          <div className="wild-feat">
            <div className="wild-feat-icon"><FiMail /></div>
            <h3>Service Client</h3>
            <p>Notre équipe est disponible pour répondre à toutes vos questions.</p>
          </div>
        </div>
      </section>

      {/* ── À PROPOS ── */}
      <section className="wild-about">
        <div className="wild-about-inner">
          <div className="wild-about-text">
            <p className="wild-section-eyebrow">Notre Histoire</p>
            <h2 className="wild-section-title">À Propos de Khayrat Bladi</h2>
            <p className="wild-about-desc">
              Khayrat Bladi est née d'une passion pour les richesses naturelles du Maroc.
              Nous sélectionnons avec soin les meilleurs produits du terroir — miels, huiles d'argan,
              amlou et bien plus — directement auprès de producteurs locaux passionnés.
            </p>
            <p className="wild-about-desc">
              Notre mission : vous offrir des produits authentiques, 100% naturels,
              récoltés dans le respect des traditions ancestrales marocaines.
            </p>
            <Link to="/products" className="wild-btn-primary" style={{ display: 'inline-flex', marginTop: '24px' }}>
              Découvrir nos produits <FiArrowRight />
            </Link>
          </div>
          <div className="wild-about-img">
            <img
              src={`${process.env.PUBLIC_URL}/images/home2.jpeg`}
              alt="À propos"
            />
          </div>
        </div>
      </section>

      {/* ── CATÉGORIES ── */}
      {categories.length > 0 && (
        <section className="wild-section wild-cats-section">
          <div className="wild-section-header">
            <p className="wild-section-eyebrow">Explorer</p>
            <h2 className="wild-section-title">Nos Catégories</h2>
          </div>
          <div className="wild-cats-grid">
            {categories.slice(0, 6).map(cat => (
              <div
                key={cat.id}
                className="wild-cat-card"
                onClick={() => navigate(`/products?categorie_id=${cat.id}`)}
              >
                <div className="wild-cat-icon"><FiShoppingBag /></div>
                <p className="wild-cat-name">{cat.nom}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── PRODUITS VEDETTES ── */}
      {vedettes.length > 0 && (
        <section className="wild-section wild-prods-section">
          <div className="wild-section-header">
            <p className="wild-section-eyebrow">Sélection</p>
            <h2 className="wild-section-title">Produits Vedettes</h2>
            <Link to="/products" className="wild-section-link">Voir tout <FiArrowRight /></Link>
          </div>
          <div className="wild-prods-grid">
            {vedettes.map(p => (
              <div key={p.id} className="wild-prod-card" onClick={() => navigate('/products')}>
                <div className="wild-prod-img">
                  <img
                    src={p.image_url || `${process.env.PUBLIC_URL}/images/honey-pure.png`}
                    alt={p.nom}
                    onError={e => { e.target.src = `${process.env.PUBLIC_URL}/images/honey-pure.png`; }}
                  />
                </div>
                <div className="wild-prod-info">
                  <p className="wild-prod-cat">{p.categorie?.nom || 'Produit'}</p>
                  <h3 className="wild-prod-name">{p.nom}</h3>
                  <div className="wild-prod-bottom">
                    <span className="wild-prod-price">{p.prix} DH</span>
                    <span className="wild-prod-stars"><FiStar /> 4.9</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── PRODUITS POPULAIRES ── */}
      {populaires.length > 0 && (
        <section className="wild-section wild-prods-section wild-pop-section">
          <div className="wild-section-header">
            <p className="wild-section-eyebrow">Tendances</p>
            <h2 className="wild-section-title">Produits Populaires</h2>
            <Link to="/products" className="wild-section-link">Voir tout <FiArrowRight /></Link>
          </div>
          <div className="wild-prods-grid">
            {populaires.map(p => (
              <div key={p.id} className="wild-prod-card" onClick={() => navigate('/products')}>
                <div className="wild-prod-img">
                  <img
                    src={p.image_url || `${process.env.PUBLIC_URL}/images/honey-pure.png`}
                    alt={p.nom}
                    onError={e => { e.target.src = `${process.env.PUBLIC_URL}/images/honey-pure.png`; }}
                  />
                  <span className="wild-prod-badge">Populaire</span>
                </div>
                <div className="wild-prod-info">
                  <p className="wild-prod-cat">{p.categorie?.nom || 'Produit'}</p>
                  <h3 className="wild-prod-name">{p.nom}</h3>
                  <div className="wild-prod-bottom">
                    <span className="wild-prod-price">{p.prix} DH</span>
                    <span className="wild-prod-stars"><FiStar /> 4.9</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;