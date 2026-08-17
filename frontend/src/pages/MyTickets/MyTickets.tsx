import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { listMyTickets } from "../../services/ticket.service";
import type { Ticket } from "../../types/ticket";
import { isAxiosError } from "axios";
import styles from "./MyTickets.module.css";

export function MyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const data = await listMyTickets();
        setTickets(data);
      } catch (err) {
        if (isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("Erro ao buscar seus ingressos");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, []);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handleShare(ticketId: string) {
    const url = `${window.location.origin}/tickets/share/${ticketId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(ticketId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) {
    return <p className={styles.message}>Carregando ingressos...</p>;
  }

  if (error) {
    return <p className={styles.message}>{error}</p>;
  }

  if (tickets.length === 0) {
    return <p className={styles.message}>Você ainda não possui ingressos.</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Meus ingressos</h1>

      <div className={styles.list}>
        {tickets.map((ticket) => {
          const event = ticket.reservationSeat.reservation.event;
          const seat = ticket.reservationSeat.seat;
          const used = ticket.usedAt !== null;

          return (
            <div key={ticket.id} className={styles.card}>
              <div className={styles.info}>
                <div className={styles.header}>
                  <h2 className={styles.movieTitle}>{event.movie.title}</h2>
                  <span
                    className={used ? styles.statusUsed : styles.statusAvailable}
                  >
                    {used ? "Utilizado" : "Disponível"}
                  </span>
                </div>

                <p className={styles.detail}>{formatDate(event.date)}</p>
                <p className={styles.detail}>{event.location}</p>
                <p className={styles.detail}>
                  Assento {seat.row}
                  {seat.number}
                </p>

                {used && ticket.usedAt && (
                  <p className={styles.usedInfo}>
                    Utilizado em {formatDate(ticket.usedAt)}
                  </p>
                )}
              </div>

              <div className={styles.qrArea}>
                <QRCodeSVG value={ticket.qrCode} size={140} />

                {!used && (
                  <button
                    className={styles.shareButton}
                    onClick={() => handleShare(ticket.id)}
                  >
                    {copiedId === ticket.id ? "Link copiado!" : "Compartilhar ingresso"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}