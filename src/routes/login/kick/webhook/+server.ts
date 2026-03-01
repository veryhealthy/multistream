import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { checkIfKickHasMainAccount } from "$lib/server/user";

export async function POST({ request, locals }) {
    const data = await request.json();
    const header = request.headers.get("Kick-Event-Type");

    if (header === "chat.message.sent") {
        const { id } = db
            .query(
                `
                SELECT id
                FROM user
                WHERE kick_id = ?
                `,
            )
            .get(String(data.broadcaster.user_id)) as { id: number };

        const row = db
            .query(
                `INSERT INTO message (
                user_id,
                sender_id,
                platform_message_id,
                username,
                profile_picture,
                content,
                created_at,
                source
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
            )
            .get(
                id,
                data.sender.user_id,
                data.message_id,
                data.sender.username,
                data.sender.profile_picture,
                data.content,
                data.created_at,
                "KICK",
            ) as { id: number } | null;

        console.log(row);
    }

    return json({
        success: true,
    });
}

export function GET() {
    return json("prout");
}
