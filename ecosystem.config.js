module.exports = {
  apps: [{
    name: '170sa-analytics',
    script: 'app.js',
    instances: 'max', // หรือระบุจำนวน instance ที่ต้องการ
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
      HOSTNAME: 'localhost'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Auto restart
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.next'],
    
    // Memory and CPU limits
    max_memory_restart: '1G',
    
    // Restart settings
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Health monitoring
    kill_timeout: 5000,
    listen_timeout: 8000,
    
    // Environment variables
    merge_logs: true,
    time: true
  }],

  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/master',
      repo: 'git@github.com:newgate0424/bigquery.git',
      path: '/var/www/170sa-analytics',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};