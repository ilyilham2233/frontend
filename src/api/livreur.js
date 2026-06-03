import API from './auth';

// GET /deliveries/assigned
export const getLivraisonsAssignees = async () => {
  const response = await API.get('/deliveries/assigned');
  return response.data;
};

// PATCH /deliveries/{id}/status  — statut: "recuperee" | "en_cours" | "non_livree"
export const updateStatutLivraison = async (id, statut) => {
  const response = await API.patch(`/deliveries/${id}/status`, { statut });
  return response.data;
};

// POST /deliveries/{id}/confirm
export const confirmerLivraison = async (id) => {
  const response = await API.post(`/deliveries/${id}/confirm`);
  return response.data;
};

// GET /deliveries/history?period=today|week|month|last_month
export const getHistoriqueLivraisons = async (period = '') => {
  const response = await API.get('/deliveries/history', {
    params: period ? { period } : {},
  });
  return response.data;
};