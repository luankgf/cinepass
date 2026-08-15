import { Router } from "express";
import {
  create,
  publish,
  listPublished,
  getById,
  listMine,
} from "../controllers/event.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

// Rotas públicas (qualquer pessoa pode ver eventos publicados)
router.get("/", listPublished);
router.get("/:id", getById);

// Rotas do organizador
router.post("/", authenticate, authorize("ORGANIZER"), create);
router.patch("/:id/publish", authenticate, authorize("ORGANIZER"), publish);
router.get("/organizer/mine", authenticate, authorize("ORGANIZER"), listMine);

export default router;