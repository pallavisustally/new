import type { TestAccount } from 'nodemailer'; // Type only

export interface Scope2Submission {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    submittedAt: string;
    data: Record<string, unknown>; // The form data
}

let testAccountPromise: Promise<TestAccount> | null = null;

function getFromAddress() {
    const address = process.env.SMTP_FROM_ADDRESS || process.env.SMTP_USER || 'no-reply@sustally.com';
    const name = process.env.SMTP_FROM_NAME || 'Sustally Team';
    return `"${name}" <${address}>`;
}

function getDashboardBaseUrl() {
    // Prefer an explicit frontend URL; strip trailing slash
    const raw =
        process.env.DASHBOARD_APP_URL ||
        process.env.FRONTEND_APP_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'http://localhost:3000';
    return raw.replace(/\/$/, '');
}

// Helper to get transporter - either from ENV or auto-generated Ethereal account
async function getTransporter() {
    const nodemailer = (await import('nodemailer')).default;

    if (process.env.SMTP_HOST) {
        const port = parseInt(process.env.SMTP_PORT || '587');
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port,
            secure: port === 465,
            requireTLS: port === 587,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Fallback to Ethereal for Development
    if (!testAccountPromise) {
        testAccountPromise = nodemailer.createTestAccount();
    }

    const testAccount = await testAccountPromise;

    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sustally.com';

export async function sendAdminNotification(submission: Scope2Submission) {
    const transporter = await getTransporter();
    const DASHBOARD_URL = process.env.ADMIN_DASHBOARD_URL || 'https://new-rho-plum.vercel.app';
    const reviewLink = `${DASHBOARD_URL}`;
    const facilityName = (submission.data.facilityName as string) || 'Unknown Facility';

    const mailOptions = {
        from: getFromAddress(),
        to: ADMIN_EMAIL,
        subject: `New Scope 2 Assessment Submission: ${facilityName}`,
        html: `
      <h1>New Submission Received</h1>
      <p>A new Scope 2 assessment has been submitted.</p>
      <ul>
        <li><strong>Facility Name:</strong> ${facilityName}</li>
        <li><strong>Submitted At:</strong> ${new Date(submission.submittedAt).toLocaleString()}</li>
      </ul>
      <p>Please review the submission by clicking the link below:</p>
      <a href="${reviewLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Review Submission</a>
    `,
    };

    try {
        console.log(`[Email] Sending admin notification for submission ${submission.id} to ${ADMIN_EMAIL}`);
        const info = await transporter.sendMail(mailOptions);
        console.log('Admin notification sent:', info.messageId);
        if (!process.env.SMTP_HOST) {
            const nodemailer = (await import('nodemailer')).default;
            console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
        }
        return true;
    } catch (error) {
        console.error('Error sending admin email:', error);
        return false;
    }
}

export async function sendDashboardEmail(
    userEmail: string,
    submission: Scope2Submission,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: { sendEmail: (args: { to: string; subject: string; html: string }) => Promise<unknown> }
) {
    const normalizedEmail = String(userEmail || '').trim().toLowerCase();
    if (!normalizedEmail) {
        console.error('[Email] Cannot send dashboard email: empty recipient');
        return false;
    }

    console.log(`[Email] Preparing dashboard share email for ${normalizedEmail}`);
    const facilityName = (submission.data.facilityName as string) || 'Unknown Facility';
    const baseUrl = getDashboardBaseUrl();
    const dashboardLink = `${baseUrl}/dashboard?email=${encodeURIComponent(normalizedEmail)}`;

    const subject = 'Your Scope 2 Dashboard Is Ready';
    const html = `
      <h1>Your Dashboard Is Ready</h1>
      <p>Your Scope 2 assessment for <strong>${facilityName}</strong> is complete.</p>
      <p>We have shared your emissions dashboard with this email. Use the link below to view and download your report:</p>
      <br />
      <a href="${dashboardLink}" style="padding: 12px 24px; background-color: #3D5F2B; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Dashboard</a>
      <br /><br />
      <p>Best regards,<br/>Sustally Team</p>
    `;

    try {
        if (payload?.sendEmail) {
            console.log(`[Email] Sending dashboard email via Payload to ${normalizedEmail} with link ${dashboardLink}`);
            await payload.sendEmail({ to: normalizedEmail, subject, html });
            console.log('Dashboard email sent via Payload to:', normalizedEmail);
            return true;
        }

        const transporter = await getTransporter();
        const info = await transporter.sendMail({
            from: getFromAddress(),
            to: normalizedEmail,
            subject,
            html,
        });
        console.log('Dashboard email sent to:', normalizedEmail, 'ID:', info.messageId);
        if (!process.env.SMTP_HOST) {
            const nodemailer = (await import('nodemailer')).default;
            console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
        }
        return true;
    } catch (error) {
        console.error('Error sending dashboard email:', error);
        return false;
    }
}

/** @deprecated Prefer sendDashboardEmail — kept for admin status-change hooks */
export async function sendApprovalEmail(userEmail: string, submission: Scope2Submission) {
    return sendDashboardEmail(userEmail, submission);
}

export async function sendRejectionEmail(userEmail: string, submission: Scope2Submission, reason?: string, assessmentLink?: string) {
    console.log(`[Email] Preparing rejection email for ${userEmail}`);
    const transporter = await getTransporter();
    const facilityName = (submission.data.facilityName as string) || 'Unknown Facility';
    const mailOptions = {
        from: '"Sustally Team" <no-reply@sustally.com>',
        to: userEmail,
        subject: 'Action Required: Scope 2 Assessment Update',
        html: `
      <h1>Assessment Update Required</h1>
      <p>Thank you for submitting your Scope 2 assessment for <strong>${facilityName}</strong>.</p>
      <p>After review, we have identified areas that need further clarification or correction.</p>
      ${reason ? `<p><strong>Reason (also attached):</strong> ${reason}</p>` : ''}
      ${assessmentLink ? `
        <p>Please use the link below to retry your assessment with your previous slot details:</p>
        <p><a href="${assessmentLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 10px;">Retry Assessment</a></p>
        <p>Or copy this link: ${assessmentLink}</p>
      ` : '<p>Please log in to your dashboard to retry your assessment.</p>'}
      <br />
      <p>Best regards,<br/>Sustally Team</p>
    `,
        attachments: reason ? [
            {
                filename: 'Feedback.txt',
                content: reason
            }
        ] : []
    };

    try {
        console.log(`[Email] Sending rejection email to ${userEmail}`);
        const info = await transporter.sendMail(mailOptions);
        console.log('Rejection email sent to:', userEmail, 'ID:', info.messageId);
        if (!process.env.SMTP_HOST) {
            const nodemailer = (await import('nodemailer')).default;
            console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error('Error sending rejection email:', error);
    }
}
