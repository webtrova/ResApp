# Gmail SMTP Setup for Password Reset

This guide will help you set up Gmail SMTP to send password reset emails for your resApp application.

## 🔐 **Step 1: Enable 2-Factor Authentication**

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Step Verification if not already enabled

## 🔑 **Step 2: Generate App Password**

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification**
3. Scroll down and click **App passwords**
4. Select **Mail** as the app and **Other** as the device
5. Enter a name like "resApp Password Reset"
6. Click **Generate**
7. **Copy the 16-character password** (you'll only see it once!)

## 🌍 **Step 3: Set Environment Variables**

Add these variables to your `.env.local` file:


# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# App URL (for reset links)
NEXT_PUBLIC_APP_URL=http://localhost:3003
```

**For Production:**
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🧪 **Step 4: Test the Setup**

1. Start your development server: `npm run dev`
2. Go to `/forgot-password`
3. Enter your email address
4. Check your email for the reset link

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Invalid credentials" error:**
   - Make sure you're using the App Password, not your regular Gmail password
   - Ensure 2-Factor Authentication is enabled

2. **"Less secure app access" error:**
   - This is expected - use App Passwords instead
   - App Passwords are more secure than "less secure app access"

3. **Email not sending:**
   - Check your `.env.local` file has the correct variables
   - Verify the Gmail account has SMTP enabled
   - Check the browser console for errors

4. **Reset link not working:**
   - Ensure `NEXT_PUBLIC_APP_URL` is set correctly
   - Check that the token is being passed correctly in the URL

### **Security Best Practices:**

1. **Never commit your `.env.local` file** to version control
2. **Use App Passwords** instead of your main Gmail password
3. **Rotate App Passwords** periodically
4. **Use environment-specific URLs** (localhost for dev, your domain for production)

## 📧 **Email Template Features**

The password reset email includes:
- ✅ Professional resApp branding
- ✅ Secure reset link with 1-hour expiration
- ✅ Clear instructions and fallback text link
- ✅ Mobile-responsive design
- ✅ Security warnings and contact information

## 🚀 **Production Deployment**

For production deployment:

1. **Update environment variables** with your production domain
2. **Use a dedicated Gmail account** for sending emails
3. **Consider using a transactional email service** like SendGrid or Mailgun for higher volume
4. **Monitor email delivery rates** and spam folder placement

## 📝 **Database Schema Update**

Make sure to run the updated database schema that includes the reset password fields:

```sql
ALTER TABLE users 
ADD COLUMN reset_token VARCHAR(255),
ADD COLUMN reset_token_expires TIMESTAMP NULL;
```

## ✅ **Verification Checklist**

- [ ] 2-Factor Authentication enabled on Gmail
- [ ] App Password generated and copied
- [ ] Environment variables set in `.env.local`
- [ ] Database schema updated
- [ ] Test email sent successfully
- [ ] Reset link works correctly
- [ ] Password can be changed successfully

---

**Need help?** Check the browser console for errors or review the email service logs in your terminal.
