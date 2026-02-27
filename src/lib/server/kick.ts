import { error } from "@sveltejs/kit";
import { KICK_CLIENT_ID } from "$env/static/private";

export async function getKickData(access_token: string | null | undefined) {
    if (!access_token) {
        error(401, { message: "No access token found" });
    }

    const kickResponse = await fetch(`https://api.kick.com/public/v1/channels`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
            "Client-ID": KICK_CLIENT_ID,
        },
    });

    const kickData = await kickResponse.json();

    return {
        title: kickData.data[0].stream_title,
        description: kickData.data[0].channel_description,
        category: kickData.data[0].category.name,
    };
}
