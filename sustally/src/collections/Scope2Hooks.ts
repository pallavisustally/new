import type { CollectionAfterChangeHook } from "payload";
import { sendApprovalEmail, sendRejectionEmail, Scope2Submission } from "../lib/email";

export const afterChangeHook: CollectionAfterChangeHook = async ({ doc, previousDoc, operation }) => {
    if (operation === "update") {
        const submission: Scope2Submission = {
            id: doc.id,
            status: doc.status,
            submittedAt: doc.createdAt,
            data: doc,
        };

        const userEmail = doc.email || doc.userEmail;

        if (doc.status === "APPROVED" && previousDoc.status !== "APPROVED") {
            console.log(`[Scope2] Approving submission ${doc.id}. Email: ${userEmail}`);
            if (userEmail) {
                await sendApprovalEmail(userEmail, submission);
            } else {
                console.error(`[Scope2] Cannot send approval email. No email found for submission ${doc.id}`);
            }
        }

        if (doc.status === "REJECTED" && previousDoc.status !== "REJECTED") {
            const reason = doc.rejectionReason;
            console.log(`[Scope2] Rejecting submission ${doc.id}. Email: ${userEmail}, Reason: ${reason}`);
            if (userEmail) {
                await sendRejectionEmail(userEmail, submission, reason);
            } else {
                console.error(`[Scope2] Cannot send rejection email. No email found for submission ${doc.id}`);
            }
        }
    }
    return doc;
};
