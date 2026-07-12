const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/sessions', (req, res) => {
    exec('tmux ls', (error, stdout, stderr) => {
        if (error) {
            // tmux ls returns error if no sessions are running
            // In many versions, if no sessions exist, it returns 1 and some stderr
            return res.json({ sessions: [] });
        }
        res.json({ sessions: stdout });
    });
});

app.post('/api/session', (req, res) => {
    const sessionName = req.body.name;
    if (!sessionName || typeof sessionName !== 'string') {
        return res.status(400).json({ error: 'Invalid session name' });
    }

    // Sanitize sessionName to prevent command injection
    if (!/^[a-zA-Z0-9_-]+$/.test(sessionName)) {
        return res.status(400).json({ error: 'Invalid session name. Use only alphanumeric, underscores, or hyphens.' });
    }

    exec(`tmux new-session -d -s ${sessionName}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: stderr || error.message });
        }
        res.json({ message: `Session ${sessionName} created successfully` });
    });
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
