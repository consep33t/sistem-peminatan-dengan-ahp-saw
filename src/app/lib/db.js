import mysql from "mysql2/promise";

let pool;

export async function getConnection() {
  if (!pool) {
    pool = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "Sipacantik1577#",
      database: "sistem_peminatan",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}
