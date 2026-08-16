import { Router } from "express";
import { validate, share } from "../controllers/ticket.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.post("/validate", authenticate, authorize("GATEKEEPER"), validate);
router.get("/share/:id", share);

export default router;