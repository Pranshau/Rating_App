const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

//Auth 
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function register(user) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  return res.json();
}

export async function registerOwner(data) {
  const res = await fetch(`${BASE_URL}/auth/register-owner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

//Users
export async function changePassword(oldPassword, newPassword) {
  const res = await fetch(`${BASE_URL}/users/password`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  return res.json();
}

// Stores
export async function getStores(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/stores?${qs}`, { headers: authHeaders() });
  return res.json();
}

export async function submitRating(storeId, rating) {
  const res = await fetch(`${BASE_URL}/stores/${storeId}/rating`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ rating }),
  });
  return res.json();
}

//Admin APIs
export async function adminGetUsers(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/admin/users?${qs}`, { headers: authHeaders() });
  const data = await res.json();
  return Array.isArray(data) ? data : data.users || [];
}

export async function adminAddUser(payload) {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.user || data;
}

export async function adminGetStores(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/admin/stores?${qs}`, { headers: authHeaders() });
  const data = await res.json();
  return Array.isArray(data) ? data : data.stores || [];
}

export async function adminAddStore(payload) {
  const res = await fetch(`${BASE_URL}/admin/stores`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.store || data;
}

//Owner APIs
export async function ownerGetStores() {
  const res = await fetch(`${BASE_URL}/owner/stores`, { headers: authHeaders() });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function ownerGetStoreRatings(storeId) {
  const res = await fetch(`${BASE_URL}/owner/stores/${storeId}/ratings`, { headers: authHeaders() });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
