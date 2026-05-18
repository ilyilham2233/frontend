import API from './auth';

// ── Catalogue ──────────────────────────────────────────────────────────────

export const getProducts = async (params = {}) => {
  const response = await API.get('/produits', { params });
  return response.data;
};

export const getProduct = async (id) => {
  const response = await API.get(`/produits/${id}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await API.get('/categories');
  return response.data;
};

// ── Panier ─────────────────────────────────────────────────────────────────

export const addToCart = async (produitId, quantite = 1) => {
  const response = await API.post('/cart/add', {
    produit_id: produitId,
    quantite,
  });
  return response.data;
};

export const getCart = async () => {
  const response = await API.get('/cart');
  return response.data;
};

export const updateCart = async (articleId, quantite) => {
  const response = await API.patch('/cart/update', {
    article_id: articleId,
    quantite,
  });
  return response.data;
};

export const removeFromCart = async (articleId) => {
  const response = await API.delete(`/cart/remove/${articleId}`);
  return response.data;
};