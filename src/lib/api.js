/**
 * Thin API client. The backend (Node/Express + PostgreSQL) is NOT built yet.
 * Point VITE_API_BASE_URL at the future API and every screen starts loading
 * real rows without changing UI code.
 *
 * Expected endpoints (to implement later):
 *   GET/POST  /customers, /products, /categories, /inventory
 *   GET       /cart, /orders, /payments, /delivery, /reviews, /reports/summary
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const API_CONNECTED = Boolean(API_BASE_URL);

async function request(path, options = {}) {
  if (!API_CONNECTED) {
    throw new Error("API not connected");
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const api = {
  list: (resource) => request(`/${resource}`),
  get: (resource, id) => request(`/${resource}/${id}`),
  create: (resource, body) =>
    request(`/${resource}`, { method: "POST", body: JSON.stringify(body) }),
  update: (resource, id, body) =>
    request(`/${resource}/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (resource, id) => request(`/${resource}/${id}`, { method: "DELETE" }),
};
