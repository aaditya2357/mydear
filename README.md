# CloudConnect - Remote Desktop Access System

A cloud-based remote desktop access system that enables secure web-based access to virtual desktops with comprehensive session management and monitoring.

## Features

- Secure authentication with username/password
- Remote desktop connection management
- Active session monitoring
- Multi-protocol support (RDP, VNC, SSH)
- Security monitoring and analytics

## Deployment on Render

### Manual Deployment

1. Fork or clone this repository
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: A random string for session encryption
5. Deploy with these settings:
   - Build Command: `./render-build.sh`
   - Start Command: `npm run start`

### One-Click Deployment

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/yourusername/cloudconnect)

1. Click the "Deploy to Render" button above
2. Sign in to your Render account or create one
3. Follow the prompts to set up your service

## Local Development

1. Clone the repository
2. Copy `.env.example` to `.env` and set values
3. Install dependencies: `npm install`
4. Set up the database: `npm run db:push && npm run db:seed`
5. Start the development server: `npm run dev`

## Tech Stack

- Frontend: React, Tailwind CSS, Shadcn/UI
- Backend: Node.js, Express
- Database: PostgreSQL with Drizzle ORM
- Authentication: Passport.js
- Real-time: WebSockets