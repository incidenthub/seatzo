import app from "./app.js";
import "./src/workers/seatExpiryWorker.js";

app.listen(5000, () => {
  console.log("Server running on port 5000");
});