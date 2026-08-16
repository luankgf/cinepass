// src/pages/Home/Home.tsx
import { useAuth } from "../../contexts/AuthContext";
import styles from "./Home.module.css";

export function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className={styles.container}>
      <h1>CinePass</h1>

      {isAuthenticated ? (
        <div className={styles.userInfo}>
          <p>
            Logado como <strong>{user?.name}</strong> ({user?.role})
          </p>
          <button onClick={logout} className={styles.logoutButton}>
            Sair
          </button>
        </div>
      ) : (
        <p>Você não está logado.</p>
      )}
    </div>
  );
}