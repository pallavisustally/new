
import { getSubmission } from "../../../../lib/storage";
import ReviewClient from "./ReviewClient";

// Force dynamic behavior so it doesn't cache the result forever
export const dynamic = 'force-dynamic';

export default async function AdminReviewPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    if (!params?.id) {
        return <div className="p-8 text-center text-red-500">Invalid Submission ID</div>;
    }

    const submission = await getSubmission(params.id);

    if (!submission) {
        return (
            <div className="flex h-screen items-center justify-center flex-col bg-gray-50">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Submission Not Found</h1>
                <p className="text-gray-500">The requested assessment ID does not exist.</p>
            </div>
        );
    }

    return <ReviewClient submission={submission} />;
}
