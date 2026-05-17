import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Products.css';
import './ProductsExtra.css';
import { useAuth } from '../context/AuthContext';
import {
  FiShoppingCart, FiStar, FiHeart, FiFilter,
  FiUser, FiLogOut, FiLogIn, FiSearch,
  FiChevronLeft, FiChevronRight, FiX, FiAlertCircle,
} from 'react-icons/fi';
import { getProducts, getCategories, addToCart } from '../api/catalogue';

// ─── Skeleton card ──────────────────────────────────────────────────────────
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

// ─── Star rating ─────────────────────────────────────────────────────────────
const Stars = ({ rating = 0 }) => (
  <div className="honey-stars">
    {[1,2,3,4,5].map(i => (
      <FiStar key={i} className={i <= Math.round(rating) ? 'star-filled' : 'star-empty'} />
    ))}
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────────
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

  // UI state
  const [favorites, setFavorites]   = useState([]);
  const [cartLoading, setCartLoading] = useState(null); // produit_id en cours
  const [cartMsg, setCartMsg]       = useState('');

  // ── Fetch categories ───────────────────────────────────────────────────────
  useEffect(() => {
    getCategories()
      .then(data => setCategories(data.data || []))
      .catch(() => {});
  }, []);

  // ── Fetch products ─────────────────────────────────────────────────────────
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
        const d = res.data;
        setProducts(d.data || []);
        setPagination({
          current:    d.current_page,
          total:      d.last_page,
          perPage:    d.per_page,
          totalItems: d.total,
        });
      })
      .catch(() => setError('Impossible de charger les produits. Réessayez.'))
      .finally(() => setLoading(false));
  }, [search, categoryId, prixMin, prixMax, sort, order, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const clearFilters = () => {
    setSearch(''); setSearchInput('');
    setCategoryId(''); setPrixMin(''); setPrixMax('');
    setSort('created_at'); setOrder('desc');
    setPage(1);
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
      const msg = err.response?.data?.message || 'Erreur lors de l\'ajout.';
      setCartMsg(msg);
    } finally {
      setCartLoading(null);
      setTimeout(() => setCartMsg(''), 3000);
    }
  };

  const hasActiveFilters = search || categoryId || prixMin || prixMax || sort !== 'created_at' || order !== 'desc';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="honey-page">

      {/* Navbar */}
      <nav className="honey-nav">
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
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/honey-hero.png)` }}
      >
        <div className="honey-hero-content">
          <span className="honey-hero-tag">Artisanal & 100% Naturel</span>
          <h1>Découvrez nos miels<br /><span className="honey-gold">d'exception</span></h1>
          <p>Des miels purs, récoltés avec passion dans les plus belles régions. Du producteur directement à votre table.</p>
          <a href="#products-section" className="btn honey-btn-primary">
            <span className="btn-content"><FiShoppingCart /> Voir les produits</span>
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
          <span className="honey-stat-number">{pagination.totalItems || '+'}</span>
          <span className="honey-stat-label">Produits</span>
        </div>
        <div className="honey-stat-divider" />
        <div className="honey-stat">
          <span className="honey-stat-number">{categories.length || '—'}</span>
          <span className="honey-stat-label">Catégories</span>
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

        {/* Search bar */}
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
              <button type="button" className="catalogue-search-clear" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}>
                <FiX />
              </button>
            )}
          </div>
          <button type="submit" className="catalogue-search-btn">Rechercher</button>
        </form>

        {/* Filters row */}
        <div className="catalogue-filters-row">
          {/* Categories */}
          <div className="honey-filters">
            <FiFilter className="filter-icon" />
            <button
              className={`honey-filter-btn ${!categoryId ? 'active' : ''}`}
              onClick={() => { setCategoryId(''); setPage(1); }}
            >
              Tous
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`honey-filter-btn ${categoryId === String(cat.id) ? 'active' : ''}`}
                onClick={() => { setCategoryId(String(cat.id)); setPage(1); }}
              >
                {cat.nom}
                {cat.produits_count ? <span className="cat-count">{cat.produits_count}</span> : null}
              </button>
            ))}
          </div>

          {/* Advanced filters toggle */}
          <button
            className={`catalogue-adv-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> Filtres avancés
            {hasActiveFilters && <span className="filters-dot" />}
          </button>
        </div>

        {/* Advanced filters panel */}
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

        {/* Cart message */}
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
                <span>🍯</span>
                <p>Aucun produit trouvé pour ces critères.</p>
                <button onClick={clearFilters}>Voir tous les produits</button>
              </div>
            )
            : products.map(product => (
              <div className="honey-card" key={product.id}>

                {/* Stock badge */}
                {product.quantite_stock <= 5 && product.quantite_stock > 0 && (
                  <span className="honey-badge badge-amber">Stock limité</span>
                )}
                {product.quantite_stock === 0 && (
                  <span className="honey-badge badge-purple">Épuisé</span>
                )}
                {product.quantite_stock > 5 && (
                  <span className="honey-badge badge-gold">{product.categorie?.nom}</span>
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
                  <img
                    src={product.image_url || `${process.env.PUBLIC_URL}/images/honey-pure.png`}
                    alt={product.nom}
                    className="honey-card-img"
                    onError={e => { e.target.src = `${process.env.PUBLIC_URL}/images/honey-pure.png`; }}
                  />
                  <div className="honey-card-img-glow" />
                </div>

                {/* Info */}
                <div className="honey-card-body">
                  <h3 className="honey-card-title">{product.nom}</h3>
                  <p className="honey-card-desc">{product.description || 'Produit apicole artisanal de qualité.'}</p>

                  {/* Vendeur */}
                  {product.vendeur && (
                    <p className="honey-card-vendor">
                      Par {product.vendeur.prenom} {product.vendeur.nom}
                    </p>
                  )}

                  {/* Rating */}
                  <div className="honey-card-rating">
                    <Stars rating={product.note_moyenne || 0} />
                    <span className="honey-rating-text">
                      {product.note_moyenne ? `${product.note_moyenne}` : 'Pas encore noté'}
                    </span>
                  </div>

                  {/* Price + CTA */}
                  <div className="honey-card-footer">
                    <div className="honey-price">
                      <span className="honey-price-current">{product.prix} DH</span>
                    </div>
                    <button
                      className="honey-add-btn"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.quantite_stock === 0 || cartLoading === product.id}
                      title={product.quantite_stock === 0 ? 'Épuisé' : 'Ajouter au panier'}
                    >
                      {cartLoading === product.id
                        ? <span className="cart-spinner" />
                        : <FiShoppingCart />
                      }
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
            <button
              className="pag-btn"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              <FiChevronLeft />
            </button>

            {Array.from({ length: pagination.total }, (_, i) => i + 1)
              .filter(p => p === 1 || p === pagination.total || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...'
                  ? <span key={`dot-${i}`} className="pag-dots">…</span>
                  : <button key={p} className={`pag-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              )
            }

            <button
              className="pag-btn"
              disabled={page >= pagination.total}
              onClick={() => setPage(p => p + 1)}
            >
              <FiChevronRight />
            </button>
          </div>
        )}
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