const nodemailer = require('nodemailer');

// Mock nodemailer MUST come before requiring the service if it creates transporter at module level
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: '12345' })
  })
}));

const emailService = require('../utils/email');

describe('Email Service', () => {
  it('should call sendMail when sending booking confirmation', async () => {
    const mockBooking = {
      user: { name: 'Test User', email: 'test@user.com' },
      venue: { name: 'Test Venue' },
      bookingDate: new Date(),
      startTime: '10:00',
      endTime: '11:00',
      totalPrice: 1000,
      _id: 'booking123'
    };

    await emailService.sendBookingConfirmation(mockBooking);
    
    const transporter = nodemailer.createTransport();
    expect(transporter.sendMail).toHaveBeenCalledTimes(1);
  });

  it('should call sendMail when sending password reset', async () => {
    const mockUser = { name: 'Test User', email: 'test@user.com' };
    const resetToken = 'token123';

    await emailService.sendPasswordReset(mockUser, resetToken);
    
    const transporter = nodemailer.createTransport();
    expect(transporter.sendMail).toHaveBeenCalledTimes(2); // Cumulative since we don't clear mock easily here without access to the instance
  });
});
