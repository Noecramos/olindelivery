# Super Admin Password Reset - Email Configuration

## Current Status
✅ **Password reset functionality implemented**
⚠️ **Email sending requires SMTP configuration**

## How It Works

When you click "Esqueci minha senha" on the Super Admin login page:

1. **Generates a new random password** (10 characters)
2. **Saves it to the database** (`global_settings` table)
3. **Attempts to send email** (if SMTP is configured)
4. **Falls back to displaying password** (if email is not configured)

## Current Behavior (Without Email)

Since SMTP is not configured, when you reset the password:
- ✅ A new password is generated
- ✅ It's saved to the database
- ✅ It's displayed in an alert popup
- ❌ No email is sent

**You must copy and save the password from the alert!**

## To Enable Email Sending

Add these environment variables to your Vercel project:

### Required Environment Variables:

```env
# SMTP Server Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=OlinDelivery <your-email@gmail.com>

# Admin Email (where password reset emails are sent)
ADMIN_EMAIL=admin@yourdomain.com
```

### Gmail Setup (Recommended):

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "OlinDelivery"
   - Copy the 16-character password
3. **Add to Vercel**:
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add all the SMTP variables above
   - Use the app password for `SMTP_PASS`

### Alternative SMTP Providers:

#### SendGrid:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun:
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-smtp-username
SMTP_PASS=your-mailgun-smtp-password
```

#### AWS SES:
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

## Testing

After configuring SMTP:

1. Go to: https://olindelivery.vercel.app/admin/super
2. Click "Esqueci minha senha"
3. Confirm the reset
4. Check your email (ADMIN_EMAIL) for the new password

## Email Template

The password reset email includes:
- 🔐 Subject: "OlinDelivery - Nova Senha de Super Admin"
- Professional HTML template
- New password displayed prominently
- Link to admin panel
- OlinDelivery branding

## Security Notes

- ✅ Password is saved to database before email is sent
- ✅ If email fails, password is still displayed in alert
- ✅ Old password is immediately invalidated
- ✅ SMTP credentials are stored securely in Vercel environment variables
- ⚠️ Make sure to use App Passwords, not your actual email password

## Troubleshooting

### "Email not sent" message:
- Check that all SMTP environment variables are set
- Verify SMTP credentials are correct
- Check Vercel deployment logs for email errors

### Gmail "Less secure app" error:
- Use an App Password instead of your regular password
- Enable 2-Factor Authentication first

### Email not received:
- Check spam folder
- Verify ADMIN_EMAIL is correct
- Check Vercel logs for sending errors

## Files Modified

1. **`app/api/admin/super-reset/route.ts`** - Password reset endpoint
2. **`package.json`** - Added nodemailer dependency

## Next Steps

1. **Install dependencies**: `npm install` (Vercel does this automatically)
2. **Configure SMTP** (optional - see above)
3. **Test password reset**
4. **Deploy to Vercel**

---

**Status**: ✅ Implemented and ready to use (with or without email)
