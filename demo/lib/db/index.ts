import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import "dotenv/config";

const connection = mysql.createPool({
  uri: process.env.DATABASE_URL!,
  charset: "utf8mb4", // 한글 깨짐 방지
});

export const db = drizzle(connection, { schema, mode: "default" });
