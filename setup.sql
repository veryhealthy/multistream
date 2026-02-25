CREATE TABLE user (
    id INTEGER NOT NULL PRIMARY KEY,
    google_id TEXT UNIQUE,
    twitch_id TEXT UNIQUE,
    kick_id TEXT UNIQUE,
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
    CHECK (google_id IS NOT NULL OR twitch_id IS NOT NULL OR kick_id IS NOT NULL)
);

CREATE TABLE session (
    id TEXT NOT NULL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user(id),
    expires_at INTEGER NOT NULL
);
