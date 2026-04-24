import { useAuth } from '../context/AuthContext';

export function useApi() {
  const { user, logout } = useAuth();

  const request = async (path, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
      ...options.headers,
    };

    const res = await fetch(path, { ...options, headers });

    if (res.status === 401) {
      logout();
      throw new Error('Session expired. Please log in again.');
    }

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Request failed');
    return json;
  };

  return { request };
}
