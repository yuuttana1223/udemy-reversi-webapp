import express from "express";
import morgan from "morgan";
import "express-async-errors";

const PORT = 3000;
const app = express();

app.use(morgan("dev"));
app.use(express.static("static", { extensions: ["html"] }));

app.get("/api/hello", async (req, res) => {
  res.json({ message: "Hello World" });
});

app.get("/api/error", async (req, res) => {
  throw new Error("error endpoint");
});

app.post("/api/games", async (req, res) => {
  const startedAt = new Date();
  console.log("Started at", startedAt);
  res.status(201).end();
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

function errorHandler(
  err: any,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) {
  console.error("Unexpected error occurred", err);
  res.status(500).send({ message: "Unexpected error occurred" });
}
