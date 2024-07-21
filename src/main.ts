import express from "express";

const PORT = 3000;
const app = express();

app.get("/", async (req, res) => {
  res.json({ message: "Hello World" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
