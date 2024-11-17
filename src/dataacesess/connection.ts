import mysql from "mysql2/promise";

export async function connectMySQL() {
  return mysql.createConnection({
    host: "localhost",
    user: "reversi",
    database: "reversi",
    password: "password",
  });
}
