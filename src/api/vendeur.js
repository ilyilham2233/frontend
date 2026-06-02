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

export const downloadSellerStatsPdf = () =>
  window.open('https://ice-universe-reason.ngrok-free.dev/api/seller/statistics/download-pdf');