import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// Routes
import authRoutes from "./src/routes/auth.routes.js";
import reminderRoutes from "./src/routes/reminder.routes.js";
import whatsappRoutes from "./src/routes/whatsapp.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/whatsapp", whatsappRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
