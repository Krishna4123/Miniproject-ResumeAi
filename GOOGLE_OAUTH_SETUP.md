# Google OAuth Setup Instructions

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "ResumeAI-OAuth")
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on "Google Identity" and then "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in the required fields:
     - App name: "ResumeAI"
     - User support email: your email
     - Developer contact information: your email
   - Add scopes: `../auth/userinfo.email` and `../auth/userinfo.profile`
   - Add test users (your email address)

4. For Application type, choose "Web application"
5. Give it a name (e.g., "ResumeAI Web Client")

## Step 4: Configure Authorized Origins and Redirect URIs

### Authorized JavaScript origins:
```
http://localhost:5173
http://localhost:3000
http://localhost:8080
```

### Authorized redirect URIs:
```
http://localhost:5173
http://localhost:3000
http://localhost:8080
```

**Note:** Add your production domain when you deploy:
```
https://yourdomain.com
```

## Step 5: Get Your Client ID and Secret

1. After creating the OAuth client, you'll see a popup with your credentials
2. Copy the **Client ID** and **Client Secret**
3. You'll also see a download button for the JSON file

## Step 6: Configure Environment Variables

### Server (.env file):
```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Client (.env.local file):
```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here
VITE_API_URL=http://localhost:5002/api
```

## Step 7: Test the Integration

1. Start your server: `cd server && npm run dev`
2. Start your client: `cd client && npm run dev`
3. Go to `http://localhost:5173/login`
4. Click "Continue with Google"
5. Complete the OAuth flow

## Troubleshooting

### Common Issues:

1. **"This app isn't verified"**
   - This is normal for development
   - Click "Advanced" > "Go to ResumeAI (unsafe)"
   - For production, you'll need to verify your app

2. **"Error 400: redirect_uri_mismatch"**
   - Make sure your redirect URIs in Google Console match your app URLs
   - Check that you're using the correct port

3. **"Invalid client"**
   - Double-check your Client ID in both server and client environment files
   - Make sure there are no extra spaces or characters

4. **CORS errors**
   - Make sure your server CORS configuration includes your client URL
   - Check that the API URL in your client matches your server

### Security Notes:

- Never commit your `.env` files to version control
- Use strong, random JWT secrets in production
- Consider using environment-specific OAuth clients for dev/staging/production
- Regularly rotate your OAuth credentials

## Production Deployment

When deploying to production:

1. Create a new OAuth client for production
2. Add your production domain to authorized origins
3. Update environment variables with production values
4. Consider using a secrets management service
5. Enable HTTPS for all domains
