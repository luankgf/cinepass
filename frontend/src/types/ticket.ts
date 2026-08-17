import type { Event } from "./event";
import type { Seat } from "./seat";

export type TicketSeat = Omit<Seat, "reservation">;

export interface TicketReservation {
  id: string;
  status: string;
  customerId: string;
  eventId: string;
  createdAt: string;
  updatedAt: string;
  event: Event;
}

export interface TicketReservationSeat {
  id: string;
  reservationId: string;
  seatId: string;
  seat: TicketSeat;
  reservation: TicketReservation;
}

export interface Ticket {
  id: string;
  qrCode: string;
  usedAt: string | null;
  customerId: string;
  reservationSeatId: string;
  createdAt: string;
  reservationSeat: TicketReservationSeat;
}