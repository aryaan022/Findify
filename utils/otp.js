const crypto = require('crypto');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send OTP via email using Resend
 * @param {string} email - Recipient email
 * @param {string} otp - OTP to send
 * @param {string} type - Type of OTP (signup, reset)
 * @returns {Promise<object>} Result from Resend API
 */
const sendOTP = async (email, otp, type = 'signup') => {
    try {
        let emailContent = '';
        let subject = '';

        if (type === 'signup') {
            subject = 'Email Verification - Local Business Finder';
            emailContent = `
                <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #667eea; margin-bottom: 20px;">Welcome to Local Business Finder!</h2>
                        
                        <p style="color: #333; font-size: 16px; margin-bottom: 15px;">
                            Thank you for signing up. Please verify your email address to complete your registration.
                        </p>
                        
                        <div style="background-color: #f0f4ff; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                            <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">Your OTP is:</p>
                            <p style="color: #667eea; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 0;">${otp}</p>
                        </div>
                        
                        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                            This OTP will expire in <strong>10 minutes</strong>. Do not share this code with anyone.
                        </p>
                        
                        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                            If you didn't request this verification, please ignore this email.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        
                        <p style="color: #999; font-size: 12px; text-align: center;">
                            Local Business Finder © 2025. All rights reserved.
                        </p>
                    </div>
                </div>
            `;
        } else if (type === 'reset') {
            subject = 'Password Reset OTP - Local Business Finder';
            emailContent = `
                <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #667eea; margin-bottom: 20px;">Password Reset Request</h2>
                        
                        <p style="color: #333; font-size: 16px; margin-bottom: 15px;">
                            We received a request to reset your password. Use the OTP below to verify your identity.
                        </p>
                        
                        <div style="background-color: #f0f4ff; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                            <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">Your OTP is:</p>
                            <p style="color: #667eea; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 0;">${otp}</p>
                        </div>
                        
                        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                            This OTP will expire in <strong>15 minutes</strong>. Do not share this code with anyone.
                        </p>
                        
                        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                            If you didn't request a password reset, please ignore this email and change your password immediately.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        
                        <p style="color: #999; font-size: 12px; text-align: center;">
                            Local Business Finder © 2025. All rights reserved.
                        </p>
                    </div>
                </div>
            `;
        }

        const result = await resend.emails.send({
            from: 'noreply@findify.live',
            to: email,
            subject: subject,
            html: emailContent
        });

        return { success: true, data: result };
    } catch (error) {
        console.error('Error sending OTP:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Calculate OTP expiry time (10 minutes for signup, 15 minutes for reset)
 * @param {string} type - Type of OTP
 * @returns {Date} Expiry time
 */
const getOTPExpiry = (type = 'signup') => {
    const expiryMinutes = type === 'signup' ? 10 : 15;
    return new Date(Date.now() + expiryMinutes * 60 * 1000);
};

/**
 * Verify OTP - check if it matches and hasn't expired
 * @param {string} providedOTP - OTP provided by user
 * @param {string} storedOTP - OTP stored in database
 * @param {Date} expiryTime - OTP expiry time
 * @returns {object} { valid: boolean, message: string }
 */
const verifyOTP = (providedOTP, storedOTP, expiryTime) => {
    if (!storedOTP) {
        return { valid: false, message: 'No OTP found. Please request a new one.' };
    }

    if (new Date() > expiryTime) {
        return { valid: false, message: 'OTP has expired. Please request a new one.' };
    }

    if (providedOTP !== storedOTP) {
        return { valid: false, message: 'Invalid OTP. Please check and try again.' };
    }

    return { valid: true, message: 'OTP verified successfully.' };
};

/**
 * Clear OTP from user document
 * @param {object} userDoc - Mongoose user document
 * @param {string} type - Type of OTP (signup, reset)
 * @returns {void}
 */
const clearOTP = (userDoc, type = 'signup') => {
    if (type === 'signup') {
        userDoc.otp = null;
        userDoc.otpExpiry = null;
    } else if (type === 'reset') {
        userDoc.resetOtp = null;
        userDoc.resetOtpExpiry = null;
    }
};

module.exports = {
    generateOTP,
    sendOTP,
    getOTPExpiry,
    verifyOTP,
    clearOTP
};
