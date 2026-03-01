// https://api.kick.com/public/v1/events/subscriptions

import { fail, redirect } from "@sveltejs/kit";
import { invalidateSession, deleteSessionTokenCookie } from "$lib/server/session";
import { KICK_CLIENT_ID, TWITCH_CLIENT_ID, GOOGLE_CLIENT_ID } from "$env/static/private";

import type { Actions, PageServerLoad } from "./$types";
import { getMessages } from "$lib/server/message";

export const load: PageServerLoad = async ({ cookies, locals }) => {
    if (!locals.user) {
        return null;
    }

    // const test = await fetch("https://api.kick.com/public/v1/events/subscriptions", {
    //     method: "GET",
    //     headers: {
    //         Authorization: `Bearer ${locals.user.kickAccessToken}`,
    //         "Content-Type": "application/json",
    //     },
    // });

    // const foo = await test.json();
    // console.log(foo);

    // console.log("sending subscription");
    // const answer = await fetch("https://api.kick.com/public/v1/events/subscriptions", {
    //     method: "POST",
    //     headers: {
    //         Authorization: `Bearer ${locals.user.kickAccessToken}`,
    //         "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //         broadcaster_user_id: locals.user.kickId, // the channel/user id
    //         events: [
    //             {
    //                 name: "chat.message.sent",
    //                 version: 1,
    //             },
    //         ],
    //         method: "webhook",
    //         webhook_url: "https://bicephalous-proadmission-lakendra.ngrok-free.dev/login/kick/webhook",
    //     }),
    // });

    // const kick = await answer.json();
    // console.log(kick);

    return {
        name: locals.user.name,
        messages: getMessages(locals.user.kickId),
        twitchConnected: !!locals.user.twitchAccessToken,
        kickConnected: !!locals.user.kickAccessToken,
        googleConnected: !!locals.user.googleAccessToken,
    };
};
