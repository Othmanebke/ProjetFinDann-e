import { Router } from "express";
import { list, getOne, create, update, remove, stats } from "../controllers/projects.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", list);
router.post("/", create);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);
router.get("/:id/stats", stats);

export default router;
