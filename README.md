# Zenchron - AI-Powered Task Management Platform

<div align="center">
  <img src="./public/zenn.png" alt="Zenchron Logo" width="120" height="120" />
  
  **Streamline your workflow, amplify your success**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
</div>

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Integrations](#api-integrations)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Overview

Zenchron is an intelligent AI-powered task management platform designed to streamline digital workflows and automate mundane tasks. Built with modern web technologies, it integrates seamlessly with popular productivity tools to provide a unified workspace for managing tasks, projects, and team collaboration.

### Key Highlights

- **AI-Powered Task Categorization** - Automatically categorizes and prioritizes tasks using Google Gemini AI
- **Voice Input Support** - Create tasks using natural speech recognition
- **Modern Kanban Board** - Beautiful, interactive task management with drag-and-drop functionality
- **Multi-Platform Integration** - Connects with Gmail, Slack, Notion, Google Calendar, and Google Meet
- **Responsive Design** - Works seamlessly across desktop, tablet, and mobile devices
- **Modern UI/UX** - Clean, minimalistic design with glass morphism effects and smooth animations

## Features

### Core Task Management

#### Smart Task Board
- **Modern Kanban Interface**: Glass morphism design with gradient columns and smooth animations
- **AI-Powered Categorization**: Automatically sorts tasks into 10 different categories:
  - Follow-Up Tasks
  - Quick Wins
  - High Priority
  - Deep Work
  - Deadline-Based
  - Recurring Tasks
  - Scheduled Events
  - Reference Information
  - Waiting/Blocked
  - Custom Categories

#### Intelligent Task Input
- **Natural Language Processing**: Describe multiple tasks in plain English
- **Voice Recognition**: Speak your tasks using built-in speech-to-text
- **Quick Examples**: One-click task templates for common scenarios
- **Batch Creation**: Create multiple related tasks simultaneously

#### Advanced Task Features
- **Priority Levels**: 5-tier priority system (Low to Critical)
- **Due Dates & Scheduling**: Set deadlines and scheduled times
- **Time Estimation**: Track estimated duration for better planning
- **Tags & Labels**: Organize tasks with custom tags
- **Status Tracking**: Todo, In Progress, Waiting, Done, Cancelled
- **Calendar Integration**: Create Google Calendar events directly from tasks

### Platform Integrations

#### Gmail Integration
- **Smart Email Classification**: AI-powered work email detection
- **Automatic Task Extraction**: Convert emails into actionable tasks
- **Sender Analysis**: Track communication patterns and priorities
- **Real-time Sync**: Continuous monitoring of new emails

#### Slack Integration
- **Message Analysis**: Extract tasks from Slack conversations
- **Mention Tracking**: Monitor messages that mention you
- **Channel Monitoring**: Track relevant discussions across channels
- **Direct Message Processing**: Convert DMs into actionable items

#### Notion Integration
- **Page Synchronization**: Import content from Notion pages
- **Database Integration**: Connect with Notion databases
- **Content Analysis**: Extract actionable items from documentation
- **Bi-directional Sync**: Keep tasks synchronized between platforms

#### Google Calendar Integration
- **Event Analysis**: Extract tasks from calendar events
- **Meeting Preparation**: Create prep tasks for upcoming meetings
- **Schedule Optimization**: AI suggestions for better time management
- **Automatic Scheduling**: Create calendar blocks for task execution

#### Google Meet Integration
- **Transcript Processing**: Extract action items from meeting transcripts
- **Follow-up Generation**: Create tasks based on meeting discussions
- **Participant Tracking**: Monitor commitments and assignments
- **Integration with TranscripTonic**: Seamless transcript analysis

### AI-Powered Features

#### Intelligent Task Planning
- **Priority Analysis**: AI-driven priority recommendations
- **Time Estimation**: Smart duration predictions
- **Workload Balancing**: Optimal task distribution
- **Deadline Management**: Proactive deadline monitoring

#### Smart Categorization
- **Context Understanding**: Analyzes task content and context
- **Pattern Recognition**: Learns from user behavior
- **Automatic Tagging**: Suggests relevant tags and labels
- **Project Grouping**: Intelligently groups related tasks

### User Experience

#### Modern Design System
- **Glass Morphism**: Beautiful translucent design elements
- **Gradient Themes**: Consistent color schemes across the platform
- **Smooth Animations**: Micro-interactions and transitions
- **Responsive Layout**: Optimized for all device sizes

#### Typography & Branding
- **Bodoni Moda Font**: Elegant serif typography for headings
- **Consistent Hierarchy**: Clear information architecture
- **Professional Aesthetics**: Clean, minimalistic interface
- **Brand Consistency**: Cohesive visual identity

#### Interactive Elements
- **Hover Effects**: Engaging micro-interactions
- **Loading States**: Beautiful loading animations
- **Error Handling**: User-friendly error messages
- **Accessibility**: WCAG compliant design

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom Components
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **AI Integration**: Google Gemini API

### Integrations
- **Google APIs**: Gmail, Calendar, Meet
- **Slack API**: Real-time messaging integration
- **Notion API**: Content synchronization
- **Speech Recognition**: Web Speech API

### Development Tools
- **Package Manager**: npm/yarn
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript
- **Version Control**: Git

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB database
- Google Cloud Platform account (for AI and API access)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/zenchron.git
   cd zenchron
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # Authentication
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   
   # Google APIs
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GEMINI_API_KEY=your_gemini_api_key
   
   # Slack Integration
   SLACK_CLIENT_ID=your_slack_client_id
   SLACK_CLIENT_SECRET=your_slack_client_secret
   
   # Notion Integration
   NOTION_CLIENT_ID=your_notion_client_id
   NOTION_CLIENT_SECRET=your_notion_client_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Setup

1. **MongoDB Configuration**
   - Create a MongoDB database (local or MongoDB Atlas)
   - Update the `MONGODB_URI` in your `.env.local` file

2. **Initial Data**
   - The application will automatically create necessary collections
   - User data is created upon first authentication

## Project Structure

```
zenchron/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── tasks/                # Task management APIs
│   │   ├── gmail/                # Gmail integration
│   │   ├── slack/                # Slack integration
│   │   └── calendar/             # Calendar integration
│   ├── dashboard/                # Dashboard pages
│   │   ├── tasks/                # Task management
│   │   ├── gmail/                # Gmail dashboard
│   │   ├── slack/                # Slack dashboard
│   │   ├── notion/               # Notion dashboard
│   │   ├── calendar/             # Calendar dashboard
│   │   ├── gmeet/                # Google Meet dashboard
│   │   ├── ai/                   # AI planning dashboard
│   │   └── settings/             # User settings
│   ├── auth/                     # Authentication pages
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   ├── kanban/                   # Kanban board components
│   ├── tasks/                    # Task-related components
│   ├── layout/                   # Layout components
│   ├── landing/                  # Landing page components
│   └── demos/                    # Demo components
├── lib/                          # Utility libraries
│   ├── models/                   # Data models
│   ├── utils.ts                  # Utility functions
│   └── auth.ts                   # Authentication config
├── hooks/                        # Custom React hooks
├── public/                       # Static assets
└── types/                        # TypeScript type definitions
```

## API Integrations

### Google APIs Setup

1. **Google Cloud Console**
   - Create a new project or select existing
   - Enable Gmail API, Calendar API, and Google Meet API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

2. **Gemini AI Setup**
   - Enable Gemini API in Google Cloud Console
   - Generate API key for AI features

### Slack Integration

1. **Slack App Creation**
   - Create a new Slack app at api.slack.com
   - Configure OAuth scopes for message reading
   - Set up event subscriptions for real-time updates

### Notion Integration

1. **Notion Integration**
   - Create a new integration at notion.so/my-integrations
   - Configure OAuth settings
   - Set up database access permissions



