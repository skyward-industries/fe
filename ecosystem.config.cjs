// File: /home/ec2-user/fe/ecosystem.config.cjs

module.exports = {
  apps: [
    {
      // --- Front-End App (Next.js) ---
      name: 'skyward-prod',
      cwd: '/home/ec2-user/fe', // Working directory for your Next.js app
      script: 'npm',          // Tell PM2 to run npm
      // --- THIS IS THE CRITICAL PART ---
      // If your fe/package.json has "start:prod": "npm run build && next start",
      // then this args should be 'run start:prod'
      args: 'run start:prod',  // <-- This MUST be 'run start:prod'
      // --- END CRITICAL PART ---
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Add other production env variables here
        INTERNAL_API_URL: 'http://localhost:5000',
        PGHOST: 'skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com',
        PGPORT: '5432',
        PGDATABASE: 'skyward',
        PGUSER: 'postgres',
        PGPASSWORD: 'Skyward_db_pw1234!',
      }
    },
    {
      // --- Back-End App (Express API) ---
      name: 'api',
      cwd: '/home/ec2-user/api',
      script: 'npm',
      args: 'start', // Assuming your API's package.json has a 'start' script like 'node server.js' or similar
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        DATABASE_URL: 'postgres://postgres:Skyward_db_pw1234!@skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com/skyward',
        GMAIL_USER: 'admin@skywardparts.com',
        GMAIL_APP_PASSWORD: 'xpii wnpb yhco pcdy'
      }
    }
  ]
};