import { prisma } from "../lib/prisma";
import { getMovieDetails } from "./tmdb.service";
import { CreateEventInput } from "../types/event.types";

const SEATS_PER_ROW = 10;
const ROW_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export async function createEvent(data: CreateEventInput) {
  // Garante que o filme existe na nossa base local (busca na TMDb se necessário)
  let movie = await prisma.movie.findUnique({
    where: { tmdbId: data.tmdbId },
  });

  if (!movie) {
    const movieDetails = await getMovieDetails(data.tmdbId);
    movie = await prisma.movie.create({
      data: {
        tmdbId: movieDetails.tmdbId,
        title: movieDetails.title,
        overview: movieDetails.overview,
        posterUrl: movieDetails.posterUrl,
        releaseDate: movieDetails.releaseDate
          ? new Date(movieDetails.releaseDate)
          : null,
      },
    });
  }

  const seatsData = generateSeats(data.capacity);

  const event = await prisma.event.create({
    data: {
      date: new Date(data.date),
      location: data.location,
      capacity: data.capacity,
      price: data.price,
      organizerId: data.organizerId,
      movieId: movie.id,
      seats: {
        create: seatsData,
      },
    },
    include: {
      movie: true,
      seats: true,
    },
  });

  return event;
}

function generateSeats(capacity: number) {
  const seats: { row: string; number: number }[] = [];
  const totalRows = Math.ceil(capacity / SEATS_PER_ROW);

  let seatsCreated = 0;

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
    const rowLetter = ROW_LETTERS[rowIndex];
    const seatsInThisRow = Math.min(SEATS_PER_ROW, capacity - seatsCreated);

    for (let seatNumber = 1; seatNumber <= seatsInThisRow; seatNumber++) {
      seats.push({ row: rowLetter, number: seatNumber });
    }

    seatsCreated += seatsInThisRow;
  }

  return seats;
}

export async function publishEvent(eventId: string, organizerId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event) {
    throw new Error("Evento não encontrado");
  }

  if (event.organizerId !== organizerId) {
    throw new Error("Você não tem permissão para publicar este evento");
  }

  return prisma.event.update({
    where: { id: eventId },
    data: { status: "PUBLISHED" },
  });
}

export async function listPublishedEvents() {
  return prisma.event.findMany({
    where: { status: "PUBLISHED" },
    include: { movie: true },
    orderBy: { date: "asc" },
  });
}

export async function getEventById(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      movie: true,
      seats: {
        include: { reservation: true },
      },
    },
  });

  if (!event) {
    throw new Error("Evento não encontrado");
  }

  return event;
}

export async function listOrganizerEvents(organizerId: string) {
  return prisma.event.findMany({
    where: { organizerId },
    include: { movie: true },
    orderBy: { createdAt: "desc" },
  });
}