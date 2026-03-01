import { Google, Twitch, Kick } from "arctic";
import {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET,
    KICK_CLIENT_ID,
    KICK_CLIENT_SECRET,
} from "$env/static/private";

const CALLBACK_URL = {
    GOOGLE:
        process.env.NODE_ENV === "development"
            ? "http://localhost:5173/login/google/callback"
            : "https://stream.xptdr.lol/login/google/callback",
    TWITCH:
        process.env.NODE_ENV === "development"
            ? "http://localhost:5173/login/twitch/callback"
            : "https://stream.xptdr.lol/login/twitch/callback",
    KICK:
        process.env.NODE_ENV === "development"
            ? "http://localhost:5173/login/kick/callback"
            : "https://stream.xptdr.lol/login/kick/callback",
};

export const google = new Google(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, CALLBACK_URL.GOOGLE);
export const twitch = new Twitch(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, CALLBACK_URL.TWITCH);
export const kick = new Kick(KICK_CLIENT_ID, KICK_CLIENT_SECRET, CALLBACK_URL.KICK);
