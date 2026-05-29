import API from './auth';

export const getAddresses = async () => {
  const response = await API.get('/profile/addresses');
  return response.data;
};

export const createAddress = async (data) => {
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