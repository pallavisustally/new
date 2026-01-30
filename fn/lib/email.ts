import nodemailer from 'nodemailer';
import { Scope2Submission } from './storage';
import { jsPDF } from "jspdf";


let testAccountPromise: Promise<nodemailer.TestAccount> | null = null;

// Helper to get transporter - either from ENV or auto-generated Ethereal account
async function getTransporter() {
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Fallback to Ethereal for Development
    // Use a cached test account if possible to avoid creating new ones overly frequently, 
    // but for now, creating one per server instance start is okay.
    // Ideally we would cache this promise.
    if (!testAccountPromise) {
        testAccountPromise = nodemailer.createTestAccount();
    }

    const testAccount = await testAccountPromise;

    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sustally.com';

export async function sendAdminNotification(submission: Scope2Submission) {
    const transporter = await getTransporter();
    const reviewLink = `${APP_URL}/admin/review/${submission.id}`;

    const facilityName = (submission.data.facilityName as string) || 'Unknown Facility';

    const mailOptions = {
        from: '"Sustally System" <no-reply@sustally.com>',
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
        const info = await transporter.sendMail(mailOptions);
        console.log('Admin notification sent:', info.messageId);
        if (!process.env.SMTP_HOST) {
            console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error('Error sending admin email:', error);
        // Don't swallow the error completely so the API can report it if needed, 
        // though for async notifications we often just log it. 
        // Given the user issue, let's log it clearly.
    }
}

export async function sendApprovalEmail(userEmail: string, submission: Scope2Submission) {
    const transporter = await getTransporter();
    const facilityName = (submission.data.facilityName as string) || 'Unknown Facility';

    // Generate PDF Certificate
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    // Valid A4 Landscape width is 297mm, height is 210mm. Center is around 148.5mm.

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.setTextColor(41, 128, 185); // Blue color
    doc.text("Certificate of Compliance", 148.5, 60, { align: "center" });

    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0); // Black
    doc.text("This certifies that", 148.5, 85, { align: "center" });

    // Facility Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.text(facilityName, 148.5, 105, { align: "center" });

    // Description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("Has successfully completed the Scope 2 Assessment", 148.5, 125, { align: "center" });

    // Date
    const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.text(`Approved on: ${dateStr}`, 148.5, 145, { align: "center" });

    // Footer
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100); // Gray
    doc.text("Verified by Sustally Application System", 148.5, 180, { align: "center" });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    const mailOptions = {
        from: '"Sustally Team" <no-reply@sustally.com>',
        to: userEmail,
        subject: 'Scope 2 Assessment Approved - Certificate Enclosed',
        html: `
      <h1>Congratulations!</h1>
      <p>Your Scope 2 assessment for <strong>${facilityName}</strong> has been approved.</p>
      <p>Please find attached your compliance certificate.</p>
      <br />
      <p>Best regards,<br/>Sustally Team</p>
    `,
        attachments: [
            {
                filename: 'Certificate.pdf',
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Approval email sent to:', userEmail);
        if (!process.env.SMTP_HOST) {
            console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error('Error sending approval email:', error);
    }
}

export async function sendRejectionEmail(userEmail: string, submission: Scope2Submission, reason?: string) {
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
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>Please log in to your dashboard to retry your assessment.</p>
      <br />
      <p>Best regards,<br/>Sustally Team</p>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Rejection email sent to:', userEmail);
        if (!process.env.SMTP_HOST) {
            console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error('Error sending rejection email:', error);
    }
}
