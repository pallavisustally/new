import fs from 'fs/promises';
import path from 'path';

export interface Scope2Submission {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    submittedAt: string;
    data: Record<string, unknown>; // The form data
}

const STORAGE_FILE = path.join(process.cwd(), 'scope2_submissions.json');

// Helper to ensure file exists
async function ensureStorage() {
    try {
        await fs.access(STORAGE_FILE);
    } catch {
        await fs.writeFile(STORAGE_FILE, JSON.stringify([]));
    }
}

export async function saveSubmission(submission: Scope2Submission) {
    await ensureStorage();
    const fileContent = await fs.readFile(STORAGE_FILE, 'utf-8');
    const submissions: Scope2Submission[] = JSON.parse(fileContent);
    submissions.push(submission);
    await fs.writeFile(STORAGE_FILE, JSON.stringify(submissions, null, 2));
}

export async function getSubmission(id: string): Promise<Scope2Submission | null> {
    await ensureStorage();
    const fileContent = await fs.readFile(STORAGE_FILE, 'utf-8');
    const submissions: Scope2Submission[] = JSON.parse(fileContent);
    return submissions.find((s) => s.id === id) || null;
}

export async function updateSubmissionStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    await ensureStorage();
    const fileContent = await fs.readFile(STORAGE_FILE, 'utf-8');
    const submissions: Scope2Submission[] = JSON.parse(fileContent);
    const index = submissions.findIndex((s) => s.id === id);

    if (index !== -1) {
        submissions[index].status = status;
        await fs.writeFile(STORAGE_FILE, JSON.stringify(submissions, null, 2));
        return submissions[index];
    }
    return null;
}
