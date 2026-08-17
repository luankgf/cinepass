import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById } from "../../services/event.service";
import { SeatMap } from "../../components/SeatMap/SeatMap";
import { useAuth } from "../../contexts/AuthContext";
import type { EventDetails as EventDetailsType } from "../../types/event";
import styles from "./EventDetails.module.css";

export function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [event, setEvent] = useState<EventDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadEvent() {
      if (!id) return;

      try {
        const data = await getEventById(id);
        setEvent(data);
      } catch {
        setError("Não foi possível carregar este evento.");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  function toggleSeat(seatId: string) {
    setSelectedSeatIds((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  }

  function handleContinue() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "CUSTOMER") {
      alert("Apenas clientes podem reservar assentos.");
      return;
    }

    navigate("/checkout", {
      state: { eventId: event?.id, seatIds: selectedSeatIds },
    });
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("pt-BR", {
      weekday: "long",
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

  if (loading) {
    return <div className={styles.status}>Carregando...</div>;
  }

  if (error || !event) {
    return <div className={styles.status}>{error || "Evento não encontrado."}</div>;
  }

  const total = selectedSeatIds.length * Number(event.price);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.info}>
          {event.movie.posterUrl && (
            <img
              src={event.movie.posterUrl}
              alt={event.movie.title}
              className={styles.poster}
            />
          )}
          <div>
            <h1 className={styles.title}>{event.movie.title}</h1>
            <p className={styles.detail}>{formatDate(event.date)}</p>
            <p className={styles.detail}>{event.location}</p>
            <p className={styles.detail}>{formatPrice(event.price)} por ingresso</p>
            <p className={styles.overview}>{event.movie.overview}</p>
          </div>
        </div>

        <div className={styles.seatSection}>
          <h2 className={styles.sectionTitle}>Escolha seus assentos</h2>
          <SeatMap
            seats={event.seats}
            selectedSeatIds={selectedSeatIds}
            onToggleSeat={toggleSeat}
          />
        </div>

        {selectedSeatIds.length > 0 && (
          <div className={styles.summary}>
            <span>
              {selectedSeatIds.length} assento(s) selecionado(s) — Total: {" "}
              <strong>{formatPrice(String(total))}</strong>
            </span>
            <button onClick={handleContinue} className={styles.continueButton}>
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}