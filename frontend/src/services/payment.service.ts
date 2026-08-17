import { api } from "./api";
import type { Reservation } from "../types/reservation";

interface ProcessPaymentInput {
  reservationId: string;
  cardNumber: string;
  cardName: string;
}

export async function processPayment(
  data: ProcessPaymentInput
): Promise<Reservation> {
  const response = await api.post<Reservation>("/payments", data);
  return response.data;
}