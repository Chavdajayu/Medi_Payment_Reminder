const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Medi-Payment-Reminder Development Environment...');

function run(name, command, args) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    cwd: __dirname,
    env: process.env,
    shell: false
  });
  
  child.on('error', (err) => {
    console.error(`[${name}] Failed to start:`, err);
  });
  
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`[${name}] process exited with code ${code}`);
    }
  });

  return child;
}

// Start Backend Server (using nodemon)
const server = run('Server', 'node', ['node_modules/nodemon/bin/nodemon.js', '--ignore', 'whatsapp-session/', '--ignore', 'dev.js', 'server.js']);

// Start Frontend Client (using vite)
const client = run('Client', 'node', ['node_modules/vite/bin/vite.js']);

// Handle process termination to kill children
const cleanup = () => {
  console.log('\nStopping services...');
  server.kill();
  client.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
