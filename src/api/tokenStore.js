// src/api/tokenStore.js
// Simple in-memory token store used by axios and AuthContext.
// Keeps token in memory only (not localStorage) to follow A1.
let _accessToken = null;

export const setToken = (token) => {
  _accessToken = token;
};

export const getToken = () => _accessToken;

export const clearToken = () => {
  _accessToken = null;
};
