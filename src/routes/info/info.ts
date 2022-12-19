import express from "express";
import { getInfo } from "../../controller/info"

const router = express.Router();

router.route("/").get(getInfo);

export default router;
