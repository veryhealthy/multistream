import { error } from "@sveltejs/kit";
import { GOOGLE_CLIENT_ID } from "$env/static/private";
import { YT_CATEGORIES } from "$lib/constants/youtube";

export async function getYoutubeData(access_token: string | null | undefined) {
    if (!access_token) {
        error(401, { message: "No access token found" });
    }

    let youtubeInfo = { isActive: false, title: "", description: "", category: "" };

    const response = await fetch(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts?mine=true&part=snippet,status,statistics`,
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
                "Client-ID": GOOGLE_CLIENT_ID,
            },
        },
    );
    const data = await response.json();

    if (data.error) {
        error(401, { message: data.error.message });
    }

    const activeBroadcast = data.items.find((b: any) => b.status.lifeCycleStatus === "live");
    if (activeBroadcast) {
        const videoResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${activeBroadcast.id}`,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            },
        );

        const videoData = await videoResponse.json();
        const categoryId = videoData?.items[0]?.snippet?.categoryId;

        youtubeInfo = {
            isActive: true,
            title: activeBroadcast.snippet.title,
            description: activeBroadcast.snippet.description,
            category: YT_CATEGORIES[String(categoryId)],
        };
    }

    return youtubeInfo;
}
