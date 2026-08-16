import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

function generateQrCode(reservationSeatId: string) {
  const secret = process.env.JWT_SECRET as string;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(reservationSeatId)
    .digest("hex")
    .slice(0, 16);

  return `${reservationSeatId}.${signature}`;
}

async function main() {
  console.log("Iniciando seed...");

  const passwordHash = await bcrypt.hash("123456", 10);

  await prisma.ticket.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.reservationSeat.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.event.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany();

  const organizer = await prisma.user.create({
    data: {
      name: "Maria Organizadora",
      email: "organizador@cinepass.com",
      passwordHash,
      role: "ORGANIZER",
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: "João Cliente",
      email: "cliente1@cinepass.com",
      passwordHash,
      role: "CUSTOMER",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: "Ana Cliente",
      email: "cliente2@cinepass.com",
      passwordHash,
      role: "CUSTOMER",
    },
  });

  const gatekeeper = await prisma.user.create({
    data: {
      name: "Carlos Portaria",
      email: "portaria@cinepass.com",
      passwordHash,
      role: "GATEKEEPER",
    },
  });

  console.log("Usuários criados.");

  const movie = await prisma.movie.create({
    data: {
      tmdbId: 438631,
      title: "Duna",
      overview:
        "Em um futuro distante, planetas são comandados por casas nobres que fazem parte de um império feudal intergalático. Paul Atreides é um jovem cuja família toma o controle do planeta deserto Arrakis.",
      posterUrl:
        "https://image.tmdb.org/t/p/w500/uzERcfV2rSHNhW5eViQiO9hNiA7.jpg",
      releaseDate: new Date("2021-09-15"),
    },
  });

  console.log("Filme criado.");

  const SEATS_PER_ROW = 10;
  const ROW_LETTERS = "ABCDE";
  const capacity = 50;

  const seatsData = [];
  for (const rowLetter of ROW_LETTERS) {
    for (let number = 1; number <= SEATS_PER_ROW; number++) {
      seatsData.push({ row: rowLetter, number });
    }
  }

  const event = await prisma.event.create({
    data: {
      date: new Date("2026-09-20T19:00:00"),
      location: "Cinemark Shopping Center - Sala 4",
      capacity,
      price: 35.0,
      status: "PUBLISHED",
      organizerId: organizer.id,
      movieId: movie.id,
      seats: { create: seatsData },
    },
    include: { seats: true },
  });

  console.log("Evento publicado criado com 50 assentos.");

  const seatA1 = event.seats.find((s) => s.row === "A" && s.number === 1)!;
  const seatA2 = event.seats.find((s) => s.row === "A" && s.number === 2)!;

  const reservation = await prisma.reservation.create({
    data: {
      customerId: customer1.id,
      eventId: event.id,
      status: "CONFIRMED",
    },
  });

  const reservationSeat1 = await prisma.reservationSeat.create({
    data: { reservationId: reservation.id, seatId: seatA1.id },
  });

  const reservationSeat2 = await prisma.reservationSeat.create({
    data: { reservationId: reservation.id, seatId: seatA2.id },
  });

  await prisma.payment.create({
    data: {
      reservationId: reservation.id,
      status: "APPROVED",
      amount: 35.0,
    },
  });

  await prisma.ticket.create({
    data: {
      customerId: customer1.id,
      reservationSeatId: reservationSeat1.id,
      qrCode: generateQrCode(reservationSeat1.id),
    },
  });

  await prisma.ticket.create({
    data: {
      customerId: customer1.id,
      reservationSeatId: reservationSeat2.id,
      qrCode: generateQrCode(reservationSeat2.id),
    },
  });

  console.log("Reserva confirmada com ingressos criada para o Cliente 1.");

  console.log("\nSeed finalizado com sucesso!\n");
  console.log("Usuários de teste (senha para todos: 123456):");
  console.log(`  Organizador: ${organizer.email}`);
  console.log(`  Cliente 1:   ${customer1.email}`);
  console.log(`  Cliente 2:   ${customer2.email}`);
  console.log(`  Portaria:    ${gatekeeper.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });