// app/utils/db.server.ts
import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/remix-crud";

let connection: typeof mongoose | null = null;

export async function connectDB() {
  if (connection) return;
  connection = await mongoose.connect(MONGO_URL);
}
