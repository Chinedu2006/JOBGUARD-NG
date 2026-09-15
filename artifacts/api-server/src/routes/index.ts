import { Router, type IRouter } from "express";
import healthRouter from "./health";
import opportunitiesRouter from "./opportunities";
import analysisRouter from "./analysis";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(opportunitiesRouter);
router.use(analysisRouter);
router.use(reportsRouter);

export default router;
