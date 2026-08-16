import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { ValidateTicketInput, ValidationResult } from "../types/ticket.types";

export async function validateTicket(
  data: ValidateTicketInput
): Promise<ValidationResult> {
  const { qrCode, eventId } = data;

  const [reservationSeatId, signature] = qrCode.split(".");

  if (!reservationSeatId || !signature) {
    return { status: "INVALID", reason: "Código em formato inválido" };
  }

  const expectedSignature = generateSignature(reservationSeatId);

  if (signature !== expectedSignature) {
    return { status: "INVALID", reason: "Código não pôde ser verificado" };
  }

  const ticket = await prisma.ticket.findUnique({
    where: { reservationSeatId },
    include: {
      reservationSeat: {
        include: {
          seat: true,
          reservation: { include: { event: true } },
        },
      },
      customer: true,
    },
  });

  if (!ticket) {
    return { status: "INVALID", reason: "Ingresso não encontrado" };
  }

  if (ticket.usedAt) {
    return { status: "ALREADY_USED", usedAt: ticket.usedAt };
  }

  const ticketEventId = ticket.reservationSeat.reservation.eventId;

  if (ticketEventId !== eventId) {
    return {
      status: "WRONG_EVENT",
      reason: "Este ingresso pertence a outro evento",
    };
  }

  const updatedTicket = await prisma.ticket.update({
  where: { id: ticket.id },
  data: { usedAt: new Date() },
  include: {
    reservationSeat: { include: { seat: true } },
    customer: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
});

  return { status: "VALID", ticket: updatedTicket };
}

function generateSignature(reservationSeatId: string) {
  const secret = process.env.JWT_SECRET as string;
  return crypto
    .createHmac("sha256", secret)
    .update(reservationSeatId)
    .digest("hex")
    .slice(0, 16);
}

export async function getTicketForShare(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      reservationSeat: {
        include: {
          seat: true,
          reservation: { include: { event: { include: { movie: true } } } },
        },
      },
      customer: {
        select: { name: true },
      },
    },
  });

  if (!ticket) {
    throw new Error("Ingresso não encontrado");
  }

  const event = ticket.reservationSeat.reservation.event;
  const seat = ticket.reservationSeat.seat;

  return {
    ticketId: ticket.id,
    status: ticket.usedAt ? "USED" : "VALID",
    customerName: ticket.customer.name,
    seat: { row: seat.row, number: seat.number },
    movie: {
      title: event.movie.title,
      posterUrl: event.movie.posterUrl,
    },
    event: {
      date: event.date,
      location: event.location,
    },
  };
}