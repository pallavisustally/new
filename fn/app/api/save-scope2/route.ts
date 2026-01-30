
import { NextResponse } from "next/server";
import { saveSubmission, Scope2Submission } from "../../../lib/storage";
import { sendAdminNotification } from "../../../lib/email";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const id = crypto.randomUUID();

        const submission: Scope2Submission = {
            id,
            status: 'PENDING',
            submittedAt: new Date().toISOString(),
            data
        };

        await saveSubmission(submission);

        // Notify Admin
        // We do not await this to return fast to user, OR we await?
        // Better to await to ensure email is sent or handle error, 
        // but for now let's await it to catch errors in dev.
        await sendAdminNotification(submission);

        return NextResponse.json({ success: true, message: "Data saved successfully" });
    } catch (error) {
        console.error("Error processing Scope 2 data:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process data" },
            { status: 500 }
        );
    }
}
