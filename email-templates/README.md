# Custom Email Templates for Supabase Auth

This folder contains custom HTML email templates for Supabase authentication flows.

## Templates Included

- `auth-confirmation.html` - Email confirmation for new sign-ups
- `password-reset.html` - Password reset emails
- `magic-link.html` - Magic link authentication emails

## How to Use

### 1. Access Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**

### 2. Upload Templates

For each template:

1. Select the email type (Confirm signup, Reset password, Magic Link)
2. Click **Edit Template**
3. Copy the content from the corresponding HTML file
4. Paste it into the **Subject** and **Body (HTML)** fields

### 3. Configure Template Variables

These templates use Supabase's built-in template variables:

- `{{ .ConfirmationURL }}` - The confirmation/action URL
- `{{ .Email }}` - The recipient's email address
- `{{ .SiteURL }}` - Your site URL (configured in Supabase settings)
- `{{ .RedirectTo }}` - Redirect URL (if specified)

### 4. Customize Branding

To customize the templates for your brand:

1. **Logo/Company Name**: Replace `{{ .SiteURL }}` in the header with your company name
2. **Colors**: Update the CSS color variables:
   - Primary color: `#2563eb` (blue)
   - Success color: `#059669` (green)
   - Warning color: `#dc2626` (red)
3. **Fonts**: Modify the `font-family` in the CSS
4. **Footer**: Update copyright and support contact information

### 5. Email Subjects

Recommended email subjects for each template:

- **Confirmation**: "Confirm your email address"
- **Password Reset**: "Reset your password"
- **Magic Link**: "Your sign-in link"

### 6. Testing

After uploading:

1. Test each email type by triggering the auth flow
2. Check email formatting across different clients (Gmail, Outlook, etc.)
3. Verify all links work correctly
4. Test on mobile devices

## Template Features

- **Responsive Design**: Works on desktop and mobile
- **Dark Mode Safe**: Uses web-safe colors
- **Professional Styling**: Clean, modern design
- **Security Notes**: Includes security information for users
- **Accessible**: Good contrast ratios and semantic HTML

## Customization Tips

### Adding Your Logo

Replace the text logo with an image:

```html
<div class="logo">
  <img
    src="https://yourdomain.com/logo.png"
    alt="Your Company"
    style="height: 40px;"
  />
</div>
```

### Custom Colors

Create a color scheme that matches your brand:

```css
:root {
  --primary-color: #your-primary-color;
  --success-color: #your-success-color;
  --danger-color: #your-danger-color;
}
```

### Advanced Styling

- Add gradients for backgrounds
- Include social media links in the footer
- Add promotional content (carefully, to avoid spam filters)

## Important Notes

1. **Test Thoroughly**: Always test emails before going live
2. **Mobile First**: Most users read emails on mobile
3. **Spam Filters**: Avoid excessive styling or promotional language
4. **Plain Text**: Consider adding plain text versions for better deliverability
5. **GDPR Compliance**: Include unsubscribe information if required

## Support

If you need help with email template setup:

1. Check Supabase documentation on email templates
2. Test with different email providers
3. Validate HTML using online validators
4. Check spam score using email testing tools
