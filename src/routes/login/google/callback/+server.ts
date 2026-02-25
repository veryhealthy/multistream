import { generateSessionToken, createSession, setSessionTokenCookie } from "$lib/server/session";
import { getGoogleUser, overwriteUserInfo, createUserWithGoogle } from "$lib/server/user";
import { google } from "$lib/server/oauth";
import { decodeIdToken } from "arctic";

import type { RequestEvent } from "@sveltejs/kit";
import type { OAuth2Tokens } from "arctic";

export async function GET(event: RequestEvent): Promise<Response> {
    const code = event.url.searchParams.get("code");
    const state = event.url.searchParams.get("state");
    const storedState = event.cookies.get("google_oauth_state") ?? null;
    const codeVerifier = event.cookies.get("google_code_verifier") ?? null;
    if (code === null || state === null || storedState === null || codeVerifier === null) {
        return new Response(null, {
            status: 400,
        });
    }
    if (state !== storedState) {
        return new Response(null, {
            status: 400,
        });
    }

    let tokens: OAuth2Tokens;
    try {
        tokens = await google.validateAuthorizationCode(code, codeVerifier);
    } catch (e) {
        // Invalid code or client credentials
        return new Response(null, {
            status: 400,
        });
    }

    const claims = decodeIdToken(tokens.idToken()) as { sub: string; name: string; email: string; picture: string };
    const googleUserId = claims.sub;
    const email = claims.email;
    const name = claims.name;
    const picture = claims.picture;

    const accessToken = tokens.accessToken();
    const expiresAt = tokens.accessTokenExpiresAt().getTime();

    const existingUser = getGoogleUser(email);

    if (event.locals.user) {
        // Logged-in user linking their Google account
        overwriteUserInfo({
            userId: event.locals.user.id,
            googleId: googleUserId,
            googleAccessToken: accessToken,
            googleTokenExpiresAt: expiresAt,
        });
        return new Response(null, {
            status: 302,
            headers: { Location: "/" },
        });
    }

    if (existingUser !== null) {
        // Returning user, update their Google tokens
        overwriteUserInfo({
            userId: existingUser.id,
            googleId: googleUserId,
            googleAccessToken: accessToken,
            googleTokenExpiresAt: expiresAt,
        });
        const sessionToken = generateSessionToken();
        const session = createSession(sessionToken, existingUser.id);
        setSessionTokenCookie(event, sessionToken, session.expiresAt);
        return new Response(null, {
            status: 302,
            headers: { Location: "/" },
        });
    }

    // New user
    const user = createUserWithGoogle(googleUserId, email, name, picture, accessToken, expiresAt);
    const sessionToken = generateSessionToken();
    const session = createSession(sessionToken, user.id);
    setSessionTokenCookie(event, sessionToken, session.expiresAt);
    return new Response(null, {
        status: 302,
        headers: { Location: "/" },
    });
}
