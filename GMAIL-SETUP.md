# Gmail SMTP Setup for Email Notifications

The CHQ Event Manager now uses Gmail SMTP to send email notifications for bookings.

## 📧 Email Notifications Included

### For Users:
1. **Booking Received** - Confirmation when they submit a booking request
2. **Booking Approved** - Notification when admin approves their booking
3. **Booking Denied** - Notification when admin denies their booking (with reason)
4. **Edit Requested** - Notification when admin requests changes to their booking

### For Admins:
1. **New Booking Request** - Notification whenever a new booking is submitted

---

## 🔧 Setup Instructions

### Step 1: Enable 2-Factor Authentication on Gmail

1. Go to: https://myaccount.google.com/security
2. Scroll to "2-Step Verification"
3. Click "Get Started" and follow the steps
4. **You must enable 2FA to create App Passwords**

### Step 2: Generate Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in to your Gmail account
3. Under "App name", type: **Coders HQ Notifications**
4. Click "Create"
5. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

### Step 3: Update Environment Variables

Edit the `.env` file and add your credentials:

```bash
# Your Gmail email address
GMAIL_USER=your-email@gmail.com

# The 16-character App Password (remove spaces)
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxx
```

**Example:**
```env
GMAIL_USER=admin@codershq.ae
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

### Step 4: Restart the Backend

```bash
docker compose restart backend
```

Or rebuild if packages changed:
```bash
docker compose up -d --build backend
```

---

## ✅ Verify It Works

Check the backend logs to confirm email service is configured:

```bash
docker logs chq-backend | grep "Email"
```

You should see:
```
✅ Email service configured with Gmail
```

---

## 🧪 Testing

1. **Test as User**: Create a new booking at http://localhost:8080
   - You should receive a "Booking Received" email
   - Admin should receive a "New Booking Request" email

2. **Test as Admin**: Approve/Deny the booking
   - User should receive approval/denial email

---

## ⚠️ Important Notes

- **Never use your regular Gmail password** - Always use App Password
- **Keep credentials secure** - Don't commit `.env` to git
- App Password works only with Gmail accounts that have 2FA enabled
- Gmail has a sending limit: ~500 emails/day for free accounts

---

## 🔒 Security Best Practices

1. Use a dedicated Gmail account for the application (e.g., `noreply@codershq.ae`)
2. Never share your App Password
3. Rotate App Passwords periodically
4. If compromised, revoke the App Password immediately at: https://myaccount.google.com/apppasswords

---

## 🚨 Troubleshooting

### "Email not sent - transporter not configured"
- Check that `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set in `.env`
- Restart the backend container

### "Invalid login"
- Make sure you're using an App Password, not your regular password
- Verify 2FA is enabled on your Gmail account
- Check for typos in the App Password (remove spaces)

### "Daily sending quota exceeded"
- Gmail free accounts are limited to ~500 emails/day
- Consider upgrading to Google Workspace for higher limits

---

## 📝 Email Templates

All email templates are in: `backend/src/email/email.service.ts`

You can customize:
- Email subject lines
- Email body HTML
- Sender display name (currently "Coders HQ")
