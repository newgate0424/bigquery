const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

// สร้าง Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // สร้าง HTTP server
  const server = createServer(async (req, res) => {
    try {
      // Parse URL
      const parsedUrl = parse(req.url, true);
      
      // Handle all requests with Next.js
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Start server
  server.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`🚀 170sa Analytics Server ready!`);
    console.log(`📊 Local: http://${hostname}:${port}`);
    console.log(`🌐 Network: http://localhost:${port}`);
    console.log(`📁 Environment: ${dev ? 'development' : 'production'}`);
    console.log(`🔧 Node.js: ${process.version}`);
    console.log(`⚡ Next.js: Production mode`);
    
    if (dev) {
      console.log('\n🛠️  Development mode - Hot reload enabled');
    } else {
      console.log('\n🏭 Production mode - Optimized build');
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
  });

}).catch((err) => {
  console.error('❌ Error starting server:', err);
  process.exit(1);
});