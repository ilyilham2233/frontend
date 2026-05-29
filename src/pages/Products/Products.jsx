import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiAlertCircle, FiClipboard, FiLogIn, FiLogOut, FiShoppingCart, FiUser } from 'react-icons/fi';
import { getProducts, getCategories, addToCart } from '../../api/catalogue';
import { useAuth } from '../../context/AuthContext';
import {
  CatalogueFilters,
  CatalogueSearch,
  Footer,
  Navbar,
  Pagination,
  ProductGrid,
  ProductsHero,
} from '../../components';
import ProductModal from '../../components/ProductModal/ProductModal';
import './Products.css';
import './ProductsExtra.css';
import './ProductsHero.css';

const Products = () => {
  const { isAuthenticated, logout } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    perPage: 12,
    totalItems: 0,
  });

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [prixMin, setPrixMin] = useState('');
  const [prixMax, setPrixMax] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [favorites, setFavorites] = useState([]);
  const [cartLoading, setCartLoading] = useState(null);
  const [cartMsg, setCartMsg] = useState('');
  const [modalProduct, setModalProduct] = useState(null);

  const heroRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const y = window.scrollY;
      contentRef.current.style.transform = `translateY(${y * 0.18}px)`;
      contentRef.current.style.opacity = Math.max(0, 1 - y / 420);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data?.data ?? data ?? []))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError('');

    const params = { page };
    if (search) params.search = search;
    if (categoryId) params.categorie_id = categoryId;
    if (prixMin) params.prix_min = prixMin;
    if (prixMax) params.prix_max = prixMax;
    if (sort) params.sort = sort;
    if (order) params.order = order;

    getProducts(params)
      .then((res) => {
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
      .catch(() => setError('Impossible de charger les produits. Reessayez.'))
      .finally(() => setLoading(false));
  }, [search, categoryId, prixMin, prixMax, sort, order, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetPage = () => setPage(1);

  const handleSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    resetPage();
  };
  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setCategoryId('');
    setPrixMin('');
    setPrixMax('');
    setSort('created_at');
    setOrder('desc');
    resetPage();
  };

  const toggleFavorite = (id) => {
    setFavorites((currentFavorites) =>
      currentFavorites.includes(id)
        ? currentFavorites.filter((favoriteId) => favoriteId !== id)
        : [...currentFavorites, id]
    );
  };

  const handleAddToCart = async (produitId, quantite = 1) => {
    if (!isAuthenticated) {
      setCartMsg('Connectez-vous pour ajouter au panier.');
      return;
    }

    setCartLoading(produitId);
    try {
      await addToCart(produitId, quantite);
      setCartMsg('Produit ajoute au panier !');
    } catch (err) {
      setCartMsg(err.response?.data?.message || "Erreur lors de l'ajout.");
    } finally {
      setCartLoading(null);
      setTimeout(() => setCartMsg(''), 3000);
    }
  };

  const hasActiveFilters =
    search || categoryId || prixMin || prixMax || sort !== 'created_at' || order !== 'desc';

  return (
    <div className="honey-page">
      <Navbar
  variant="default"
  brandTo="/home"
        isAuthenticated={isAuthenticated}
        onLogout={logout}
        links={
          isAuthenticated
            ? [
                { to: '/cart', label: 'Panier', icon: <FiShoppingCart /> },
                { to: '/orders', label: 'Mes Commandes', icon: <FiClipboard /> },
                { to: '/profile', label: 'Profil', icon: <FiUser /> },
                { type: 'button', label: 'Deconnexion', icon: <FiLogOut />, onClick: logout },
              ]
            : [{ to: '/login', label: 'Connexion', icon: <FiLogIn /> }]
        }
      />

      <ProductsHero heroRef={heroRef} contentRef={contentRef} />

      <section className="honey-products" id="products-section">
        <div className="honey-products-header">
          <h2>Nos Produits</h2>
          <p>Selectionnes avec soin pour leur qualite et leur authenticite</p>
        </div>

       <CatalogueSearch
  value={searchInput}
  onChange={setSearchInput}
  onSubmit={handleSearch}
  onClear={() => {
    setSearchInput('');
    setSearch('');
    resetPage();
  }}
  onSelectSuggestion={(suggestion) => {
  if (suggestion?.id) {
    setModalProduct(suggestion);
  } else {
    setSearchInput(suggestion);
    setSearch(suggestion);
    resetPage();
  }
}}
/>

        <CatalogueFilters
          categories={categories}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          prixMin={prixMin}
          setPrixMin={setPrixMin}
          prixMax={prixMax}
          setPrixMax={setPrixMax}
          sort={sort}
          setSort={setSort}
          order={order}
          setOrder={setOrder}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          resetPage={resetPage}
        />

        {cartMsg && (
          <div className={`catalogue-toast ${cartMsg.includes('!') ? 'toast-success' : 'toast-error'}`}>
            {cartMsg}
          </div>
        )}

        {error && (
          <div className="catalogue-error">
            <FiAlertCircle /> {error}
            <button type="button" onClick={fetchProducts}>Reessayer</button>
          </div>
        )}

        <ProductGrid
          loading={loading}
          products={products}
          favorites={favorites}
          cartLoading={cartLoading}
          onToggleFavorite={toggleFavorite}
          onAddToCart={handleAddToCart}
          onOpenDetail={setModalProduct}
          onClearFilters={clearFilters}
        />

        {!loading && (
          <Pagination
            currentPage={page}
            totalPages={pagination.total}
            onPageChange={setPage}
          />
        )}
      </section>

      <Footer />

      {modalProduct && (
        <ProductModal
          product={modalProduct}
          isFavorite={favorites.includes(modalProduct.id)}
          onClose={() => setModalProduct(null)}
          onAddToCart={handleAddToCart}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
};

export default Products;
