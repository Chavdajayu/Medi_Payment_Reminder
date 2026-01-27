const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const reminderRoutes = require("./routes/reminder.routes");
const whatsappRoutes = require("./routes/whatsapp.routes");
const pdfRoutes = require("./routes/pdf.routes");
const invoicesRoutes = require("./routes/invoices.routes");
const retailersRoutes = require("./routes/retailers.routes");
const settingsRoutes = require("./routes/settings.routes");
const statsRoutes = require("./routes/stats.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/pdf", pdfRoutes);

// Compatibility Routes
app.use("/api/upload", pdfRoutes);
app.use("/api/invoices", invoicesRoutes);
app.use("/api/retailers", retailersRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/test", reminderRoutes);

app.get("/", (req, res) => res.send("API Running"));

module.exports = app;
