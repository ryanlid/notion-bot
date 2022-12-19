import express from "express";
import { addMovieInfo } from "../../controller/movie";
const router = express.Router();

router.route("/").post(addMovieInfo);

export default router;
