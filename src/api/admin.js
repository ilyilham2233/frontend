import API from './auth';

export const getAdminStats = async () => {
  const response = await API.get('/admin/stats');
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await API.get('/admin/users');
  console.log('API users response:', response.data); // ← ajoute ça
  return response.data;
};

export const toggleUserActive = async (id) => {
  const response = await API.patch(`/admin/users/${id}/toggle-active`);
  return response.data;
};

export const getAdminCatalogue = async () => {
  const response = await API.get('/admin/catalogue');
  return response.data;
};

export const updateProductStatut = async (id, statut) => {
  const response = await API.patch(`/admin/catalogue/${id}/statut`, { statut });
  return response.data;
};

export const getAdminCommandes = async () => {
  const response = await API.get('/admin/commandes');
  return response.data;
};

export const assignerLivreur = async (commandeId, livreurId) => {
  const response = await API.post(`/admin/commandes/${commandeId}/assigner-livreur`, {
    livreur_id: livreurId,
  });
  return response.data;
};