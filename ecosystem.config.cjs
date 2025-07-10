// File: /home/ec2-user/ecosystem.config.cjs (or wherever yours is located)

module.exports = {
  apps: [
    {
      // --- Front-End App (Next.js) ---
      name: 'skyward-prod',
      cwd: '/home/ec2-user/fe', // Correct directory for frontend
      script: 'npm',
      args: 'run start:prod', // Assuming your package.json has a 'start:prod' script like 'next start'
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Frontend Database variables (used during build for static generation, and by server-side components)
        PGHOST: 'skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com',
        PGPORT: '5432',
        PGDATABASE: 'skyward',
        PGUSER: 'postgres',
        PGPASSWORD: 'Skyward_db_pw1234!',
        // CRITICAL FIX: Frontend's client-side API URL.
        // This is necessary because CartPage.tsx uses process.env.NEXT_PUBLIC_API_URL
        // and needs to be set at BUILD time. We set it here for PM2 and ensure it's picked up.
        // It's the base domain, without "/api", because your fetch call adds "/api/send-email"
        NEXT_PUBLIC_API_URL: 'https://skywardparts.com',
        // Next.js specific build variable:
        NEXT_PUBLIC_VAR_EXAMPLE: 'https://skywardparts.com' // Ensure it's correctly exposed to client-side.
      }
    },
    {
      // --- Back-End App (Express API) ---
      name: 'api',
      cwd: '/home/ec2-user/api', // Correct directory for backend
      script: 'npm',
      args: 'start', // Assumes your package.json has a 'start' script like 'node src/server.js'
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000, // API listening port
        // CRITICAL FIX: Ensure correct DATABASE_URL format and Gmail credentials
        // This DATABASE_URL will be used by api/src/lib/db.js
        DATABASE_URL: 'postgres://postgres:Skyward_db_pw1234!@skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com:5432/skyward',
        GMAIL_USER: 'admin@skywardparts.com',
        GMAIL_PASS: 'xpii wnpb yhco pcdy', // FIX: Corrected variable name GMAIL_PASS (not GMAIL_APP_PASSWORD)
      }
    }
  ]
};