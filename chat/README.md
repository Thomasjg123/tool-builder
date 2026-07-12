# Chatbot

This is a simple chatbot that uses the `bigmodel` endpoint.

## How to run

To run this chatbot as a long-running program, follow these steps:

1. **Check if a session named 'chatbot' is already running:**
   ```bash
   tmux ls
   ```

2. **Create a new detached tmux session:**
   ```bash
   tmux new-session -d -s chatbot
   ```

3. **Send the command to the session:**
   ```bash
   tmux send-keys -t chatbot "node chatbot.js" Enter
   ```

4. **To interact with the bot, use `tmux send-keys` to type messages and `tmux capture-pane` to see the output:**

   - **To send a message:**
     ```bash
     tmux send-keys -t chatbot "your message here" Enter
     ```

   - **To view the recent chat history/output (last 10 lines):**
     ```bash
     tmux capture-pane -p -t chatbot -S -10 | sed '/^$/d'
     ```

5. **To stop the bot, send Ctrl+C:**
   ```bash
   tmux send-keys -t chatbot C-c
   ```
