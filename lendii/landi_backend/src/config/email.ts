import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
    console.warn('⚠️  Missing RESEND_API_KEY - Email functionality will be disabled');
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const emailConfig = {
    from: process.env.FROM_EMAIL || 'noreply@lendii.com',
    magicLinkExpiresIn: process.env.MAGIC_LINK_EXPIRES_IN || '15m',
    baseUrl: process.env.MAGIC_LINK_BASE_URL || 'http://localhost:3001'
};
