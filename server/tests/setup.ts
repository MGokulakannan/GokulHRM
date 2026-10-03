import dotenv from "dotenv";
import path from "path";

// Reuse the real .env (so JWT_SECRET etc match what the app expects at
// runtime) but point at a dedicated test database so these tests never
// touch real/dev data.
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const baseUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/clone";
process.env.MONGODB_URI = baseUri.replace(/\/[^/]+$/, "/gokul-hrm-test");
