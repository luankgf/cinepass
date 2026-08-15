import { Router } from "express";
import { create } from "../controllers/reservation.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.post("/", authenticate, authorize("CUSTOMER"), create);

export default router;