const readline = require('readline');

const ENDPOINT = 'http://server2.local:8000/v1/chat/completions';
const API_KEY = 'ollama';
const MODEL = 'bigmodel';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function chat() {
  console.log('Chatbot started. Type your message and press Enter. Type "exit" to quit.');

  const messages = [];

  const ask = () => {
    rl.question('> ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        rl.close();
        return;
      }

      messages.push({ role: 'user', content: input });

      process.stdout.write('Sending...');

      try {
        const startTime = Date.now();
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify({
            model: MODEL,
            messages: messages
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          process.stdout.write('\r\x1b[K');
          console.error(`Error: ${response.status} - ${errorText}`);
          messages.pop(); // Remove the failed user message
          ask();
          return;
        }

        const data = await response.json();
        const endTime = Date.now();
        const reply = data.choices[0].message.content;

        process.stdout.write('\r\x1b[K');
        console.log(`Bot: ${reply}\n`);
        messages.push({ role: 'assistant', content: reply });

        const durationSeconds = (endTime - startTime) / 1000;
        const totalChars = messages.reduce((acc, msg) => acc + msg.content.length, 0);
        const lastMsgChars = reply.length;
        const estimatedTokens = Math.ceil(reply.length / 4);
        const tokensPerSecond = durationSeconds > 0 ? (estimatedTokens / durationSeconds).toFixed(2) : 0;

        console.log(`--- Stats ---`);
        console.log(`Total chars in history: ${totalChars}`);
        console.log(`Chars in last message: ${lastMsgChars}`);
        console.log(`Estimated tokens/sec: ${tokensPerSecond}`);
        console.log(`--------------\n`);

      } catch (error) {
        process.stdout.write('\r\x1b[K');
        console.error('Error connecting to the API:', error.message);
        messages.pop(); // Remove the failed user message
      }

      ask();
    });
  };

  ask();
}

chat();
