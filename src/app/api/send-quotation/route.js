// app/api/send-quotation/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dbConnect from '@/lib/dbConnect';
import Inquiry from '@/models/Inquiry';


export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { name, email, country, quantity, comment, productName, partNumber } = body;
    
    // Validate required fields
    if (!name || !email || !country || !quantity) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();
    await Inquiry.create({
      type: 'PRODUCT',
      name,
      email,
      country,
      quantity,
      comment,
      product_name: productName,
      part_number: partNumber
    });

    // Configure the SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Company Logo URL - replace with your actual logo URL
    // const companyLogo = 'https://yourcompany.com/logo.png';
    
    // Format the email content for company notification
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: process.env.QUOTATION_RECIPIENT_EMAIL,
      subject: `New Quotation Request: ${productName} (${partNumber})`,
      text: `
        New Quotation Request
        
        Product: ${productName}
        Part Number: ${partNumber}
        
        Customer Details:
        Name: ${name}
        Email: ${email}
        Country: ${country}
        Quantity: ${quantity}
        
        Comment:
        ${comment || 'No additional comments provided.'}
      `,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Quotation Request</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
              color: white;
              padding: 20px 30px;
              text-align: center;
            }
            .logo {
              max-height: 60px;
              margin-bottom: 15px;
            }
            .content {
              padding: 20px 30px;
            }
            h2 {
              color: #1e3c72;
              margin-top: 0;
              border-bottom: 2px solid #f0f0f0;
              padding-bottom: 10px;
              font-size: 24px;
            }
            h3 {
              color: #2a5298;
              font-size: 18px;
              margin-top: 25px;
              margin-bottom: 10px;
            }
            .section {
              background-color: #f5f7fa;
              border-radius: 6px;
              padding: 15px;
              margin: 15px 0;
              border-left: 4px solid #1e3c72;
            }
            p {
              margin: 8px 0;
            }
            .footer {
              text-align: center;
              padding: 15px 30px;
              background-color: #f0f0f0;
              font-size: 14px;
              color: #666;
            }
            .label {
              color: #666;
              font-weight: 600;
              display: inline-block;
              width: 100px;
              margin-right: 10px;
            }
            .value {
              color: #333;
              font-weight: 400;
            }
            .highlight {
              background-color: #fff4e5;
              padding: 2px 4px;
              border-radius: 4px;
              font-weight: 600;
            }
            @media (max-width: 600px) {
              .content {
                padding: 15px;
              }
              .header {
                padding: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin:0; color:white;">NEW QUOTATION REQUEST</h2>
            </div>
            
            <div class="content">
              <h3>Product Details</h3>
              <div class="section">
                <p><span class="label">Product:</span> <span class="value">${productName}</span></p>
                <p><span class="label">Part Number:</span> <span class="value highlight">${partNumber}</span></p>
              </div>
              
              <h3>Customer Details</h3>
              <div class="section">
                <p><span class="label">Name:</span> <span class="value">${name}</span></p>
                <p><span class="label">Email:</span> <span class="value">${email}</span></p>
                <p><span class="label">Country:</span> <span class="value">${country}</span></p>
                <p><span class="label">Quantity:</span> <span class="value">${quantity}</span></p>
              </div>
              
              <h3>Comment</h3>
              <div class="section">
                <p>${comment || 'No additional comments provided.'}</p>
              </div>
            </div>
            
            <div class="footer">
              <p>This is an automated notification. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Epimech. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send an automated response to the customer with beautiful design
    const customerMailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject: `Thank you for your quotation request - ${productName}`,
      text: `
        Dear ${name},
        
        Thank you for your quotation request for ${productName} (${partNumber}).
        
        We have received your request and will get back to you shortly with pricing details.
        
        Request Details:
        Product: ${productName}
        Part Number: ${partNumber}
        Quantity: ${quantity}
        
        If you have any questions, please don't hesitate to contact us.
        
        Best regards,
        The Epimech Team
      `,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Quotation Request Confirmation</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
              color: white;
              padding: 25px 30px;
              text-align: center;
            }
            .logo {
              max-height: 60px;
              margin-bottom: 15px;
            }
            .content {
              padding: 30px;
            }
            h2 {
              color: #1e3c72;
              margin-top: 0;
              font-size: 24px;
            }
            h3 {
              color: #2a5298;
              font-size: 18px;
              margin-top: 25px;
              margin-bottom: 10px;
            }
            .section {
              background-color: #f5f7fa;
              border-radius: 6px;
              padding: 20px;
              margin: 20px 0;
              border-left: 4px solid #1e3c72;
            }
            p {
              margin: 10px 0;
              color: #444;
            }
            .footer {
              text-align: center;
              padding: 20px 30px;
              background-color: #f0f0f0;
              font-size: 14px;
              color: #666;
            }
            .button {
              display: inline-block;
              background-color: #1e3c72;
              color: white;
              text-decoration: none;
              padding: 12px 25px;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: 600;
              text-align: center;
            }
            .details-row {
              display: flex;
              margin: 10px 0;
              flex-wrap: wrap;
            }
            .details-label {
              width: 120px;
              color: #666;
              font-weight: 600;
            }
            .details-value {
              flex: 1;
              color: #333;
            }
            .highlight {
              background-color: #fff4e5;
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: 600;
            }
            .banner {
              background-color: #e9f0ff;
              border-radius: 6px;
              padding: 15px;
              margin: 20px 0;
              border-left: 4px solid #1e3c72;
              text-align: center;
            }
            .contact {
              background-color: #f5f7fa;
              border-radius: 6px;
              padding: 15px;
              margin-top: 25px;
              text-align: center;
            }
            .social-links {
              margin-top: 15px;
            }
            .social-link {
              display: inline-block;
              margin: 0 10px;
              width: 32px;
              height: 32px;
            }
            @media (max-width: 600px) {
              .content {
                padding: 20px;
              }
              .header {
                padding: 20px 15px;
              }
              .details-label {
                width: 100%;
                margin-bottom: 5px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin:0; color:white;">QUOTATION REQUEST RECEIVED</h2>
            </div>
            
            <div class="content">
              <p>Dear <strong>${name}</strong>,</p>
              
              <p>Thank you for your interest in our products. We have received your quotation request for <strong>${productName}</strong>.</p>
              
              <div class="banner">
                <p style="margin:0;">Your request has been submitted successfully and is being processed</p>
              </div>
              
              <h3>Request Details</h3>
              <div class="section">
                <div class="details-row">
                  <div class="details-label">Product:</div>
                  <div class="details-value"><strong>${productName}</strong></div>
                </div>
                <div class="details-row">
                  <div class="details-label">Part Number:</div>
                  <div class="details-value"><span class="highlight">${partNumber}</span></div>
                </div>
                <div class="details-row">
                  <div class="details-label">Quantity:</div>
                  <div class="details-value">${quantity}</div>
                </div>
              </div>
              
              <p>Our sales team will review your request and get back to you with pricing information and availability as soon as possible, typically within 24-48 business hours.</p>
              
              <div class="contact">
                <p>If you have any questions or need immediate assistance, please contact our customer service team:</p>
                <p><strong>Email:</strong> sales@epimech.com | <strong>Phone:</strong> +1-123-456-7890</p>
              </div>
              
              <p>Thank you for choosing Epimech!</p>
              
              <p>Best regards,<br>
              <strong>The Epimech Team</strong></p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Epimech. All rights reserved.</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send both emails
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(customerMailOptions);

    return NextResponse.json({ message: 'Quotation request sent successfully' });
  } catch (error) {
    console.error('Error sending quotation email:', error);
    return NextResponse.json(
      { message: 'Failed to send quotation request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const inquiries = await Inquiry.find({ type: 'PRODUCT' }).sort({ createdAt: -1 });
    return NextResponse.json(inquiries);
  } catch (error) {
    console.error('Error fetching quotation inquiries:', error);
    return NextResponse.json({ message: 'Failed to fetch quotation inquiries' }, { status: 500 });
  }
}
