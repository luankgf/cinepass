import type { Seat } from "../../types/seat";
import styles from "./SeatMap.module.css";

interface SeatMapProps {
  seats: Seat[];
  selectedSeatIds: string[];
  onToggleSeat: (seatId: string) => void;
}

export function SeatMap({ seats, selectedSeatIds, onToggleSeat }: SeatMapProps) {
  const rows = Array.from(new Set(seats.map((seat) => seat.row))).sort();

  return (
    <div className={styles.container}>
      <div className={styles.screen}>TELA</div>

      <div className={styles.rows}>
        {rows.map((row) => (
          <div key={row} className={styles.row}>
            <span className={styles.rowLabel}>{row}</span>
            <div className={styles.seats}>
              {seats
                .filter((seat) => seat.row === row)
                .sort((a, b) => a.number - b.number)
                .map((seat) => {
                  const isOccupied = seat.reservation !== null;
                  const isSelected = selectedSeatIds.includes(seat.id);

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => onToggleSeat(seat.id)}
                      className={[
                        styles.seat,
                        isOccupied ? styles.occupied : "",
                        isSelected ? styles.selected : "",
                      ].join(" ")}
                      title={`${seat.row}${seat.number}`}
                    >
                      {seat.number}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.free}`} /> Livre
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.selected}`} /> Selecionado
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.occupied}`} /> Ocupado
        </span>
      </div>
    </div>
  );
}