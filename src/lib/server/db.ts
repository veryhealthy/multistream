import { Database } from "bun:sqlite";

export const db = new Database("mydb.sqlite");

// enable WAL mode
db.run("PRAGMA journal_mode = WAL;");
