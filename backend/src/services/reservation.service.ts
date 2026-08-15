import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { CreateReservationInput } from "../types/reservation.types";

export async function createReservation(data: CreateReservationInput) {
  const { customerId, eventId, seatIds } = data;

  if (seatIds.length === 0) {
    throw new Error("Selecione ao menos um assento");
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event) {
    throw new Error("Evento não encontrado");
  }

  if (event.status !== "PUBLISHED") {
    throw new Error("Este evento não está disponível para reservas");
  }

  const seats = await prisma.seat.findMany({
    where: {
      id: { in: seatIds },
      eventId: eventId,
    },
  });

  if (seats.length !== seatIds.length) {
    throw new Error("Um ou mais assentos selecionados são inválidos para este evento");
  }

  try {
    const reservation = await prisma.$transaction(async (tx) => {
      const newReservation = await tx.reservation.create({
        data: {
          customerId,
          eventId,
          status: "PENDING",
        },
      });

      await tx.reservationSeat.createMany({
        data: seatIds.map((seatId) => ({
          reservationId: newReservation.id,
          seatId,
        })),
      });

      return tx.reservation.findUnique({
        where: { id: newReservation.id },
        include: {
          seats: { include: { seat: true } },
          event: true,
        },
      });
    });

    return reservation;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Um ou mais assentos já foram reservados por outro cliente");
    }
    throw error;
  }
}