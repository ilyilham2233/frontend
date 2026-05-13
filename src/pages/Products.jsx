import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Products.css';
import { useAuth } from '../context/AuthContext';
import { FiShoppingCart, FiStar, FiHeart, FiFilter, FiUser, FiLogOut, FiLogIn } from 'react-icons/fi';

const products = [
  {
    id: 1,
    name: 'Miel Pur Toutes Fleurs',
    description: 'Un miel doré et onctueux, récolté dans les prairies sauvages. Saveur florale et délicate.',
    price: 89,
    oldPrice: 110,
    rating: 4.9,
    reviews: 124,
    image: '/images/honey-pure.png',
    badge: 'Best Seller',
    category: 'classique',
  },
  {
    id: 2,
    name: 'Miel de Forêt',
    description: 'Miel sombre et intense aux notes boisées, récolté au cœur des forêts de chênes et de châtaigniers.',
    price: 120,
    oldPrice: null,
    rating: 4.8,
    reviews: 87,
    image: '/images/honey-forest.png',
    badge: 'Premium',
    category: 'premium',
  },
  {
    id: 3,
    name: "Miel d'Acacia",
    description: "Un miel clair et délicat au goût subtil. Parfait pour sucrer vos boissons et pâtisseries.",
    price: 95,
    oldPrice: null,
    rating: 4.7,
    reviews: 63,
    image: '/images/honey-acacia.png',
    badge: null,
    category: 'classique',
  },
  {
    id: 4,
    name: 'Miel de Thym',
    description: 'Puissant et aromatique, ce miel de thym est reconnu pour ses propriétés bienfaisantes.',
    price: 135,
    oldPrice: 160,
    rating: 5.0,
    reviews: 201,
    image: '/images/honey-thyme.png',
    badge: 'Top Qualité',
    category: 'premium',
  },
  {
    id: 5,
    name: 'Coffret Cadeau Miel',
    description: 'Un élégant coffret de 3 miels artisanaux. Le cadeau parfait pour les amateurs de miel.',
    price: 249,
    oldPrice: 299,
    rating: 4.9,
    reviews: 56,
    image: '/images/honey-gift.png',
    badge: 'Coffret',
    category: 'coffret',
  },
];

const categories = [
  { key: 'all', label: 'Tous' },
  { key: 'classique', label: 'Classique' },
  { key: 'premium', label: 'Premium' },
  { key: 'coffret', label: 'Coffrets' },
];

const Products = () => {
  const { isAuthenticated, logout } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState([]);

  const filtered = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  const toggleFav = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="honey-page">
      {/* Navbar */}
      <nav className="honey-nav" id="honey-navbar">
        <Link to="/home" className="honey-brand">
          <span className="honey-brand-icon">🍯</span>
          <span className="honey-brand-text">Maison du Miel</span>
        </Link>
        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="nav-link"><FiUser /> Profil</Link>
              <button onClick={logout} className="nav-link nav-btn"><FiLogOut /> Déconnexion</button>
            </>
          ) : (
            <Link to="/login" className="nav-link"><FiLogIn /> Connexion</Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section
        className="honey-hero"
        id="honey-hero"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/honey-hero.png)` }}
      >
        <div className="honey-hero-content">
          <span className="honey-hero-tag">Artisanal & 100% Naturel</span>
          <h1>Découvrez nos miels<br /><span className="honey-gold">d'exception</span></h1>
          <p>Des miels purs, récoltés avec passion dans les plus belles régions. Du producteur directement à votre table.</p>
          <a href="#products-section" className="btn honey-btn-primary">
            <span className="btn-content">
              <FiShoppingCart />
              Voir les produits
            </span>
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="honey-stats">
        <div className="honey-stat">
          <span className="honey-stat-number">100%</span>
          <span className="honey-stat-label">Naturel</span>
        </div>
        <div className="honey-stat-divider" />
        <div className="honey-stat">
          <span className="honey-stat-number">5000+</span>
          <span className="honey-stat-label">Clients satisfaits</span>
        </div>
        <div className="honey-stat-divider" />
        <div className="honey-stat">
          <span className="honey-stat-number">12</span>
          <span className="honey-stat-label">Variétés</span>
        </div>
        <div className="honey-stat-divider" />
        <div className="honey-stat">
          <span className="honey-stat-number">4.9★</span>
          <span className="honey-stat-label">Note moyenne</span>
        </div>
      </section>

      {/* Products */}
      <section className="honey-products" id="products-section">
        <div className="honey-products-header">
          <h2>Nos Produits</h2>
          <p>Sélectionnés avec soin pour leur qualité et leur authenticité</p>
        </div>

        {/* Filters */}
        <div className="honey-filters" id="honey-filters">
          <FiFilter className="filter-icon" />
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={`honey-filter-btn ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="honey-grid">
          {filtered.map((product) => (
            <div className="honey-card" key={product.id} id={`product-${product.id}`}>
              {/* Badge */}
              {product.badge && (
                <span className={`honey-badge ${product.badge === 'Best Seller' ? 'badge-gold' : product.badge === 'Premium' ? 'badge-purple' : product.badge === 'Top Qualité' ? 'badge-green' : 'badge-amber'}`}>
                  {product.badge}
                </span>
              )}

              {/* Favorite */}
              <button
                className={`honey-fav ${favorites.includes(product.id) ? 'fav-active' : ''}`}
                onClick={() => toggleFav(product.id)}
                aria-label="Ajouter aux favoris"
              >
                <FiHeart />
              </button>

              {/* Image */}
              <div className="honey-card-img-wrapper">
                <img src={product.image} alt={product.name} className="honey-card-img" />
                <div className="honey-card-img-glow" />
              </div>

              {/* Info */}
              <div className="honey-card-body">
                <h3 className="honey-card-title">{product.name}</h3>
                <p className="honey-card-desc">{product.description}</p>

                {/* Rating */}
                <div className="honey-card-rating">
                  <div className="honey-stars">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'}
                      />
                    ))}
                  </div>
                  <span className="honey-rating-text">
                    {product.rating} ({product.reviews} avis)
                  </span>
                </div>

                {/* Price + CTA */}
                <div className="honey-card-footer">
                  <div className="honey-price">
                    <span className="honey-price-current">{product.price} DH</span>
                    {product.oldPrice && (
                      <span className="honey-price-old">{product.oldPrice} DH</span>
                    )}
                  </div>
                  <button className="honey-add-btn">
                    <FiShoppingCart />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="honey-footer">
        <div className="honey-footer-inner">
          <div className="honey-footer-brand">
            <span>🍯</span>
            <span>Maison du Miel</span>
          </div>
          <p>© 2026 Maison du Miel — Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
};

export default Products;
