# Smart Auto-Prioritizer Setup Guide

## Google OAuth Setup

To enable Google OAuth with Gmail and Calendar access, follow these steps:

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google+ API (for basic profile info)
   - Gmail API
   - Google Calendar API

### 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Smart Auto-Prioritizer"
   - User support email: your email
   - Developer contact information: your email
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`

### 3. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)

### 4. Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Google OAuth credentials:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-random-secret-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

### 5. Generate NextAuth Secret

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Testing OAuth Flow

1. Click "Get Started with Google" on the landing page
2. You'll be redirected to the sign-in page
3. Click "Continue with Google"
4. Grant the requested permissions
5. You'll be redirected to the dashboard

The dashboard will show your connected account status and confirm that Gmail and Calendar permissions are granted.

## Gemini AI Setup

To enable AI-powered email classification:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add it to your `.env.local` file:
   ```
   GEMINI_API_KEY=your-actual-api-key-here
   ```

## Slack Integration Setup

To enable Slack integration:

### 1. Create a Slack App

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Enter app name: "Smart Auto-Prioritizer" (or your preferred name)
4. Select your Slack workspace
5. Click "Create App"

### 2. Configure OAuth & Permissions

1. In your app settings, go to "OAuth & Permissions"
2. Under "Redirect URLs", add:
   ```
   http://localhost:3000/api/slack/callback
   ```
3. Under "Bot Token Scopes", add these scopes:
   - `channels:read`
   - `groups:read`
   - `im:read`
   - `mpim:read`
   - `channels:history`
   - `groups:history`
   - `im:history`
   - `mpim:history`
   - `users:read`
   - `team:read`

### 3. Get App Credentials

1. Go to "Basic Information" in your app settings
2. Under "App Credentials", copy:
   - Client ID
   - Client Secret
   - Signing Secret
   - Verification Token
3. Add these to your `.env.local` file:
   ```
   SLACK_CLIENT_ID=your-client-id
   SLACK_CLIENT_SECRET=your-client-secret
   SLACK_SIGNING_SECRET=your-signing-secret
   SLACK_VERIFICATION_TOKEN=your-verification-token
   ```

### 4. Install App to Workspace

1. Go to "Install App" in your app settings
2. Click "Install to Workspace"
3. Authorize the app

## Next Steps

Once OAuth, Gemini AI, and Slack are configured:
- Gmail API integration to extract tasks from emails ✅
- AI-powered email classification with Gemini ✅
- Slack integration for message monitoring ✅
- Google Calendar API integration for scheduling
- Kanban board interface for task management ✅