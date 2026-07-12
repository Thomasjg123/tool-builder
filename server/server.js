const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Declare server at MODULE LEVEL (not inside a function)
let server;

server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on http://0.0.0.0:${PORT}`);
    console.log(`Press Ctrl+C to stop`);
});


// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n⚠️  SIGINT received - shutting down...');
    server.close(() => {
        console.log('🛑 Server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n⚠️  SIGTERM received - shutting down...');
    server.close(() => {
        console.log('🛑 Server closed');
        process.exit(0);
    });
});

// Catch any uncaught errors
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    process.exit(1);
});
