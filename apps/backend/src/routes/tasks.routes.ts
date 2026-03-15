import { Router } from "express";
import { list, getOne, create, update, remove } from "../controllers/tasks.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", list);
router.post("/", create);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
