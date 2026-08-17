import { api } from "./api";
import type { Event, EventDetails } from "../types/event";

export async function listPublishedEvents(): Promise<Event[]> {
  const response = await api.get<Event[]>("/events");
  return response.data;
}

export async function getEventById(id: string): Promise<EventDetails> {
  const response = await api.get<EventDetails>(`/events/${id}`);
  return response.data;
}