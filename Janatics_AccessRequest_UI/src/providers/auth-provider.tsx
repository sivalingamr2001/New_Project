import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { authApi, type AuthResponse, type LoginRequest, type RegisterRequest } from "@/features/auth/api/authApi";

const STORAGE_KEY = "janatics-auth-user";

type AuthContextValue = {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<AuthResponse>;
  register: (request: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthResponse | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored) as AuthResponse);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const login = async (request: LoginRequest) => {
    const auth = await authApi.login(request);
    setUser(auth);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    return auth;
  };

  const register = async (request: RegisterRequest) => {
    const auth = await authApi.register(request);
    setUser(auth);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    return auth;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
