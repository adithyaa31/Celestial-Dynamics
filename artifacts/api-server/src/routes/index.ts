import { Router, type IRouter } from "express";
import healthRouter from "./health";
import solarRouter from "./solar";
import forecastRouter from "./forecast";
import alertsRouter from "./alerts";
import analyticsRouter from "./analytics";
import modelRouter from "./model";
import datasetsRouter from "./datasets";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/solar", solarRouter);
router.use("/forecast", forecastRouter);
router.use("/alerts", alertsRouter);
router.use("/analytics", analyticsRouter);
router.use("/model", modelRouter);
router.use("/datasets", datasetsRouter);

export default router;
