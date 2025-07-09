// File Path: src/app/api/send-email/route.js

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  // --- Security Check: Ensure environment variables are loaded ---
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error("❌ FATAL: Missing Gmail credentials in .env file. Email function cannot work.");
    return NextResponse.json({ message: "Server email configuration is incomplete." }, { status: 500 });
  }

  try {
    // --- Get Data from Frontend ---
    const { items, form } = await request.json();

    // --- Create the Email Transporter ---
    // This is the object that knows how to connect to Gmail and send mail.
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,         // Your full Gmail address from .env
        pass: process.env.GMAIL_APP_PASSWORD, // The 16-character App Password from .env
      },
    });

    // --- Define the Email Content ---
    // This is what the email will look like.
    const mailOptions = {
      from: `"Skyward Parts RFQ" <${process.env.GMAIL_USER}>`, // Shows "Skyward Parts RFQ" as the sender name
      to: 'admin@skywardparts.com',                           // The email address where you receive the quote requests
      subject: `New RFQ from ${form.companyName}`,             // Subject line of the email
      html: `
        <h1>New Request for Quote</h1>
        <p><strong>Company:</strong> ${form.companyName || 'N/A'}</p>
        <p><strong>Name:</strong> ${form.firstName || ''} ${form.lastName || ''}</p>
        <p><strong>Email:</strong> ${form.email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${form.phoneNumber || 'N/A'}</p>
        <p><strong>Lead Time:</strong> ${form.leadTime || 'N/A'}</p>
        <hr>
        <h2>Requested Items:</h2>
        <ul>
          ${items.map((item) => `<li>${item.quantity} x ${item.part_number}</li>`).join('')}
        </ul>
      `,
    };

    // --- Send the Email ---
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully via Nodemailer/Gmail!");

    // --- Return a Success Response to the Frontend ---
    return NextResponse.json({ message: 'Email sent successfully!' }, { status: 200 });

  } catch (error) {
    console.error("❌ Nodemailer Error:", error);
    // --- Return an Error Response to the Frontend ---
    return NextResponse.json({ message: 'Failed to send email.' }, { status: 500 });
  }
}