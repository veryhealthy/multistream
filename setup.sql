CREATE TABLE user (
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
    CHECK (MAIN IN ("TWITCH", "KICK", "GOOGLE"))
);

CREATE TABLE session (
    id TEXT NOT NULL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user(id),
    expires_at INTEGER NOT NULL
);
