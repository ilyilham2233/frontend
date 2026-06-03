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

// ── Home ───────────────────────────────────────────────────────────────────
export const getHomeData = async () => {
  const response = await API.get('/home');
  return response.data;
};

// ── Suggestions ────────────────────────────────────────────────────────────
export const getSuggestions = async (search) => {
  const response = await API.get('/produits/suggestions', {
    params: { search }
  });
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

export const getAddresses = async () => {
  const response = await API.get('/profile/addresses');
  return response.data;
};

export const storeAddress = async (data) => {
  const response = await API.post('/profile/addresses/store', data);
  return response.data;
};

export const updateAddress = async (id, data) => {
  const response = await API.put(`/profile/addresses/${id}`, data);
  return response.data;
};

export const deleteAddress = async (id) => {
  const response = await API.delete(`/profile/addresses/${id}`);
  return response.data;
};

export const checkReviewForm = async (productId) => {
  const response = await API.get(`/product/${productId}/review/form`);
  return response.data;
};

export const submitReview = async (productId, note, commentaire = '') => {
  const response = await API.post(`/product/${productId}/review/store`, { note, commentaire });
  return response.data;
};

export const getProductReviews = async (productId) => {
  const response = await API.get(`/product/${productId}/review`);
  return response.data;
};