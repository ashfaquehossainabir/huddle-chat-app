/** Auth token persistence (localStorage). */
export const getToken = () => localStorage.token || '';
export const setToken = token => { localStorage.token = token; };
export const clearToken = () => localStorage.removeItem('token');
