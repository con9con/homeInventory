import { createContext, useContext, useState, useCallback } from 'react';

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem('auth_token');
    return t && decodeToken(t) ? t : null;
  });

  const user = token ? decodeToken(token) : null;

  function signIn(newToken) {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
  }

  function signOut() {
    localStorage.removeItem('auth_token');
    setToken(null);
  }

  const getToken = useCallback(() => Promise.resolve(token), [token]);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, getToken, isSignedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAppAuth() {
  return useContext(AuthContext);
}
