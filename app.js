import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import generateRouter from "./routes/generate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/generate", generateRouter);

app.get("/about", function (req, res) {
  res.sendFile(path.join(__dirname, "public/about.html"));
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
