import { db } from "./db";
import { encodeBase32, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

import type { User } from "./user";
import type { RequestEvent } from "@sveltejs/kit";

export function validateSessionToken(token: string): SessionValidationResult {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const row = db
        .query(
            `
            SELECT session.id AS session_id,
            session.user_id,
            session.expires_at,
            user.id AS user_id,
            user.google_email,
            user.twitch_email,
            user.kick_email,
            user.name,
            user.picture,
            user.google_id,
            user.google_access_token,
            user.google_refresh_token,
            user.google_token_expires_at,
            user.twitch_id,
            user.twitch_access_token,
            user.twitch_refresh_token,
            user.twitch_token_expires_at,
            user.kick_id,
            user.kick_access_token,
            user.kick_refresh_token,
            user.kick_token_expires_at
            FROM session
            INNER JOIN user ON session.user_id = user.id
            WHERE session.id = ?`,
        )
        .get(sessionId) as SessionUserRow | null;

    if (row === null) {
        return { session: null, user: null };
    }
    const session: Session = {
        id: row.session_id,
        userId: row.user_id,
        expiresAt: new Date(row.expires_at * 1000),
    };
    const user: User = {
        id: row.user_id,
        googleEmail: row.google_email,
        twitchEmail: row.twitch_email,
        kickEmail: row.kick_email,
        name: row.name,
        picture: row.picture,
        googleId: row.google_id,
        googleAccessToken: row.google_access_token,
        googleRefreshToken: row.google_refresh_token,
        googleTokenExpiresAt: row.google_token_expires_at,
        twitchId: row.twitch_id,
        twitchAccessToken: row.twitch_access_token,
        twitchRefreshToken: row.twitch_refresh_token,
        twitchTokenExpiresAt: row.twitch_token_expires_at,
        kickId: row.kick_id,
        kickAccessToken: row.kick_access_token,
        kickRefreshToken: row.kick_refresh_token,
        kickTokenExpiresAt: row.kick_token_expires_at,
    };

    if (Date.now() >= session.expiresAt.getTime()) {
        db.query("DELETE FROM session WHERE id = ?").run(session.id);
        return { session: null, user: null };
    }
    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
        session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        db.query("UPDATE session SET expires_at = ? WHERE id = ?").run(
            Math.floor(session.expiresAt.getTime() / 1000),
            session.id,
        );
    }
    return { session, user };
}

export function invalidateSession(sessionId: string): void {
    db.query("DELETE FROM session WHERE id = ?").run(sessionId);
}

export function invalidateUserSessions(userId: number): void {
    db.query("DELETE FROM session WHERE user_id = ?").run(userId);
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
    event.cookies.set("session", token, {
        httpOnly: true,
        path: "/",
        secure: import.meta.env.PROD,
        sameSite: "lax",
        expires: expiresAt,
    });
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
    event.cookies.set("session", "", {
        httpOnly: true,
        path: "/",
        secure: import.meta.env.PROD,
        sameSite: "lax",
        maxAge: 0,
    });
}

export function generateSessionToken(): string {
    const tokenBytes = new Uint8Array(20);
    crypto.getRandomValues(tokenBytes);
    const token = encodeBase32(tokenBytes).toLowerCase();
    return token;
}

export function createSession(token: string, userId: number): Session {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const session: Session = {
        id: sessionId,
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };
    db.query("INSERT INTO session (id, user_id, expires_at) VALUES (?, ?, ?)").run(
        session.id,
        session.userId,
        Math.floor(session.expiresAt.getTime() / 1000),
    );
    return session;
}

interface SessionUserRow {
    session_id: string;
    user_id: number;
    expires_at: number;
    google_email: string;
    twitch_email: string;
    kick_email: string;
    name: string;
    picture: string;
    google_id?: string | null;
    google_access_token?: string | null;
    google_refresh_token?: string | null;
    google_token_expires_at?: number | null;
    twitch_id?: string | null;
    twitch_access_token?: string | null;
    twitch_refresh_token?: string | null;
    twitch_token_expires_at?: number | null;
    kick_id?: string | null;
    kick_access_token?: string | null;
    kick_refresh_token?: string | null;
    kick_token_expires_at?: number | null;
}

export interface Session {
    id: string;
    expiresAt: Date;
    userId: number;
}

type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };
