export interface SeatReservation {
  id: string;
  reservationId: string;
  seatId: string;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  eventId: string;
  reservation: SeatReservation | null;
}