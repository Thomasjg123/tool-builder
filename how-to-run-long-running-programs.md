# How to Run Long-Running Programs

When running long-running tasks (like web servers, background workers, or scrapers), it is best practice to run them inside a `tmux` session. This ensures that the process continues running even if your current terminal session is closed or disconnected.

## 1. Checking for Running Sessions

Before starting a new session, always check if a session with the same name is already running to avoid conflicts:

```bash
tmux ls
```

If a session with the intended name already exists, check its status. If it is running an old process, it is preferable to stop it using `C-c` via `tmux send-keys -t <session-name> C-c` before starting the new program.

## 2. Starting a Long-Running Task

To start a new session in the background and run a command inside it:

1. **Create a new detached session:**
   ```bash
   tmux new-session -d -s <session-name>
   ```

2. **Send the command to the session:**
   ```bash
   tmux send-keys -t <session-name> "your-command-here" Enter
   ```

### Example: Running the Web Server
To run the web server in the background:
```bash
tmux new-session -d -s webserver
tmux send-keys -t webserver "node server/server.js" Enter
```

## 3. Sending Keys

You can interact with a running session without attaching to it using `tmux send-keys`.

### Common Keys
- **Enter/Newline:** `Enter`
- **Interrupt (Ctrl+C):** `C-c`
- **Escape:** `Esc`
- **Tab:** `Tab`

### Examples
**Stop a running process (Send Ctrl+C):**
```bash
tmux send-keys -t <session-name> C-c
```

**Run another command in the same session:**
```bash
tmux send-keys -t <session-name> "ls -la" Enter
```

## 4. Reading Output

To see the output of a running program without attaching to the session, use `tmux capture-pane`.

**To view the last 10 lines of output (filtering out empty lines):**
```bash
tmux capture-pane -p -t <session-name> -S -10 | sed '/^$/d'
```
