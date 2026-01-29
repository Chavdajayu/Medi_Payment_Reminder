import express from "express";
import db from "../config/firebase.js";

const router = express.Router();

router.get("/dashboard-overview", (req, res) => {
  res.status(400).json({ 
    error: "User ID is required",
    message: "Please use the format: /api/dashboard-overview/:userId" 
  });
});

router.get("/dashboard-overview/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // References to collections
    const retailersRef = db.collection("users").doc(userId).collection("retailers");
    const invoicesRef = db.collection("users").doc(userId).collection("invoices");

    // Fetch data in parallel
    const [retailersSnap, invoicesSnap] = await Promise.all([
      retailersRef.get(),
      invoicesRef.get()
    ]);

    const totalRetailers = retailersSnap.size;

    let totalOutstanding = 0;
    let totalPaid = 0;
    let totalUnpaid = 0;
    let totalOverdue = 0;

    const now = new Date();

    invoicesSnap.forEach(doc => {
      const data = doc.data();
      const amount = Number(data.amount || 0);

      // Status check (case insensitive)
      const status = (data.status || "").toLowerCase();

      if (status === "paid") {
        totalPaid += amount;
      } else {
        // Unpaid or Pending
        totalUnpaid += amount;
        totalOutstanding += amount;

        // Check overdue
        if (data.dueDate) {
          let dueDate;
          // Handle Firestore Timestamp or String
          if (data.dueDate.toDate) {
             dueDate = data.dueDate.toDate();
          } else {
             dueDate = new Date(data.dueDate);
          }

          if (dueDate < now) {
            totalOverdue += amount;
          }
        }
      }
    });

    res.json({
      totalRetailers,
      totalOutstanding,
      totalPaid,
      totalUnpaid,
      totalOverdue
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

export default router;
