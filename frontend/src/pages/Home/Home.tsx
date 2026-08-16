import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { listPublishedEvents } from "../../services/event.service";
import type { Event } from "../../types/event";
import styles from "./Home.module.css";

export function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await listPublishedEvents();
        setEvents(data);
      } catch {
        setError("Não foi possível carregar os eventos.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatPrice(price: string) {
    return Number(price).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.logo}>CinePass</h1>

        {isAuthenticated ? (
          <div className={styles.userInfo}>
            <span>{user?.name}</span>
            <button onClick={logout} className={styles.logoutButton}>
              Sair
            </button>
          </div>
        ) : (
          <Link to="/login" className={styles.loginLink}>
            Entrar
          </Link>
        )}
      </header>

      <main className={styles.main}>
        <h2 className={styles.sectionTitle}>Em cartaz</h2>

        {loading && <p className={styles.status}>Carregando eventos...</p>}
        {error && <p className={styles.status}>{error}</p>}
        {!loading && !error && events.length === 0 && (
          <p className={styles.status}>Nenhum evento publicado no momento.</p>
        )}

        <div className={styles.grid}>
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className={styles.card}
            >
              {event.movie.posterUrl && (
                <img
                  src={event.movie.posterUrl}
                  alt={event.movie.title}
                  className={styles.poster}
                />
              )}
              <div className={styles.cardBody}>
                <h3 className={styles.movieTitle}>{event.movie.title}</h3>
                <p className={styles.eventInfo}>{formatDate(event.date)}</p>
                <p className={styles.eventInfo}>{event.location}</p>
                <p className={styles.price}>
                  A partir de {formatPrice(event.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}