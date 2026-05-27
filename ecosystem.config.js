module.exports = {
  apps: [
    {
      name: 'bolshevid-prod', // Production instance
      script: 'npm', // Use npm to start the app
      args: 'start', // Command to start the Next.js app (assumes a production build)
      instances: 1, // Single instance (adjust to cluster in production if needed)
      exec_mode: 'fork', // Fork mode for simplicity (switch to 'cluster' for scaling)
      env: {
        NODE_ENV: 'production', // Production environment
        PORT: '3050', // Port for production (matches your Nginx proxy_pass)
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss', // Format for logs
      error_file: './logs/bolshevid-prod-error.log', // Error log file
      out_file: './logs/bolshevid-prod-out.log', // Output log file
      pid_file: './logs/bolshevid-prod.pid', // PID file for the process
      max_memory_restart: '1G', // Restart if memory usage exceeds 1GB
      watch: false, // No file watching in production
      ignore_watch: ['node_modules', 'logs', '.git'], // Ignore these directories
    },
    {
      name: 'bolshevid-dev', // Development instance
      script: 'npm', // Use npm to start the app
      args: 'run dev', // Command to start the Next.js app in dev mode
      instances: 1, // Single instance for development
      exec_mode: 'fork', // Fork mode for simplicity
      env: {
        NODE_ENV: 'development', // Development environment
        PORT: '3051', // Port for development (different from production)
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss', // Format for logs
      error_file: './logs/bolshevid-dev-error.log', // Error log file
      out_file: './logs/bolshevid-dev-out.log', // Output log file
      pid_file: './logs/bolshevid-dev.pid', // PID file for the process
      max_memory_restart: '1G', // Restart if memory usage exceeds 1GB
      watch: true, // Enable file watching for development
      ignore_watch: ['node_modules', 'logs', '.git'], // Ignore these directories
    },
  ],
};
