import API from './auth';

// ─── Stats ────────────────────────────────────────────────────────────────────

export const getAdminStats = async () => {
  const response = await API.get('/admin/stats');
  return response.data;
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const getAdminUsers = async () => {
  const response = await API.get('/admin/users');
  return response.data;
};

export const toggleUserActive = async (id) => {
  const response = await API.patch(`/admin/users/${id}/toggle-active`);
  return response.data;
};

/**
 * Modifier un utilisateur (PUT /admin/users/{id})
 */
export const updateAdminUser = async (id, data) => {
  const response = await API.put(`/admin/users/${id}`, data);
  return response.data;
};

/**
 * Bloquer, débloquer ou supprimer un utilisateur (POST /admin/users/{id}/action)
 * @param {number} id
 * @param {'bloquer' | 'debloquer' | 'supprimer'} action
 */
export const userAction = async (id, action) => {
  const response = await API.post(`/admin/users/${id}/action`, { action });
  return response.data;
};

// ─── Catalogue ────────────────────────────────────────────────────────────────

export const getAdminCatalogue = async () => {
  const response = await API.get('/admin/catalogue');
  return response.data;
};

export const updateProductStatut = async (id, statut) => {
  const response = await API.patch(`/admin/catalogue/${id}/statut`, { statut });
  return response.data;
};

// ─── Commandes ────────────────────────────────────────────────────────────────

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

// ─── Reports ──────────────────────────────────────────────────────────────────

/**
 * Rapport global KPI (GET /admin/reports/overview)
 */
export const getAdminReportsOverview = async () => {
  const response = await API.get('/admin/reports/overview');
  return response.data;
};

/**
 * Exporter le rapport en PDF (GET /admin/reports/export-pdf)
 * Retourne un Blob pour téléchargement direct
 */
export const exportAdminReportPdf = async () => {
  const response = await API.get('/admin/reports/export-pdf', {
    responseType: 'blob',
  });
  return response.data; // Blob PDF
};

// ─── Settings ─────────────────────────────────────────────────────────────────

/**
 * Consulter les paramètres du site (GET /admin/settings)
 */
export const getAdminSettings = async () => {
  const response = await API.get('/admin/settings');
  return response.data;
};

/**
 * Mettre à jour les paramètres du site (POST /admin/settings/update)
 * @param {Object} settings
 * @param {string}  [settings.site_nom]
 * @param {string}  [settings.site_email]
 * @param {string}  [settings.site_telephone]
 * @param {string}  [settings.site_logo_url]
 * @param {'html'|'text'} [settings.format_mail]
 * @param {number}  [settings.taille_logo]
 * @param {'0'|'1'} [settings.maintenance_mode]
 */
export const updateAdminSettings = async (settings) => {
  const response = await API.post('/admin/settings/update', settings);
  return response.data;
};
