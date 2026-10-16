import { apiRequest } from './api';

export async function getDashboard() {
  const response = await apiRequest('/dashboard');

  return response.data;
}