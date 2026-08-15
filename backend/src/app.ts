import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import { authenticate } from "./middlewares/authenticate";
import { authorize } from "./middlewares/authorize";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "CinePass API rodando 🎬" });
});

app.use("/auth", authRoutes);

export default app;