# Ollama Setup for Rocket AI Chat

## Prerequisites

1. **Install Ollama**: https://ollama.com/download
2. **Pull the Llama3 model**:
   ```bash
   ollama pull llama3
   ```

## Running Ollama

Start Ollama server before running the app:
```bash
ollama serve
```

Verify it's running:
```bash
curl http://localhost:11434/api/tags
```

## Testing the Chat

Send a test message:
```bash
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model": "llama3", "prompt": "Hello", "stream": false}'
```

## Troubleshooting

- **Connection refused**: Ensure `ollama serve` is running
- **Model not found**: Run `ollama pull llama3`
- **Slow responses**: The first request loads the model into memory (may take 10-30s)