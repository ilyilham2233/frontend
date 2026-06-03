import API from './auth';

export const getSellerProducts = async () =>
  API.get('/seller/products').then(r => r.data);

export const storeSellerProduct = async (data) =>
  API.post('/seller/products/store', data).then(r => r.data);

export const getSellerProduct = async (id) =>
  API.get(`/seller/products/${id}`).then(r => r.data);

export const updateSellerProduct = async (id, data) =>
  API.put(`/seller/products/${id}`, data).then(r => r.data);

export const deleteSellerProduct = async (id) =>
  API.delete(`/seller/products/${id}`).then(r => r.data);

export const getSellerOrders = async () =>
  API.get('/seller/orders').then(r => r.data);

export const getSellerOrder = async (id) =>
  API.get(`/seller/orders/${id}`).then(r => r.data);

export const updateSellerOrderStatus = async (id, statut) =>
  API.post(`/seller/orders/${id}/update-status`, { statut }).then(r => r.data);

export const getSellerStats = async () =>
  API.get('/seller/statistics').then(r => r.data);

export const downloadSellerStatsPdf = async () => {
  const response = await API.get('/seller/statistics/download-pdf', {
    responseType: 'blob', // ← dit à Axios que c'est un fichier binaire (PDF)
  });

  // Crée un lien temporaire et clique dessus automatiquement
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'statistiques-vendeur.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};