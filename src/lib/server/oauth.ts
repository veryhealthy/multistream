import { Google, Twitch, Kick } from "arctic";
import {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET,
    KICK_CLIENT_ID,
    KICK_CLIENT_SECRET,
} from "$env/static/private";

export const google = new Google(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, "http://localhost:5173/login/google/callback");
export const twitch = new Twitch(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, "http://localhost:5173/login/twitch/callback");
export const kick = new Kick(KICK_CLIENT_ID, KICK_CLIENT_SECRET, "http://localhost:5173/login/kick/callback");
