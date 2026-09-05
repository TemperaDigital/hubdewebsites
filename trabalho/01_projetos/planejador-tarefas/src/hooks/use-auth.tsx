import type { ReactNode } from "react";

// Autenticação removida: usamos um usuário local fixo. Os dados ficam no
// navegador (Dexie/IndexedDB), atrelados a este id.
const LOCAL_USER = {
  id: "local-user",
  email: "local@device",
} as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  return { user: LOCAL_USER, session: null, loading: false };
}