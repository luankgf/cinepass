import { api } from "./api";
import type { Ticket } from "../types/ticket";

export async function listMyTickets(): Promise<Ticket[]> {
  const response = await api.get<Ticket[]>("/tickets/mine");
  return response.data;
}