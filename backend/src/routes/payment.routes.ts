import { Router } from "express";
import { process } from "../controllers/payment.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

router.post("/", authenticate, authorize("CUSTOMER"), process);

export default router;