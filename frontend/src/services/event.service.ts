import { api } from "./api";
import type { Event } from "../types/event";

export async function listPublishedEvents(): Promise<Event[]> {
  const response = await api.get<Event[]>("/events");
  return response.data;
}