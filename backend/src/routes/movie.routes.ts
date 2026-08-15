import { Router } from "express";
import { search } from "../controllers/movie.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.get("/search", authenticate, authorize("ORGANIZER"), search);

export default router;