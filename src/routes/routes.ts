import express from "express";
import info from "./info/info";
import movie from "./movie/movie";

const router = express.Router();

router.use("/info", info);
router.use("/movie", movie);

export default router;
