import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./lib/db.js";
import queRoutes from "./routes/queRoutes.js";
import { swaggerServe, swaggerSetup } from "./swagger/swagger.js";
dotenv.config();
const app = express();
app.use(bodyParser.json());
connectDB();
app.use("/api-docs", swaggerServe, swaggerSetup);
app.use("/api", queRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
