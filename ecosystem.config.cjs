// File: /home/ec2-user/fe/ecosystem.config.cjs

module.exports = {
  apps: [
    {
      // --- Front-End App (Next.js) ---
      name: 'skyward-prod',
      cwd: '/home/ec2-user/fe',
      script: 'npm',
      args: 'run start:prod',
      // --- FIX IS HERE ---
      // instances: 1, // Replaced 'instances' with 'exec_mode'
      exec_mode: 'fork', // This ensures env variables are properly injected.
      // --- END FIX ---
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
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
      args: 'start',
      instances: 1, // This is fine for the Express API
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