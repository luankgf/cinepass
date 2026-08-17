import type { Seat } from "./seat";

export type ReservationStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";

export interface ReservationSeat {
  id: string;
  reservationId: string;
  seatId: string;
  seat: Seat;
  ticket?: Ticket;
}

export interface Ticket {
  id: string;
  qrCode: string;
  usedAt: string | null;
  customerId: string;
  reservationSeatId: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  status: "APPROVED" | "REJECTED";
  amount: string;
  reservationId: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  status: ReservationStatus;
  customerId: string;
  eventId: string;
  createdAt: string;
  updatedAt: string;
  seats: ReservationSeat[];
  payment?: Payment;
}