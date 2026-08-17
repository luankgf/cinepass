import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { createReservation } from "../../services/reservation.service";
import { processPayment } from "../../services/payment.service";
import type { Reservation } from "../../types/reservation";
import styles from "./Checkout.module.css";

interface LocationState {
  eventId: string;
  seatIds: string[];
}

export function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [paying, setPaying] = useState(false);
  const [result, setResult] = useState<Reservation | null>(null);

  const hasReserved = useRef(false);

  useEffect(() => {
    if (!state?.eventId || !state?.seatIds?.length) {
      navigate("/");
      return;
    }

    if (hasReserved.current) return;
    hasReserved.current = true;

    async function reserve() {
      try {
        const data = await createReservation({
          eventId: state!.eventId,
          seatIds: state!.seatIds,
        });
        setReservation(data);
      } catch (err) {
        if (isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("Não foi possível reservar os assentos.");
        }
      } finally {
        setLoading(false);
      }
    }

    reserve();
  }, []);

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!reservation) return;

    setPaying(true);
    setError("");

    try {
      const data = await processPayment({
        reservationId: reservation.id,
        cardNumber,
        cardName,
      });
      setResult(data);
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Erro ao processar pagamento.");
      }
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return <div className={styles.status}>Reservando seus assentos...</div>;
  }

  if (error && !reservation) {
    return (
      <div className={styles.status}>
        <p>{error}</p>
        <button onClick={() => navigate("/")} className={styles.backButton}>
          Voltar para eventos
        </button>
      </div>
    );
  }

  if (result) {
    const approved = result.status === "CONFIRMED";

    return (
      <div className={styles.container}>
        <div className={styles.resultCard}>
          {approved ? (
            <>
              <h1 className={styles.resultTitleSuccess}>Pagamento aprovado!</h1>
              <p className={styles.resultText}>
                Seus ingressos já estão disponíveis em "Meus Ingressos".
              </p>
              <button
                onClick={() => navigate("/my-tickets")}
                className={styles.continueButton}
              >
                Ver meus ingressos
              </button>
            </>
          ) : (
            <>
              <h1 className={styles.resultTitleError}>Pagamento recusado</h1>
              <p className={styles.resultText}>
                Os assentos foram liberados. Você pode tentar novamente.
              </p>
              <button onClick={() => navigate("/")} className={styles.backButton}>
                Voltar para eventos
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const seatLabels = reservation?.seats
    .map((s) => `${s.seat.row}${s.seat.number}`)
    .join(", ");

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Confirmar Pagamento</h1>

        <div className={styles.summary}>
          <p>
            Assentos: <strong>{seatLabels}</strong>
          </p>
        </div>

        <form onSubmit={handlePayment} className={styles.form}>
          <label className={styles.label}>
            Número do cartão
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="0000 0000 0000 0000"
              required
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Nome no cartão
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="João da Silva"
              required
              className={styles.input}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <p className={styles.hint}>
            Cartão de teste — aprovado: <code>4242 4242 4242 4242</code>{" "}
            | recusado: <code>4000 0000 0000 0002</code>
          </p>

          <button type="submit" disabled={paying} className={styles.button}>
            {paying ? "Processando..." : "Pagar"}
          </button>
        </form>
      </div>
    </div>
  );
}