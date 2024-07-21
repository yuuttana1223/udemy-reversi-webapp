import express from "express";
import morgan from "morgan";

const PORT = 3000;
const app = express();

app.use(morgan("dev"));

app.get("/api/hello", async (req, res) => {
  res.json({ message: "Hello World" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
