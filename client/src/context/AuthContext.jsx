import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { TOKEN_KEY } from "../api/axiosClient";
import { loginApi, registerApi, getMeApi } from "../api/authApi";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setLoading(false);
      return;
    }
    getMeApi()
      .then((d) => setUser(d.user))
      .catch((e) => { if (e.status === 401) logout(); })
      .finally(() => setLoading(false));
  }, [logout]);

  const finish = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => finish(await loginApi(email, password));
  const register = async (name, email, password) => finish(await registerApi(name, email, password));

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
