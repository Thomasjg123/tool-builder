const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const validate = (req, res, next) => {
    const name = req.params.name || req.body.name;
    if (!name || typeof name !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(name)) {
        return res.status(400).json({ error: 'Invalid session name' });
    }
    req.sessionName = name;
    next();
};

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.get('/api/sessions', (req, res) => {
    exec('tmux ls', (err, stdout) => {
        const sessions = (err) ? [] : stdout.trim().split('\n').map(l => l.match(/^([^:]+):/)?.[1]).filter(Boolean);
        res.json({ sessions });
    });
});

app.get('/api/session/output/:name', validate, (req, res) => {
    exec(`tmux capture-pane -p -t ${req.sessionName} -S -10 | sed '/^$/d'`, (err, stdout, stderr) => {
        err ? res.status(500).json({ error: stderr || err.message }) : res.json({ output: stdout });
    });
});

app.get('/api/session/size/:name', validate, (req, res) => {
    exec(`tmux list-panes -t ${req.sessionName} -F "#{window_width} #{window_height}"`, (err, stdout, stderr) => {
        if (err) return res.status(500).json({ error: stderr || err.message });
        const [width, height] = stdout.trim().split(' ').map(Number);
        res.json({ width, height });
    });
});

app.post('/api/session', validate, (req, res) => {
    exec(`tmux new-session -d -s ${req.sessionName}`, (err, stdout, stderr) => {
        err ? res.status(500).json({ error: stderr || err.message }) : res.json({ message: `Session ${req.sessionName} created` });
    });
});

app.post('/api/session/:name/send', validate, (req, res) => {
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'No key provided' });
    
    const command = `tmux send-keys -t ${req.sessionName} ${key}`;
    
    exec(command, (err, stdout, stderr) => {
        err ? res.status(500).json({ error: stderr || err.message }) : res.json({ message: 'Key sent' });
    });
});

const server = app.listen(PORT, '0.0.0.0', () => console.log(`✅ Server on http://0.0.0.0:${PORT}`));

const shutdown = (sig) => {
    console.log(`\n⚠️  ${sig} received - shutting down...`);
    server.close(() => { console.log('🛑 Server closed'); process.exit(0); });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', (err) => { console.error('💥 Uncaught Exception:', err); process.exit(1); });
