import type { Movie } from "./movie";
import type { Seat } from "./seat";

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";

export interface Event {
  id: string;
  date: string;
  location: string;
  capacity: number;
  price: string;
  status: EventStatus;
  organizerId: string;
  movieId: string;
  createdAt: string;
  updatedAt: string;
  movie: Movie;
}

export interface EventDetails extends Event {
  seats: Seat[];
}