import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Products.css';
import './ProductsExtra.css';
import './ProductsHero.css';
import { useAuth } from '../context/AuthContext';
import {
  FiShoppingCart, FiStar, FiHeart, FiFilter,
  FiUser, FiLogOut, FiLogIn, FiSearch,
  FiChevronLeft, FiChevronRight, FiX, FiAlertCircle,
  FiChevronDown,
} from 'react-icons/fi';
import { getProducts, getCategories, addToCart } from '../api/catalogue';

// ─── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="honey-card skeleton-card">
    <div className="skeleton skeleton-img" />
    <div className="honey-card-body">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-desc" />
      <div className="skeleton skeleton-desc short" />
      <div className="skeleton skeleton-footer" />
    </div>
  </div>
);

// ─── Star rating ──────────────────────────────────────────────────────────────
const Stars = ({ rating = 0 }) => (
  <div className="honey-stars">
    {[1,2,3,4,5].map(i => (
      <FiStar key={i} className={i <= Math.round(rating) ? 'star-filled' : 'star-empty'} />
    ))}
  </div>
);

// ─── Floating particles ───────────────────────────────────────────────────────
const Particles = () => {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x:    Math.random() * 100,
    delay: Math.random() * 8,
    dur:   6 + Math.random() * 8,
    size:  4 + Math.random() * 10,
    opacity: 0.15 + Math.random() * 0.35,
  }));

  return (
    <div className="hero-particles" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="hero-particle"
          style={{
            left: `${p.x}%`,
            width: p.size, height: p.size,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const Products = () => {
  const { isAuthenticated, logout } = useAuth();

  // Catalogue state
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [pagination, setPagination] = useState({ current: 1, total: 1, perPage: 12, totalItems: 0 });

  // Filters
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryId, setCategoryId]   = useState('');
  const [prixMin, setPrixMin]         = useState('');
  const [prixMax, setPrixMax]         = useState('');
  const [sort, setSort]               = useState('created_at');
  const [order, setOrder]             = useState('desc');
  const [page, setPage]               = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // UI
  const [favorites, setFavorites]     = useState([]);
  const [cartLoading, setCartLoading] = useState(null);
  const [cartMsg, setCartMsg]         = useState('');

  // Parallax
  const heroRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const y = window.scrollY;
      contentRef.current.style.transform = `translateY(${y * 0.18}px)`;
      contentRef.current.style.opacity   = Math.max(0, 1 - y / 420);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Fetch categories ──────────────────────────────────────────────────────
  useEffect(() => {
    getCategories()
      .then(data => setCategories(data?.data ?? data ?? []))
      .catch(() => {});
  }, []);

  // ── Fetch products ────────────────────────────────────────────────────────
  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError('');
    const params = { page };
    if (search)     params.search       = search;
    if (categoryId) params.categorie_id = categoryId;
    if (prixMin)    params.prix_min     = prixMin;
    if (prixMax)    params.prix_max     = prixMax;
    if (sort)       params.sort         = sort;
    if (order)      params.order        = order;

    getProducts(params)
      .then(res => {
        const payload = res?.data ?? res;
        const data = payload?.data ?? payload;
        const items = Array.isArray(data) ? data : data?.data ?? data ?? [];

        setProducts(Array.isArray(items) ? items : []);
        setPagination({
          current: payload?.current_page ?? payload?.current ?? 1,
          total: payload?.last_page ?? payload?.total_pages ?? payload?.total ?? 1,
          perPage: payload?.per_page ?? payload?.perPage ?? 12,
          totalItems: payload?.total ?? (Array.isArray(items) ? items.length : 0),
        });
      })
      .catch(() => setError('Impossible de charger les produits. Réessayez.'))
      .finally(() => setLoading(false));
  }, [search, categoryId, prixMin, prixMax, sort, order, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput.trim()); setPage(1); };

  const clearFilters = () => {
    setSearch(''); setSearchInput(''); setCategoryId('');
    setPrixMin(''); setPrixMax(''); setSort('created_at'); setOrder('desc'); setPage(1);
  };

  const toggleFav = (id) =>
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  const handleAddToCart = async (produitId) => {
    if (!isAuthenticated) { setCartMsg('Connectez-vous pour ajouter au panier.'); return; }
    setCartLoading(produitId);
    try {
      await addToCart(produitId, 1);
      setCartMsg('Produit ajouté au panier !');
    } catch (err) {
      setCartMsg(err.response?.data?.message || "Erreur lors de l'ajout.");
    } finally {
      setCartLoading(null);
      setTimeout(() => setCartMsg(''), 3000);
    }
  };

  const hasActiveFilters = search || categoryId || prixMin || prixMax || sort !== 'created_at' || order !== 'desc';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="honey-page">

      {/* Navbar */}
      <nav className="honey-nav">
        <Link to="/home" className="honey-brand">
          <span className="honey-brand-text">khayrat bladi</span>
        </Link>
        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="nav-link"><FiShoppingCart /> Panier</Link>
              <Link to="/profile" className="nav-link"><FiUser /> Profil</Link>
              <button onClick={logout} className="nav-link nav-btn"><FiLogOut /> Déconnexion</button>
            </>
          ) : (
            <Link to="/login" className="nav-link"><FiLogIn /> Connexion</Link>
            
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="honey-hero hero-video-section" ref={heroRef}>
        <video
          className="hero-video-bg"
          autoPlay muted loop playsInline
        >
          <source src={`${process.env.PUBLIC_URL}/images/video 2.mp4`} type="video/mp4" />
        </video>

        <div className="hero-video-overlay" />

        <Particles />

        <div className="honey-hero-content hero-parallax-content" ref={contentRef}>
          <span className="honey-hero-tag hero-tag-animated">
            ✦ Artisanal &amp; 100% Naturel ✦
          </span>

          <h1 className="hero-title-animated">
            Découvrez nos miels<br />
            <span className="honey-gold hero-gold-shine">d'exception</span>
          </h1>

          <p className="hero-desc-animated">
            Des miels purs, récoltés avec passion dans les plus belles régions.<br />
            Du producteur directement à votre table.
          </p>

          <div className="hero-cta-group">
            <a href="#products-section" className="btn honey-btn-primary hero-btn-pulse">
              <span className="btn-content">
                <FiShoppingCart /> Voir les produits
              </span>
            </a>
            <Link to="/register" className="hero-btn-secondary">
              Créer un compte
            </Link>
          </div>
        </div>

        <a href="#products-section" className="hero-scroll-indicator" aria-label="Défiler">
          <FiChevronDown />
        </a>
      </section>

      {/* Products */}
      <section className="honey-products" id="products-section">
        <div className="honey-products-header">
          <h2>Nos Produits</h2>
          <p>Sélectionnés avec soin pour leur qualité et leur authenticité</p>
        </div>

        {/* Search */}
        <form className="catalogue-search" onSubmit={handleSearch}>
          <div className="catalogue-search-wrap">
            <FiSearch className="catalogue-search-icon" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button type="button" className="catalogue-search-clear"
                onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}>
                <FiX />
              </button>
            )}
          </div>
          <button type="submit" className="catalogue-search-btn">Rechercher</button>
        </form>

        {/* Filters */}
        <div className="catalogue-filters-row">
          <div className="honey-filters">
            <FiFilter className="filter-icon" />
            <button className={`honey-filter-btn ${!categoryId ? 'active' : ''}`}
              onClick={() => { setCategoryId(''); setPage(1); }}>Tous</button>
            {categories.map(cat => (
              <button key={cat.id}
                className={`honey-filter-btn ${categoryId === String(cat.id) ? 'active' : ''}`}
                onClick={() => { setCategoryId(String(cat.id)); setPage(1); }}>
                {cat.nom}
                {cat.produits_count ? <span className="cat-count">{cat.produits_count}</span> : null}
              </button>
            ))}
          </div>
          <button className={`catalogue-adv-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}>
            <FiFilter /> Filtres avancés
            {hasActiveFilters && <span className="filters-dot" />}
          </button>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="catalogue-adv-panel">
            <div className="catalogue-adv-grid">
              <div className="catalogue-adv-field">
                <label>Prix min (DH)</label>
                <input type="number" min="0" placeholder="0" value={prixMin}
                  onChange={e => { setPrixMin(e.target.value); setPage(1); }} />
              </div>
              <div className="catalogue-adv-field">
                <label>Prix max (DH)</label>
                <input type="number" min="0" placeholder="9999" value={prixMax}
                  onChange={e => { setPrixMax(e.target.value); setPage(1); }} />
              </div>
              <div className="catalogue-adv-field">
                <label>Trier par</label>
                <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
                  <option value="created_at">Date d'ajout</option>
                  <option value="prix">Prix</option>
                  <option value="nom">Nom</option>
                </select>
              </div>
              <div className="catalogue-adv-field">
                <label>Ordre</label>
                <select value={order} onChange={e => { setOrder(e.target.value); setPage(1); }}>
                  <option value="asc">Croissant</option>
                  <option value="desc">Décroissant</option>
                </select>
              </div>
            </div>
            {hasActiveFilters && (
              <button className="catalogue-clear-btn" onClick={clearFilters}>
                <FiX /> Réinitialiser les filtres
              </button>
            )}
          </div>
        )}

        {/* Toast */}
        {cartMsg && (
          <div className={`catalogue-toast ${cartMsg.includes('!') ? 'toast-success' : 'toast-error'}`}>
            {cartMsg}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="catalogue-error">
            <FiAlertCircle /> {error}
            <button onClick={fetchProducts}>Réessayer</button>
          </div>
        )}

        {/* Grid */}
        <div className="honey-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : products.length === 0
            ? (
              <div className="catalogue-empty">
                <p>Aucun produit trouvé pour ces critères.</p>
                <button onClick={clearFilters}>Voir tous les produits</button>
              </div>
            )
            : products.map(product => (
              <div className="honey-card" key={product.id}>
                {product.quantite_stock <= 5 && product.quantite_stock > 0 && (
                  <span className="honey-badge badge-amber">Stock limité</span>
                )}
                {product.quantite_stock === 0 && (
                  <span className="honey-badge badge-purple">Épuisé</span>
                )}
                {product.quantite_stock > 5 && (
                  <span className="honey-badge badge-gold">{product.categorie?.nom}</span>
                )}

                <button
                  className={`honey-fav ${favorites.includes(product.id) ? 'fav-active' : ''}`}
                  onClick={() => toggleFav(product.id)}
                >
                  <FiHeart />
                </button>

                <div className="honey-card-img-wrapper">
                  <img
                    src={product.image_url || `${process.env.PUBLIC_URL}/images/honey-pure.png`}
                    alt={product.nom}
                    className="honey-card-img"
                    onError={e => { e.target.src = `${process.env.PUBLIC_URL}/images/honey-pure.png`; }}
                  />
                  <div className="honey-card-img-glow" />
                </div>

                <div className="honey-card-body">
                  <h3 className="honey-card-title">{product.nom}</h3>
                  <p className="honey-card-desc">{product.description || 'Produit apicole artisanal de qualité.'}</p>
                  <div className="honey-card-rating">
                    <Stars rating={product.note_moyenne || 0} />
                    <span className="honey-rating-text">
                      {product.note_moyenne ? `${product.note_moyenne}` : 'Pas encore noté'}
                    </span>
                  </div>
                  <div className="honey-card-footer">
                    <div className="honey-price">
                      <span className="honey-price-current">{product.prix} DH</span>
                    </div>
                    <button
           className="honey-add-btn"
            onClick={() => handleAddToCart(product.id)}
             disabled={product.quantite_stock === 0 || cartLoading === product.id}
           >
            {cartLoading === product.id ? (
             <span className="cart-spinner" />
          ) : (
            <>
              <FiShoppingCart />
            <span>Ajouter au panier</span>
           </>
           )}
          </button>
                  </div>
                </div>
              </div>
            ))
          }
        </div>

        {/* Pagination */}
        {!loading && pagination.total > 1 && (
          <div className="catalogue-pagination">
            <button className="pag-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <FiChevronLeft />
            </button>
            {Array.from({ length: pagination.total }, (_, i) => i + 1)
              .filter(p => p === 1 || p === pagination.total || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                acc.push(p); return acc;
              }, [])
              .map((p, i) =>
                p === '...'
                  ? <span key={`dot-${i}`} className="pag-dots">…</span>
                  : <button key={p} className={`pag-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              )
            }
            <button className="pag-btn" disabled={page >= pagination.total} onClick={() => setPage(p => p + 1)}>
              <FiChevronRight />
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="honey-footer">
        <div className="honey-footer-inner">
          <div className="honey-footer-brand"><span>khayrat bladi</span></div>
          <p>© 2026 khayrat bladi — Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
};

export default Products;
