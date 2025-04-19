// ✅ app/api/contact/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dbConnect from '@/lib/dbConnect';
import Inquiry from '@/models/Inquiry';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();
    await Inquiry.create({
      type: 'CONTACT-US',
      name,
      email,
      phone,
      message
    });

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'epimech.works@gmail.com',
        pass: 'rdbm rhbm ugtt geiz',
      },
    });

    const mailOptions = {
      from: 'notification.sunbooster@gmail.com',
      to: 'info@epimech.com',
      subject: `New Contact Us Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nMessage: ${message}`
    };

    const customerMailOptions = {
      from: 'notification.sunbooster@gmail.com',
      to: email,
      subject: `Thank you for contacting Epimech`,
      text: `Dear ${name},\n\nThank you for reaching out to Epimech. We've received your message and will get back to you shortly.`
    };

    await transporter.sendMail(mailOptions);
    await transporter.sendMail(customerMailOptions);

    return NextResponse.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending contact message:', error);
    return NextResponse.json({ message: 'Failed to send contact message' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const inquiries = await Inquiry.find({ type: 'CONTACT-US' }).sort({ createdAt: -1 });
    return NextResponse.json(inquiries);
  } catch (error) {
    console.error('Error fetching contact inquiries:', error);
    return NextResponse.json({ message: 'Failed to fetch contact inquiries' }, { status: 500 });
  }
}
