import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiLogIn, FiLogOut, FiMail, FiShield,
  FiShoppingBag, FiUser, FiPackage, FiStar,
  FiArrowRight, FiList, FiFeather
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components';
import { getCategories, getProducts } from '../../api/catalogue';
import './Home.css';

const getCatImage = (nom) => {
  const n = nom?.toLowerCase() || '';
  if (n.includes('miel')) return `${process.env.PUBLIC_URL}/images/honey-pure.png`;
  if (n.includes('argan')) return `${process.env.PUBLIC_URL}/images/home2.jpeg`;
  if (n.includes('amlou')) return `${process.env.PUBLIC_URL}/images/home2.jpeg`;
  if (n.includes('herbe') || n.includes('herb')) return `${process.env.PUBLIC_URL}/images/home2.jpeg`;
  if (n.includes('huile')) return `${process.env.PUBLIC_URL}/images/home2.jpeg`;
  return `${process.env.PUBLIC_URL}/images/honey-pure.png`;
};

const ProdSlider = ({ products, badge }) => {
  const doubled = [...products, ...products];
  return (
    <div className="wild-slider-wrap">
      <div className="wild-slider">
        <div className="wild-slider-inner">
          {doubled.map((p, i) => (
            <div key={`${p.id}-${i}`} className="wild-slide-card">
              <div className="wild-slide-img">
                <img
                  src={p.image_url || `${process.env.PUBLIC_URL}/images/honey-pure.png`}
                  alt={p.nom}
                  onError={e => { e.target.src = `${process.env.PUBLIC_URL}/images/honey-pure.png`; }}
                />
                {badge && <span className="wild-prod-badge">{badge}</span>}
              </div>
              <div className="wild-prod-info">
                <p className="wild-prod-cat">{p.categorie?.nom || 'Produit'}</p>
                <h3 className="wild-prod-name">{p.nom}</h3>
                <div className="wild-prod-bottom">
                  <span className="wild-prod-price">{p.prix} DH</span>
                  <span className="wild-prod-stars"><FiStar size={12} /> 4.9</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [vedettes, setVedettes]     = useState([]);
  const [populaires, setPopulaires] = useState([]);

  useEffect(() => {
  getCategories()
    .then(res => {
      const data = res?.data ?? res ?? [];
      setCategories(Array.isArray(data) ? data : []);
    })
    .catch(() => {
      // Fallback statique si API hors ligne
      setCategories([
        { id: 1, nom: 'Miel au détail' },
        { id: 2, nom: 'Miel en gros' },
        { id: 3, nom: 'Amlou' },
        { id: 4, nom: 'Argan' },
        { id: 5, nom: 'Herbes' },
        { id: 6, nom: 'Huiles' },
      ]);
    });

  getProducts({ sort: 'created_at', order: 'desc', per_page: 8 })
    .then(res => {
      const payload = res?.data ?? res;
      const items = payload?.data ?? payload ?? [];
      setVedettes(Array.isArray(items) ? items : []);
    })
    .catch(() => {});

  getProducts({ sort: 'prix', order: 'desc', per_page: 8 })
    .then(res => {
      const payload = res?.data ?? res;
      const items = payload?.data ?? payload ?? [];
      setPopulaires(Array.isArray(items) ? items : []);
    })
    .catch(() => {});
}, []);

  // Scroll vers section au chargement si hash dans URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const tryScroll = (attempts = 0) => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else if (attempts < 10) {
          setTimeout(() => tryScroll(attempts + 1), 200);
        }
      };
      setTimeout(() => tryScroll(), 100);
    }
  }, []);

  // Scroll direct vers section par id
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/home');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  };

  const navLinksAuth = [
    { to: '/home',     label: 'Accueil',             icon: <FiShoppingBag /> },
    { to: '/products', label: 'Produits',             icon: <FiShoppingBag /> },
    { type: 'button',  label: 'Catégories',           icon: <FiList />,    onClick: () => scrollTo('categories') },
    { type: 'button',  label: 'Produits Vedettes',    icon: <FiStar />,    onClick: () => scrollTo('vedettes') },
    { type: 'button',  label: 'Produits Populaires',  icon: <FiPackage />, onClick: () => scrollTo('populaires') },
    { type: 'button',  label: 'À propos',             icon: <FiFeather />, onClick: () => scrollTo('apropos') },
    { to: '/profile',  label: 'Profil',               icon: <FiUser /> },
    { type: 'button',  label: 'Déconnexion',          icon: <FiLogOut />,  onClick: logout },
  ];

  const navLinksGuest = [
    { to: '/products', label: 'Produits',             icon: <FiShoppingBag /> },
    { type: 'button',  label: 'Catégories',           icon: <FiList />,    onClick: () => scrollTo('categories') },
    { type: 'button',  label: 'Produits Vedettes',    icon: <FiStar />,    onClick: () => scrollTo('vedettes') },
    { type: 'button',  label: 'Produits Populaires',  icon: <FiPackage />, onClick: () => scrollTo('populaires') },
    { type: 'button',  label: 'À propos',             icon: <FiFeather />, onClick: () => scrollTo('apropos') },
    { to: '/login',    label: 'Se connecter',         icon: <FiLogIn /> },
  ];

  return (
    <div className="wild-page">

      {/* ── NAVBAR ── */}
      <Navbar
        variant="default"
        brand="Khayrat Bladi"
        brandTo="/home"
        isAuthenticated={isAuthenticated}
        onLogout={logout}
        links={isAuthenticated ? navLinksAuth : navLinksGuest}
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
            <span className="wild-stat-val">50+</span>
            <span className="wild-stat-lbl">Produits disponibles</span>
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
      {/* ── CATÉGORIES ── */}
      {categories.length > 0 && (
        <section className="wild-section wild-cats-section" id="categories">
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
                <div className="wild-cat-img-wrap">
                  <img
                    src={getCatImage(cat.nom)}
                    alt={cat.nom}
                    onError={e => { e.target.src = `${process.env.PUBLIC_URL}/images/honey-pure.png`; }}
                  />
                  <div className="wild-cat-overlay">
                    <p className="wild-cat-name">{cat.nom}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── PRODUITS VEDETTES ── */}
      {vedettes.length > 0 && (
        <section className="wild-section wild-prods-section" id="vedettes">
          <div className="wild-section-header">
            <p className="wild-section-eyebrow">Sélection</p>
            <h2 className="wild-section-title">Produits Vedettes</h2>
            <Link to="/products" className="wild-section-link">Voir tout <FiArrowRight /></Link>
          </div>
          <ProdSlider products={vedettes} />
        </section>
      )}

      {/* ── PRODUITS POPULAIRES ── */}
      {populaires.length > 0 && (
        <section className="wild-section wild-prods-section wild-pop-section" id="populaires">
          <div className="wild-section-header">
            <p className="wild-section-eyebrow">Tendances</p>
            <h2 className="wild-section-title">Produits Populaires</h2>
            <Link to="/products" className="wild-section-link">Voir tout <FiArrowRight /></Link>
          </div>
          <ProdSlider products={populaires} badge="Populaire" />
        </section>
      )}

    </div>
  );
};

export default Home;