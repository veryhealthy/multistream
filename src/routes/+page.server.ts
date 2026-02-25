import { fail, redirect } from "@sveltejs/kit";
import { invalidateSession, deleteSessionTokenCookie } from "$lib/server/session";
import { KICK_CLIENT_ID, TWITCH_CLIENT_ID, GOOGLE_CLIENT_ID } from "$env/static/private";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, locals }) => {
    if (!locals.user) {
        return null;
    }

    let kickInfo = { data: [{ stream_title: undefined }] };
    let twitchInfo = { data: [{ title: undefined }] };
    let youtubeInfo = { title: "" };

    if (locals.user.kickId) {
        const kickResponse = await fetch(`https://api.kick.com/public/v1/channels`, {
            headers: {
                Authorization: `Bearer ${locals.user.kickAccessToken}`,
                "Client-ID": KICK_CLIENT_ID,
            },
        });

        kickInfo = await kickResponse.json();
    }

    if (locals.user.twitchId) {
        const response = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${locals.user.twitchId}`, {
            headers: {
                Authorization: `Bearer ${locals.user.twitchAccessToken}`,
                "Client-ID": TWITCH_CLIENT_ID,
            },
        });
        twitchInfo = await response.json();
    }

    if (locals.user.googleId) {
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
        const activeBroadcast = data.items.find((b) => b.status.lifeCycleStatus === "live");
        youtubeInfo.title = activeBroadcast.snippet.title;
    }

    return {
        name: locals.user.name,
        twitchStreamTitle: twitchInfo.data[0].title,
        kickStreamTitle: kickInfo.data[0].stream_title,
        youtubeStreamTitle: youtubeInfo.title,
        picture: locals.user.picture,
        twitchConnected: !!locals.user.twitchAccessToken,
        kickConnected: !!locals.user.kickAccessToken,
        googleConnected: !!locals.user.googleAccessToken,
    };
};

export const actions: Actions = {
    setName: async ({ locals, request }) => {
        const data = await request.formData();
        const name = data.get("stream-name");

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
            await fetch("https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${locals.user.googleAccessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: broadcastId,
                    snippet: {
                        title: name,
                        description: "Not yet implemented, subscribe please",
                    },
                    status: {
                        privacyStatus: "public",
                    },
                }),
            });
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
                    title: name,
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
                    stream_title: name,
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
