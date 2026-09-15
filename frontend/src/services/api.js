/**
 * API Service for Digital Land Registry
 * Connects directly to backend REST endpoints according to api-contract.md
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    const errorMsg = data.message || `HTTP ${response.status} Error`;
    const err = new Error(errorMsg);
    err.errorCode = data.errorCode || 'UNKNOWN_ERROR';
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  // 1. Create property
  async createProperty(payload) {
    const res = await fetch(`${API_BASE_URL}/api/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // 2. Get all properties
  async getAllProperties() {
    const res = await fetch(`${API_BASE_URL}/api/properties`);
    return handleResponse(res);
  },

  // 3. Get property by parcel ID
  async getProperty(parcelId) {
    const res = await fetch(`${API_BASE_URL}/api/properties/${encodeURIComponent(parcelId)}`);
    return handleResponse(res);
  },

  // 4. Request title transfer
  async requestTitleTransfer(parcelId, payload) {
    const res = await fetch(`${API_BASE_URL}/api/properties/${encodeURIComponent(parcelId)}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // 5. Approve title transfer
  async approveTitleTransfer(parcelId, payload = {}) {
    const res = await fetch(`${API_BASE_URL}/api/properties/${encodeURIComponent(parcelId)}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // 6. Reject title transfer
  async rejectTitleTransfer(parcelId, payload = {}) {
    const res = await fetch(`${API_BASE_URL}/api/properties/${encodeURIComponent(parcelId)}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // 7. Get property history
  async getPropertyHistory(parcelId) {
    const res = await fetch(`${API_BASE_URL}/api/properties/${encodeURIComponent(parcelId)}/history`);
    return handleResponse(res);
  },

  // 8. Get dashboard summary
  async getDashboardSummary() {
    const res = await fetch(`${API_BASE_URL}/api/dashboard/summary`);
    return handleResponse(res);
  }
};

export default api;
