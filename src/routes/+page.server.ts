import { fail, redirect } from "@sveltejs/kit";
import { invalidateSession, deleteSessionTokenCookie } from "$lib/server/session";
import { KICK_CLIENT_ID, TWITCH_CLIENT_ID, GOOGLE_CLIENT_ID } from "$env/static/private";

import type { Actions, PageServerLoad } from "./$types";
import { getBroadcasts, getYoutubeData, setYoutubeStreamInfo } from "$lib/server/youtube";
import { getTwitchData } from "$lib/server/twitch";
import { getKickData } from "$lib/server/kick";

export const load: PageServerLoad = async ({ cookies, locals }) => {
    if (!locals.user) {
        return null;
    }

    return {
        name: locals.user.name,
        twitch: getTwitchData(locals.user.twitchAccessToken, locals.user.twitchId),
        youtube: getYoutubeData(locals.user.googleAccessToken),
        kick: getKickData(locals.user.kickAccessToken),
        picture: locals.user.picture,
        twitchConnected: !!locals.user.twitchAccessToken,
        kickConnected: !!locals.user.kickAccessToken,
        googleConnected: !!locals.user.googleAccessToken,
    };
};

export const actions: Actions = {
    getBroadcasts: async ({ locals }) => {
        const b = await getBroadcasts(locals.user?.googleAccessToken);
        return b;
    },
    setStreamInfo: async ({ locals, request }) => {
        const data = await request.formData();
        const name = data.get("stream-name");
        const description = data.get("stream-description");
        const kickName = data.get("kick-name");
        const twitchName = data.get("twitch-name");

        await setYoutubeStreamInfo(name, description, locals?.user?.googleAccessToken);

        if (locals.user?.twitchId) {
            const response = await fetch("https://api.twitch.tv/helix/users", {
                headers: {
                    Authorization: `Bearer ${locals.user.twitchAccessToken}`,
                    "Client-ID": TWITCH_CLIENT_ID,
                },
            });

            const data = await response.json();
            const broadcasterId = data.data[0].id;

            await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${broadcasterId}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${locals.user.twitchAccessToken}`,
                    "Client-ID": TWITCH_CLIENT_ID,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: name || twitchName,
                }),
            });
        }

        if (locals.user?.kickId) {
            await fetch("https://api.kick.com/public/v1/channels", {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${locals.user.kickAccessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    stream_title: name || kickName,
                }),
            });
        }

        return { success: true };
    },
    logout: async (event) => {
        if (event.locals.session === null) {
            return fail(401);
        }
        invalidateSession(event.locals.session.id);
        deleteSessionTokenCookie(event);
        return redirect(302, "/");
    },
};
