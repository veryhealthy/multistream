import { generateSessionToken, createSession, setSessionTokenCookie } from "$lib/server/session";
import { checkIfTwitchHasMainAccount, overwriteUserInfo, createUserWithTwitch } from "$lib/server/user";
import { twitch } from "$lib/server/oauth";
import { decodeIdToken } from "arctic";
import { TWITCH_CLIENT_ID } from "$env/static/private";

import type { RequestEvent } from "@sveltejs/kit";
import type { OAuth2Tokens } from "arctic";

export async function GET(event: RequestEvent): Promise<Response> {
    const code = event.url.searchParams.get("code");
    const state = event.url.searchParams.get("state");
    const storedState = event.cookies.get("twitch_oauth_state") ?? null;
    if (code === null || state === null || storedState === null) {
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
        tokens = await twitch.validateAuthorizationCode(code);
    } catch (e) {
        // Invalid code or client credentials
        return new Response(null, {
            status: 400,
        });
    }
    const claims = decodeIdToken(tokens.idToken()) as {
        sub: string;
        preferred_username: string;
    };
    const twitchUserId = claims.sub;
    const name = claims.preferred_username;

    const accessToken = tokens.accessToken();
    const refreshToken = tokens.refreshToken();
    const expiresAt = tokens.accessTokenExpiresAt().getTime();

    const userInfo = await fetch("https://api.twitch.tv/helix/users", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": TWITCH_CLIENT_ID,
        },
    });

    const data = await userInfo.json();
    const email = data.data[0].email;
    const pictureUrl = data.data[0].profile_image_url;

    if (event.locals.user) {
        // Logged-in user linking their Twitch account
        overwriteUserInfo({
            userId: event.locals.user.id,
            twitchId: twitchUserId,
            twitchAccessToken: accessToken,
            twitchRefreshToken: refreshToken,
            twitchTokenExpiresAt: expiresAt,
        });
        return new Response(null, {
            status: 302,
            headers: { Location: "/" },
        });
    }

    const foundUser = checkIfTwitchHasMainAccount(twitchUserId);

    if (foundUser !== null) {
        // overwrite in case kick infos changed and to get fresh token ?
        overwriteUserInfo({
            userId: foundUser.id,
            twitchAccessToken: accessToken,
            twitchRefreshToken: refreshToken,
            twitchTokenExpiresAt: expiresAt,
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
    const user = createUserWithTwitch(twitchUserId, email, name, pictureUrl, accessToken, refreshToken, expiresAt);
    const sessionToken = generateSessionToken();
    const session = createSession(sessionToken, user.id);
    setSessionTokenCookie(event, sessionToken, session.expiresAt);
    return new Response(null, {
        status: 302,
        headers: { Location: "/" },
    });
}
