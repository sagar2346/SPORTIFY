const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send booking confirmation email
exports.sendBookingConfirmation = async (booking) => {
  try {
    const mailOptions = {
      from: `"Sport Booking System" <${process.env.EMAIL_FROM}>`,
      to: booking.user.email,
      subject: 'Booking Confirmation - Sport Booking System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Booking Confirmed!</h2>
          <p>Dear ${booking.user.name},</p>
          <p>Your booking has been confirmed. Here are the details:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Booking Details</h3>
            <p><strong>Venue:</strong> ${booking.venue.name}</p>
            <p><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
            <p><strong>Total Price:</strong> $${booking.totalPrice}</p>
            <p><strong>Booking ID:</strong> ${booking._id}</p>
          </div>
          
          <p>You can view your ticket in your dashboard.</p>
          <p>Thank you for using our service!</p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">This is an automated email. Please do not reply.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Send booking cancellation email
exports.sendBookingCancellation = async (booking) => {
  try {
    const mailOptions = {
      from: `"Sport Booking System" <${process.env.EMAIL_FROM}>`,
      to: booking.user.email,
      subject: 'Booking Cancelled - Sport Booking System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f44336;">Booking Cancelled</h2>
          <p>Dear ${booking.user.name},</p>
          <p>Your booking has been cancelled.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Booking Details</h3>
            <p><strong>Venue:</strong> ${booking.venue.name}</p>
            <p><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
            <p><strong>Refund Amount:</strong> $${booking.cancellation.refundAmount || 0}</p>
          </div>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">This is an automated email. Please do not reply.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Cancellation email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Send password reset email
exports.sendPasswordReset = async (user, resetToken) => {
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"Sportify" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2196F3;">Password Reset Request</h2>
          <p>Dear ${user.name},</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <p><a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Send reply to customer message
exports.sendReplyToMessage = async (message, replyText) => {
  try {
    const mailOptions = {
      from: `"Sport Booking System" <${process.env.EMAIL_FROM}>`,
      to: message.email,
      subject: `Re: ${message.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Response from Sport Booking System</h2>
          <p>Dear ${message.name},</p>
          <p>Thank you for contacting us. Here is our response to your message:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Your Message:</h3>
            <p style="font-style: italic; color: #555;">"${message.message}"</p>
            <hr style="margin: 15px 0; border: 0; border-top: 1px solid #ddd;">
            <h3>Our Reply:</h3>
            <p>${replyText}</p>
          </div>
          
          <p>If you have any further questions, please feel free to reply to this email.</p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">This is an automated email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reply email sent to ${message.email}`);
  } catch (error) {
    console.error('Error sending reply email:', error);
  }
};

// Send notification to Admin about new message
exports.sendAdminNewMessageNotification = async (message) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER; // Fallback to system email

    const mailOptions = {
      from: `"Sportify" <${process.env.EMAIL_FROM}>`,
      to: adminEmail,
      subject: `New Customer Message: ${message.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2196F3;">New Message Received</h2>
          <p><strong>From:</strong> ${message.name} (${message.email})</p>
          <p><strong>Subject:</strong> ${message.subject}</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
            <p style="margin: 0;">${message.message}</p>
          </div>
          
          <p><a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/dashboard" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">Reply in Dashboard</a></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Admin notification sent to ${adminEmail}`);
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
};

// Send message to a friend/contact
exports.sendFriendMessage = async (sender, recipientEmail, subject, message) => {
  try {
    const mailOptions = {
      from: `"Sport Booking System" <${process.env.EMAIL_FROM}>`,
      replyTo: sender.email, // Allow friend to reply directly to the user
      to: recipientEmail,
      subject: `Message from ${sender.name}: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #673ab7;">Hello!</h2>
          <p>You received a message from your friend <strong>${sender.name}</strong> via Sport Booking System.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>${subject}</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          
          <p style="font-size: 12px; color: #888;">You can reply directly to this email to contact ${sender.name} (${sender.email}).</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Friend message sent to ${recipientEmail}`);
  } catch (error) {
    console.error('Error sending friend message:', error);
    throw error; // Re-throw to handle in controller
  }
};

