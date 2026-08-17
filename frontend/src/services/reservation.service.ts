import { api } from "./api";
import type { Reservation } from "../types/reservation";

interface CreateReservationInput {
  eventId: string;
  seatIds: string[];
}

export async function createReservation(
  data: CreateReservationInput
): Promise<Reservation> {
  const response = await api.post<Reservation>("/reservations", data);
  return response.data;
}