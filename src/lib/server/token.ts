import { google, twitch, kick } from "./oauth";
import { updateTokens } from "./user";
import type { User } from "./user";

const REFRESH_MARGIN_MS = 60_000;

export async function refreshTokensIfNeeded(user: User): Promise<User> {
    const now = Date.now();
    let updated = { ...user };

    if (
        updated.googleAccessToken &&
        updated.googleRefreshToken &&
        updated.googleTokenExpiresAt &&
        updated.googleTokenExpiresAt < now + REFRESH_MARGIN_MS
    ) {
        try {
            const tokens = await google.refreshAccessToken(updated.googleRefreshToken);
            const accessToken = tokens.accessToken();
            const refreshToken = tokens.refreshToken();
            const expiresAt = tokens.accessTokenExpiresAt().getTime();
            updateTokens(user.id, "google", accessToken, refreshToken, expiresAt);
            updated.googleAccessToken = accessToken;
            updated.googleRefreshToken = refreshToken;
            updated.googleTokenExpiresAt = expiresAt;
        } catch (e) {
            console.error("Failed to refresh Google token:", e);
        }
    }

    if (
        updated.twitchAccessToken &&
        updated.twitchRefreshToken &&
        updated.twitchTokenExpiresAt &&
        updated.twitchTokenExpiresAt < now + REFRESH_MARGIN_MS
    ) {
        try {
            const tokens = await twitch.refreshAccessToken(updated.twitchRefreshToken);
            const accessToken = tokens.accessToken();
            const refreshToken = tokens.refreshToken();
            const expiresAt = tokens.accessTokenExpiresAt().getTime();
            updateTokens(user.id, "twitch", accessToken, refreshToken, expiresAt);
            updated.twitchAccessToken = accessToken;
            updated.twitchRefreshToken = refreshToken;
            updated.twitchTokenExpiresAt = expiresAt;
        } catch (e) {
            console.error("Failed to refresh Twitch token:", e);
        }
    }

    if (
        updated.kickAccessToken &&
        updated.kickRefreshToken &&
        updated.kickTokenExpiresAt &&
        updated.kickTokenExpiresAt < now + REFRESH_MARGIN_MS
    ) {
        try {
            const tokens = await kick.refreshAccessToken(updated.kickRefreshToken);
            const accessToken = tokens.accessToken();
            const refreshToken = tokens.refreshToken();
            const expiresAt = tokens.accessTokenExpiresAt().getTime();
            updateTokens(user.id, "kick", accessToken, refreshToken, expiresAt);
            updated.kickAccessToken = accessToken;
            updated.kickRefreshToken = refreshToken;
            updated.kickTokenExpiresAt = expiresAt;
        } catch (e) {
            console.error("Failed to refresh Kick token:", e);
        }
    }

    return updated;
}
