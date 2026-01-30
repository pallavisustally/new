
import { NextResponse } from "next/server";
import { updateSubmissionStatus, getSubmission } from "../../../../lib/storage";
import { sendRejectionEmail } from "../../../../lib/email";

export async function POST(request: Request) {
    try {
        const { id, reason } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "Missing submission ID" }, { status: 400 });
        }

        const submission = await getSubmission(id);
        if (!submission) {
            return NextResponse.json({ error: "Submission not found" }, { status: 404 });
        }

        // Update Status
        await updateSubmissionStatus(id, 'REJECTED');

        // Send Email to User
        const userEmail = (submission.data.userEmail as string) || (submission.data.email as string);
        if (userEmail) {
            await sendRejectionEmail(userEmail, submission, reason);
        } else {
            console.warn(`No email found for submission ${id}, skipping rejection email.`);
        }

        return NextResponse.json({ success: true, message: "Rejected successfully" });
    } catch (error) {
        console.error("Rejection error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to reject" },
            { status: 500 }
        );
    }
}
