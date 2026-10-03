// Must be the first import: app.ts reads env vars (e.g. CORS_ORIGIN) when it loads.
import "dotenv/config";
import app from "./app";
import connectDB from "./config/database";
import { bootstrapAdmin } from "./utils/bootstrapAdmin";

const missing = ["MONGODB_URI", "JWT_SECRET"].filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

if (process.env.NODE_ENV === "production" && (process.env.JWT_SECRET as string).length < 32) {
  console.error("JWT_SECRET must be at least 32 characters in production");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await bootstrapAdmin();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
