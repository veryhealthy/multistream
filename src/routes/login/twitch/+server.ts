import { generateState } from "arctic";
import { twitch } from "$lib/server/oauth";

import type { RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent): Promise<Response> {
    const state = generateState();

    // "channel:bot" "user:edit"

    const url = twitch.createAuthorizationURL(state, ["openid", "channel:manage:broadcast", "user:read:email"]);

    event.cookies.set("twitch_oauth_state", state, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 10, // 10 minutes
        sameSite: "lax",
    });

    return new Response(null, {
        status: 302,
        headers: {
            Location: url.toString(),
        },
    });
}
