import { db } from "./db";

export function createUserWithGoogle(
    googleId: string,
    email: string,
    name: string,
    picture: string,
    accessToken: string,
    expiresAt: number,
): User {
    const row = db
        .query(
            "INSERT INTO user(google_id, google_email, name, picture, google_access_token, google_token_expires_at) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
        )
        .get(googleId, email, name, picture, accessToken, expiresAt) as { id: number } | null;

    if (row === null) {
        throw new Error("Failed to create user");
    }

    return {
        id: row.id,
        email,
        name,
        picture,
        googleAccessToken: accessToken,
        googleTokenExpiresAt: expiresAt,
    };
}

export function createUserWithTwitch(
    twitchId: string,
    email: string,
    name: string,
    picture: string,
    accessToken: string,
    refreshToken: string,
    expiresAt: number,
): User {
    const row = db
        .query(
            "INSERT INTO user (twitch_id, twitch_email, name, picture, twitch_access_token, twitch_refresh_token, twitch_token_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id",
        )
        .get(twitchId, email, name, picture, accessToken, refreshToken, expiresAt) as { id: number } | null;

    if (row === null) {
        throw new Error("Failed to create user");
    }

    return {
        id: row.id,
        email,
        name,
        picture,
        twitchAccessToken: accessToken,
        twitchRefreshToken: refreshToken,
        twitchTokenExpiresAt: expiresAt,
    };
}

export function createUserWithKick(
    kickId: string,
    email: string,
    name: string,
    picture: string,
    accessToken: string,
    refreshToken: string,
    expiresAt: number,
): User {
    const row = db
        .query(
            "INSERT INTO user (kick_id, kick_email, name, picture, kick_access_token, kick_refresh_token, kick_token_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id",
        )
        .get(kickId, email, name, picture, accessToken, refreshToken, expiresAt) as { id: number } | null;

    if (row === null) {
        throw new Error("Failed to create user");
    }

    return {
        id: row.id,
        kickEmail: email,
        name,
        picture,
        kickAccessToken: accessToken,
        kickRefreshToken: refreshToken,
        kickTokenExpiresAt: expiresAt,
    };
}

export function getGoogleUser(email: string): { id: number } | null {
    const row = db
        .query(
            `
        SELECT
            id
        FROM user
        WHERE google_email = ?
        `,
        )
        .get(email) as UserRow | null;
    if (row === null) {
        return null;
    }
    return { id: row.id };
}

export function getTwitchUser(email: string): { id: number } | null {
    const row = db
        .query(
            `
        SELECT
            id
        FROM user
        WHERE twitch_email = ?
        `,
        )
        .get(email) as UserRow | null;
    if (row === null) {
        return null;
    }
    return { id: row.id };
}

export function getKickUser(email: string): { id: number } | null {
    const row = db
        .query(
            `
        SELECT
            id
        FROM user
        WHERE kick_email = ?
        `,
        )
        .get(email) as UserRow | null;
    if (row === null) {
        return null;
    }
    return { id: row.id };
}

export function updateTokens(
    userId: number,
    provider: "google" | "twitch" | "kick",
    accessToken: string,
    refreshToken: string,
    expiresAt: number,
) {
    db.query(
        `UPDATE user SET ${provider}_access_token = ?, ${provider}_refresh_token = ?, ${provider}_token_expires_at = ? WHERE id = ?`,
    ).run(accessToken, refreshToken, expiresAt, userId);
}

export function overwriteUserInfo({
    userId,
    twitchId,
    twitchAccessToken,
    twitchRefreshToken,
    twitchTokenExpiresAt,
    googleId,
    googleAccessToken,
    googleTokenExpiresAt,
    kickId,
    kickAccessToken,
    kickRefreshToken,
    kickTokenExpiresAt,
}: {
    userId: number;
    twitchId?: string | null;
    twitchAccessToken?: string | null;
    twitchRefreshToken?: string | null;
    twitchTokenExpiresAt?: number | null;
    googleId?: string | null;
    googleAccessToken?: string | null;
    googleTokenExpiresAt?: number | null;
    kickId?: string | null;
    kickAccessToken?: string | null;
    kickRefreshToken?: string | null;
    kickTokenExpiresAt?: number | null;
}) {
    db.query(
        `
        UPDATE user
        SET
            twitch_id = COALESCE(?, twitch_id),
            twitch_access_token = COALESCE(?, twitch_access_token),
            twitch_refresh_token = COALESCE(?, twitch_refresh_token),
            twitch_token_expires_at = COALESCE(?, twitch_token_expires_at),
            google_id = COALESCE(?, google_id),
            google_access_token = COALESCE(?, google_access_token),
            google_token_expires_at = COALESCE(?, google_token_expires_at),
            kick_id = COALESCE(?, kick_id),
            kick_access_token = COALESCE(?, kick_access_token),
            kick_refresh_token = COALESCE(?, kick_refresh_token),
            kick_token_expires_at = COALESCE(?, kick_token_expires_at)
        WHERE id = ?
        `,
    ).run(
        twitchId,
        twitchAccessToken,
        twitchRefreshToken,
        twitchTokenExpiresAt,
        googleId,
        googleAccessToken,
        googleTokenExpiresAt,
        kickId,
        kickAccessToken,
        kickRefreshToken,
        kickTokenExpiresAt,
        userId,
    );
}

export function setTwitchId(
    userId: number,
    twitchId: string,
    accessToken: string,
    refreshToken: string,
    expiresAt: number,
) {
    db.query(
        "UPDATE user SET twitch_id = ?, twitch_access_token = ?, twitch_refresh_token = ?, twitch_token_expires_at = ? WHERE id = ?",
    ).run(twitchId, accessToken, refreshToken, expiresAt, userId);
}

export function setGoogleId(userId: number, googleId: string, accessToken: string, expiresAt: number) {
    db.query("UPDATE user SET google_id = ?, google_access_token = ?, google_token_expires_at = ? WHERE id = ?").run(
        googleId,
        accessToken,
        expiresAt,
        userId,
    );
}

export function setKickId(
    userId: number,
    kickId: string,
    accessToken: string,
    refreshToken: string,
    expiresAt: number,
) {
    db.query(
        "UPDATE user SET kick_id = ?, kick_access_token = ?, kick_refresh_token = ?, kick_token_expires_at = ? WHERE id = ?",
    ).run(kickId, accessToken, refreshToken, expiresAt, userId);
}

export function getProfilePicture(userId: number): string | null {
    const row = db.query("SELECT picture FROM user WHERE id = ?").get(userId) as { picture: string } | null;
    return row?.picture ?? null;
}

interface UserRow {
    id: number;
    name: string;
    picture: string;
    googleEmail?: string;
    twitchEmail?: string;
    kickEmail?: string;
    google_access_token?: string | null;
    google_refresh_token?: string | null;
    google_token_expires_at?: number | null;
    twitch_access_token?: string | null;
    twitch_refresh_token?: string | null;
    twitch_token_expires_at?: number | null;
    kick_access_token?: string | null;
    kick_refresh_token?: string | null;
    kick_token_expires_at?: number | null;
}

export interface User {
    id: number;
    name: string;
    picture: string;
    googleEmail?: string;
    twitchEmail?: string;
    kickEmail?: string;
    googleId?: string | null;
    googleAccessToken?: string | null;
    googleRefreshToken?: string | null;
    googleTokenExpiresAt?: number | null;
    twitchId?: string | null;
    twitchAccessToken?: string | null;
    twitchRefreshToken?: string | null;
    twitchTokenExpiresAt?: number | null;
    kickId?: string | null;
    kickAccessToken?: string | null;
    kickRefreshToken?: string | null;
    kickTokenExpiresAt?: number | null;
}
