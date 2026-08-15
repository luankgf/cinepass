import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import { authenticate } from "./middlewares/authenticate";
import { authorize } from "./middlewares/authorize";
import movieRoutes from "./routes/movie.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "CinePass API rodando 🎬" });
});

app.use("/auth", authRoutes);

app.use("/movies", movieRoutes);

export default app;