import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./src/routes/auth.routes.js";
import reminderRoutes from "./src/routes/reminder.routes.js";
import whatsappRoutes from "./src/routes/whatsapp.routes.js";
import pdfRoutes from "./src/routes/pdf.routes.js";
import invoiceRoutes from "./src/routes/invoices.routes.js";
import retailerRoutes from "./src/routes/retailers.routes.js";
import settingsRoutes from "./src/routes/settings.routes.js";
import statsRoutes from "./src/routes/stats.routes.js";

import "./src/utils/scheduler.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: [
    "https://medi-payment-reminder.vercel.app",
    "http://localhost:5173"
  ],
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => res.send("API Running"));

// Master Prompt: Serve QR Code as HTML image
app.get('/qr', (req, res) => {
  if (!global.qrImage) return res.send("QR not ready");
  res.send(`<img src="${global.qrImage}" />`);
});

app.use("/api/auth", authRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/retailers", retailerRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/stats", statsRoutes);

// Compatibility routes for existing frontend calls if any
app.use("/api/upload", pdfRoutes); 

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
