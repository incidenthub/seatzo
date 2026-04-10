import path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: path.resolve("./.env")
});

import { calculatePrice } from "./src/services/pricingService.js";
import redis from "./src/config/redis.js";


const event = {
  _id: "event10",
  basePrice: 100,
  totalSeats: 100,
  availableSeats: 50,
  date: new Date(Date.now() - 1 * 60 * 60 * 1000)
};

const test = async () => {
  console.log("ENV:", process.env.MONGO_URI); // debug

  const result = await calculatePrice(event);
  console.log(result);
  
};

test();