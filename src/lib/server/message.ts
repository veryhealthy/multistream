import { error } from "@sveltejs/kit";
import { db } from "./db";

export function getMessages(kickId: string | null | undefined) {
    if (!kickId) {
        error(403, { message: "No kick id bro" });
    }

    const row = db
        .query(
            `
                SELECT
                    user.id AS userId,
                    message.id AS messageId,
                    message.sender_id AS senderId,
                    message.username,
                    message.profile_picture,
                    message.content,
                    message.created_at,
                    message.source
                FROM message
                INNER JOIN user
                WHERE kick_id = ?
            `,
        )
        .all(kickId) as messageRow[] | null;

    if (row === null) {
        throw new Error("No messages found");
    }

    return row;
}

interface messageRow {
    id: number;
    user_id: number;
    platform_message_id: string;
    username: string;
    profile_picture: string;
    content: string;
    created_at: string;
    source: string;
}
