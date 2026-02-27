import { fail, redirect } from "@sveltejs/kit";
import { invalidateSession, deleteSessionTokenCookie } from "$lib/server/session";
import { KICK_CLIENT_ID, TWITCH_CLIENT_ID, GOOGLE_CLIENT_ID } from "$env/static/private";

import type { Actions, PageServerLoad } from "./$types";
import { getYoutubeData } from "$lib/server/youtube";
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
    setStreamInfo: async ({ locals, request }) => {
        const data = await request.formData();
        const name = data.get("stream-name");
        const description = data.get("stream-description");
        const kickName = data.get("kick-name");
        const twitchName = data.get("twitch-name");

        if (locals.user?.googleId) {
            let broadcastId;
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/liveBroadcasts?mine=true&part=snippet,status,statistics`,
                {
                    headers: {
                        Authorization: `Bearer ${locals.user.googleAccessToken}`,
                        "Client-ID": GOOGLE_CLIENT_ID,
                    },
                },
            );
            const data = await response.json();
            const activeBroadcast = data.items.find((b: any) => b.status.lifeCycleStatus === "live");
            broadcastId = activeBroadcast.id;

            // Update the title before you stream
            const updateRes = await fetch("https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${locals.user.googleAccessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: broadcastId,
                    snippet: {
                        ...activeBroadcast.snippet,
                        title: name || activeBroadcast.snippet.title,
                        description: description || activeBroadcast.snippet.description,
                    },
                    status: {
                        privacyStatus: "public",
                    },
                }),
            });
            const up = await updateRes.json();
        }

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
