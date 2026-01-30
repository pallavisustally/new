
import { NextResponse } from "next/server";
import { updateSubmissionStatus, getSubmission } from "../../../../lib/storage";
import { sendApprovalEmail } from "../../../../lib/email";

export async function POST(request: Request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "Missing submission ID" }, { status: 400 });
        }

        const submission = await getSubmission(id);
        if (!submission) {
            return NextResponse.json({ error: "Submission not found" }, { status: 404 });
        }

        // Update Status
        await updateSubmissionStatus(id, 'APPROVED');

        // Send Email to User
        const userEmail = (submission.data.userEmail as string) || (submission.data.email as string);
        if (userEmail) {
            await sendApprovalEmail(userEmail, submission);
        } else {
            console.warn(`No email found for submission ${id}, skipping approval email.`);
        }

        return NextResponse.json({ success: true, message: "Approved successfully" });
    } catch (error) {
        console.error("Approval error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to approve" },
            { status: 500 }
        );
    }
}
