import API from './auth'; // axios instance avec baseURL + token auto

// ── GET /profile/addresses ────────────────────────────────────────────────────
export const getAdresses = async () => {
  const response = await API.get('/profile/addresses');
  return response.data;
};

// ── POST /profile/addresses/store ─────────────────────────────────────────────
// body: { rue, ville, code_postal, est_par_defaut }
export const storeAdresse = async (data) => {
  const response = await API.post('/profile/addresses/store', data);
  return response.data;
};

// ── PUT /profile/addresses/{id} ───────────────────────────────────────────────
export const updateAdresse = async (id, data) => {
  const response = await API.put(`/profile/addresses/${id}`, data);
  return response.data;
};

// ── DELETE /profile/addresses/{id} ───────────────────────────────────────────
export const deleteAdresse = async (id) => {
  const response = await API.delete(`/profile/addresses/${id}`);
  return response.data;
};