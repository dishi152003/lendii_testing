import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../config/supabase';
import { resend, emailConfig } from '../config/email';
import { AppError } from '../middleware/errorHandler';
import { User, UserRole } from '../types';

export class AuthService {
    // Send magic link email
    async sendMagicLink(email: string): Promise<{ token: string }> {
        try {
            // Generate magic link token
            const token = uuidv4();
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiry

            // Store token in database
            const { error: tokenError } = await supabaseAdmin
                .from('magic_link_tokens')
                .insert({
                    email,
                    token,
                    expires_at: expiresAt.toISOString()
                });

            if (tokenError) {
                throw new AppError(500, 'Failed to create magic link token');
            }

            // Send email with magic link
            const magicLink = `${emailConfig.baseUrl}/api/v1/auth/callback?token=${token}`;

            if (resend) {
                try {
                    await resend.emails.send({
                        from: emailConfig.from,
                        to: email,
                        subject: 'Your Lendii Login Link',
                        html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to Lendii!</h2>
                <p>Click the button below to log in to your account:</p>
                <a href="${magicLink}" 
                   style="display: inline-block; background-color: #000; color: #fff; 
                          padding: 12px 24px; text-decoration: none; border-radius: 4px; 
                          margin: 20px 0;">
                  Log In to Lendii
                </a>
                <p style="color: #666; font-size: 14px;">
                  This link will expire in 15 minutes. If you didn't request this, you can safely ignore this email.
                </p>
                <p style="color: #999; font-size: 12px;">
                  Or copy this link: ${magicLink}
                </p>
              </div>
            `
                    });
                } catch (emailError) {
                    console.error('Email send error:', emailError);
                    // Don't fail the request if email fails
                }
            }

            return { token };
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Send magic link error:', error);
            throw new AppError(500, 'Failed to send magic link');
        }
    }

    // Verify magic link and create session
    async verifyMagicLink(token: string): Promise<{ access_token: string; user: User }> {
        try {
            // Find and validate token
            const { data: magicToken, error: tokenError } = await supabaseAdmin
                .from('magic_link_tokens')
                .select('*')
                .eq('token', token)
                .gt('expires_at', new Date().toISOString())
                .single();

            if (tokenError || !magicToken) {
                throw new AppError(401, 'Invalid or expired magic link');
            }

            const email = magicToken.email;

            // Find or create user
            let { data: user, error: userError } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (userError || !user) {
                // Create new user
                const role = email.includes('admin') ? UserRole.ADMIN : UserRole.BORROWER;

                const { data: newUser, error: createError } = await supabaseAdmin
                    .from('users')
                    .insert({
                        email,
                        role
                    })
                    .select()
                    .single();

                if (createError || !newUser) {
                    throw new AppError(500, 'Failed to create user');
                }

                user = newUser;
            }

            // Create session
            const sessionToken = uuidv4();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

            const { error: sessionError } = await supabaseAdmin
                .from('sessions')
                .insert({
                    user_id: user.id,
                    token: sessionToken,
                    expires_at: expiresAt.toISOString()
                });

            if (sessionError) {
                throw new AppError(500, 'Failed to create session');
            }

            // Delete used magic link token
            await supabaseAdmin
                .from('magic_link_tokens')
                .delete()
                .eq('token', token);

            return {
                access_token: sessionToken,
                user: user as User
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Verify magic link error:', error);
            throw new AppError(500, 'Failed to verify magic link');
        }
    }

    // Get current session
    async getCurrentSession(token: string): Promise<User> {
        try {
            const { data: session, error } = await supabaseAdmin
                .from('sessions')
                .select('*, users (*)')
                .eq('token', token)
                .gt('expires_at', new Date().toISOString())
                .single();

            if (error || !session) {
                throw new AppError(401, 'Invalid or expired session');
            }

            return session.users as User;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(401, 'Unauthorized');
        }
    }

    // Logout
    async logout(token: string): Promise<void> {
        try {
            const { error } = await supabaseAdmin
                .from('sessions')
                .delete()
                .eq('token', token);

            if (error) {
                throw new AppError(500, 'Failed to logout');
            }
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to logout');
        }
    }
}

export const authService = new AuthService();
