import API from './auth';

export const getLivraisonsAssignees = async () => {
  const response = await API.get('/livraisons/assignées');
  return response.data;
};

export const updateStatutLivraison = async (id, statut) => {
  const response = await API.patch(`/livraisons/${id}/statut`, { statut });
  return response.data;
};

export const confirmerLivraison = async (id) => {
  const response = await API.post(`/livraisons/${id}/confirmer`);
  return response.data;
};

export const getHistoriqueLivraisons = async (period = '') => {
  const response = await API.get('/livraisons/historique', {
    params: period ? { period } : {}
  });
  return response.data;
};