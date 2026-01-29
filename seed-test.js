import db from "./src/config/firebase.js";

const TEST_USER_ID = "LOCAL_TEST_USER";

async function seed() {
  const userRef = db.collection("users").doc(TEST_USER_ID);
  // Retailer
  await userRef.collection("retailers").doc("retailerA").set({ name: "Retailer A" });
  // Invoices
  const now = Date.now();
  await userRef.collection("invoices").doc("inv_paid").set({
    amount: 1500,
    status: "paid",
    dueDate: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
  await userRef.collection("invoices").doc("inv_unpaid_future").set({
    amount: 750,
    status: "pending",
    dueDate: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString(),
  });
  await userRef.collection("invoices").doc("inv_unpaid_overdue").set({
    amount: 300,
    status: "pending",
    dueDate: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
  });
}

async function test() {
  const base = "http://localhost:5000/api/dashboard-overview";
  // Test missing userId
  const resMissing = await fetch(base);
  console.log("GET /api/dashboard-overview status:", resMissing.status);
  const dataMissing = await resMissing.text();
  console.log("Body:", dataMissing);

  // Test with userId
  const res = await fetch(`${base}/${TEST_USER_ID}`);
  console.log(`GET /api/dashboard-overview/${TEST_USER_ID} status:`, res.status);
  const json = await res.json();
  console.log("Response JSON:", JSON.stringify(json, null, 2));
}

seed()
  .then(test)
  .then(() => {
    console.log("Seed and test completed");
    process.exit(0);
  })
  .catch((e) => {
    console.error("Seed/test failed:", e);
    process.exit(1);
  });
