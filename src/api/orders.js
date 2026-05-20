import API from './auth';

export const processOrder = async () => {
  const response = await API.post('/checkout/process');
  return response.data;
};

export const getOrderHistory = async () => {
  const response = await API.get('/orders/history');
  return response.data;
};

export const trackOrder = async (id) => {
  const response = await API.get(`/orders/${id}/tracking`);
  return response.data;
};

export const downloadReceipt = async (id) => {
  const response = await API.get(`/orders/${id}/download-receipt`, {
    responseType: 'blob',
  });
  // Créer un lien de téléchargement automatique
  const url  = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href  = url;
  link.setAttribute('download', `recu-commande-${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  return response.data;
};