import { generateSessionToken, createSession, setSessionTokenCookie } from "$lib/server/session";
import { checkIfKickHasMainAccount, overwriteUserInfo, createUserWithKick } from "$lib/server/user";
import { kick } from "$lib/server/oauth";

import type { RequestEvent } from "@sveltejs/kit";
import type { OAuth2Tokens } from "arctic";

export async function GET(event: RequestEvent): Promise<Response> {
    const code = event.url.searchParams.get("code");
    const state = event.url.searchParams.get("state");
    const storedState = event.cookies.get("kick_oauth_state") ?? null;
    const codeVerifier = event.cookies.get("kick_code_verifier") ?? null;
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
        tokens = await kick.validateAuthorizationCode(code, codeVerifier);
    } catch (e) {
        // Invalid code or client credentials
        return new Response(null, {
            status: 400,
        });
    }

    const accessToken = tokens.accessToken();
    const refreshToken = tokens.refreshToken();
    const expiresAt = tokens.accessTokenExpiresAt().getTime();

    const response = await fetch("https://api.kick.com/public/v1/users", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const userData = await response.json();

    const kickUserId = userData.data[0].user_id;
    const email = userData.data[0].email;
    const name = userData.data[0].name;
    const pictureUrl = userData.data[0].profile_picture;

    if (event.locals.user) {
        // Logged-in user linking their Kick account
        overwriteUserInfo({
            userId: event.locals.user.id,
            kickId: kickUserId,
            kickAccessToken: accessToken,
            kickRefreshToken: refreshToken,
            kickTokenExpiresAt: expiresAt,
        });
        return new Response(null, {
            status: 302,
            headers: { Location: "/" },
        });
    }

    const foundUser = checkIfKickHasMainAccount(kickUserId);

    if (foundUser !== null) {
        // overwrite in case kick infos changed and to get fresh token ?
        overwriteUserInfo({
            userId: foundUser.id,
            kickAccessToken: accessToken,
            kickRefreshToken: refreshToken,
            kickTokenExpiresAt: expiresAt,
        });
        const sessionToken = generateSessionToken();
        const session = createSession(sessionToken, foundUser.id);
        setSessionTokenCookie(event, sessionToken, session.expiresAt);
        return new Response(null, {
            status: 302,
            headers: { Location: "/" },
        });
    }

    // New user
    const user = createUserWithKick(kickUserId, email, name, pictureUrl, accessToken, refreshToken, expiresAt);
    const sessionToken = generateSessionToken();
    const session = createSession(sessionToken, user.id);
    setSessionTokenCookie(event, sessionToken, session.expiresAt);
    return new Response(null, {
        status: 302,
        headers: { Location: "/" },
    });
}
