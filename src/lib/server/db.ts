import { Database } from "bun:sqlite";

export const db = new Database(process.env.NODE_ENV === "development" ? "db.sqlite" : "/app/db.sqlite", {
    create: true,
});

// enable WAL mode
db.run("PRAGMA journal_mode = WAL;");
// foreign keys
db.run("PRAGMA foreign_keys = ON");

db.run(`CREATE TABLE IF NOT EXISTS user (
    id INTEGER NOT NULL PRIMARY KEY,
    main TEXT,
    google_id TEXT,
    twitch_id TEXT,
    kick_id TEXT,
    google_email TEXT,
    twitch_email TEXT,
    kick_email TEXT,
    name TEXT NOT NULL,
    picture TEXT NOT NULL,
    google_access_token TEXT,
    google_refresh_token TEXT,
    google_token_expires_at INTEGER,
    twitch_access_token TEXT,
    twitch_refresh_token TEXT,
    twitch_token_expires_at INTEGER,
    kick_access_token TEXT,
    kick_refresh_token TEXT,
    kick_token_expires_at INTEGER,
    CHECK (google_id IS NOT NULL OR twitch_id IS NOT NULL OR kick_id IS NOT NULL),
    CHECK (main IN ('TWITCH', 'KICK', 'GOOGLE'))
)`);

db.run(`CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user(id),
    expires_at INTEGER NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS message (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    platform_message_id TEXT NOT NULL,
    username TEXT NOT NULL,
    profile_picture TEXT,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    source TEXT NOT NULL,
    CHECK (source IN ('TWITCH', 'KICK', 'GOOGLE')),
    FOREIGN KEY (user_id) REFERENCES user(id)
)`);

db.run(`CREATE INDEX IF NOT EXISTS idx_message_user_id ON message(user_id)`);
