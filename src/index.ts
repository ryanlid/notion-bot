import dotenv from "dotenv";
import express, { Express } from "express";
import path from "path";
import routes from "./routes/routes";

dotenv.config();

const app: Express = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: false }));

app.use(express.json())

app.use(express.static(path.join(__dirname, "public")));

app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
