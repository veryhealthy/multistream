import { error } from "@sveltejs/kit";
import { TWITCH_CLIENT_ID } from "$env/static/private";

export async function getTwitchData(access_token: string | null | undefined, twitchId: string | null | undefined) {
    if (!access_token) {
        error(401, { message: "No access token found" });
    }

    const response = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${twitchId}`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
            "Client-ID": TWITCH_CLIENT_ID,
        },
    });
    const twitchData = await response.json();

    const userResponse = await fetch(`https://api.twitch.tv/helix/users?id=${twitchId}`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
            "Client-ID": TWITCH_CLIENT_ID,
        },
    });

    const userData = await userResponse.json();

    return {
        title: twitchData.data[0].title,
        description: userData.data[0].description,
        category: twitchData.data[0].game_name,
        tags: twitchData.data[0].tags,
    };
}
