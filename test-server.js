import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dashboardRoutes from "./src/routes/dashboard.js";
import db from "./src/config/firebase.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Log middleware
app.use((req, res, next) => {
  console.log(`[TEST] ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api", dashboardRoutes);

const PORT = 5000;

app.listen(PORT, async () => {
  console.log(`Test server running on port ${PORT}`);
  
  // Auto-run test
  try {
    const TEST_USER_ID = "TEST_USER_ID";
    console.log(`\nTesting API for user: ${TEST_USER_ID}...`);
    
    // Create test data if needed
    const userRef = db.collection("users").doc(TEST_USER_ID);
    await userRef.collection("retailers").doc("test_retailer").set({ name: "Test Retailer" });
    await userRef.collection("invoices").doc("test_invoice").set({ 
      amount: 1000, 
      status: "pending",
      dueDate: new Date(Date.now() + 86400000) // Tomorrow
    });
    console.log("Test data verified/created.");

    // Fetch from API
    const response = await fetch(`http://localhost:${PORT}/api/dashboard-overview/${TEST_USER_ID}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("\n✅ API Success! Response:");
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error(`\n❌ API Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(text);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
});