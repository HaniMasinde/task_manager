import { apiRequest } from './api.js'

async function updateProfile(profile) {
  const response = await apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  })
  return response.data.user
}

async function updatePassword(passwords) {
  return apiRequest('/auth/password', {
    method: 'PUT',
    body: JSON.stringify(passwords),
  })
}

async function deleteAccount(currentPassword) {
  return apiRequest('/auth/account', {
    method: 'DELETE',
    body: JSON.stringify({ currentPassword }),
  })
}

export { updateProfile, updatePassword, deleteAccount }
