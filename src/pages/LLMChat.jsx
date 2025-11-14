import React, { useState, useEffect, useRef } from 'react';

const LLMChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m an AI assistant powered by a locally deployed open-source SLM/LLM. I can help you with various tasks. Feel free to ask me anything!',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [error, setError] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const messagesEndRef = useRef(null);

  const BACKEND_URL = 'api.thepk.in'; // Change to your backend URL
  const API_KEY = 'your-secure-api-key-change-this-in-production';

  // Fetch available models on mount
  useEffect(() => {
    const initializeChat = async () => {
      await checkBackendHealth();
      await fetchModels();
    };
    initializeChat();
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Backend service is not available');
      }

      console.log('Backend health check: OK');
    } catch (err) {
      console.warn('Backend health check failed:', err.message);
      setError('Warning: Backend service may not be available. Check your BACKEND_URL.');
    }
  };

  const fetchModels = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/llm/models`, {
        method: 'GET',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to fetch models: ${response.status} ${JSON.stringify(errorData.detail || '')}`);
      }

      const data = await response.json();

      // Validate response structure according to ModelsResponse schema
      if (!data.models || !Array.isArray(data.models)) {
        throw new Error('Invalid models response format');
      }

      if (data.models.length === 0) {
        throw new Error('No models available on backend. Please ensure Ollama is running with Llama 3.2 model.');
      }

      setModels(data.models);
      setSelectedModel(data.models[0].name);
      setError(''); // Clear any previous errors
    } catch (err) {
      setError('Failed to load models: ' + err.message);
      console.error('Error fetching models:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedModel || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError('');

    try {
      if (isStreaming) {
        await handleStreamingResponse(userMessage.id);
      } else {
        await handleNonStreamingResponse(userMessage.id);
      }
    } catch (err) {
      setError('Error: ' + err.message);
      setMessages(prev => [...prev, {
        id: messages.length + 2,
        role: 'assistant',
        content: `Error: ${err.message}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamingResponse = async (messageId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/llm/stream`, {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: inputValue,
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData || 'Stream request failed'}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      const assistantMessage = {
        id: messageId + 1,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Process any remaining buffer content
          if (buffer.trim()) {
            const lines = buffer.split('\n');
            for (const line of lines) {
              processStreamLine(line, (text) => {
                fullText += text;
                setMessages(prev =>
                  prev.map(msg => msg.id === assistantMessage.id ? { ...msg, content: fullText } : msg)
                );
              });
            }
          }
          break;
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Process all complete lines, keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          processStreamLine(line, (text) => {
            fullText += text;
            setMessages(prev =>
              prev.map(msg => msg.id === assistantMessage.id ? { ...msg, content: fullText } : msg)
            );
          });
        }
      }

      // Final decoder flush
      const finalChunk = decoder.decode();
      if (finalChunk) {
        buffer += finalChunk;
        const lines = buffer.split('\n');
        for (const line of lines) {
          processStreamLine(line, (text) => {
            fullText += text;
            setMessages(prev =>
              prev.map(msg => msg.id === assistantMessage.id ? { ...msg, content: fullText } : msg)
            );
          });
        }
      }
    } catch (err) {
      throw err;
    }
  };

  const processStreamLine = (line, onText) => {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith(':')) return;

    // Handle SSE format: "data: {json}"
    if (trimmedLine.startsWith('data: ')) {
      try {
        const jsonStr = trimmedLine.slice(6);
        const data = JSON.parse(jsonStr);

        // Check for completion signal
        if (data.done === true) {
          console.log('Stream completed');
          return;
        }

        // Extract text from response
        if (data.text) {
          onText(data.text);
        } else if (typeof data === 'string') {
          // Handle case where the entire object is the text
          onText(data);
        }
      } catch (e) {
        console.warn('Failed to parse stream line:', line, e);
      }
    }
  };

  const handleNonStreamingResponse = async (messageId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/llm/generate`, {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: inputValue,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData || 'Generate request failed'}`);
      }

      const data = await response.json();
      console.log('Non-streaming response:', data);

      // Handle various possible response formats from the backend
      let responseText = '';

      if (typeof data === 'string') {
        // If response is a plain string
        responseText = data;
      } else if (data.text) {
        // If response has 'text' field
        responseText = data.text;
      } else if (data.response) {
        // If response has 'response' field
        responseText = data.response;
      } else if (data.generated_text) {
        // If response has 'generated_text' field
        responseText = data.generated_text;
      } else if (data.content) {
        // If response has 'content' field
        responseText = data.content;
      } else if (Object.keys(data).length > 0) {
        // If response is a complex object, try to find the first string value
        const firstStringValue = Object.values(data).find(v => typeof v === 'string');
        responseText = firstStringValue || JSON.stringify(data);
      } else {
        // Fallback
        responseText = 'No response received from model';
      }

      if (!responseText || responseText.trim() === '') {
        throw new Error('Received empty response from model');
      }

      const assistantMessage = {
        id: messageId + 1,
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="llm-chat-page">
      <header className="chat-header">
        <h1>AI Chat (SLM/LLM)</h1>
        <p>Chat with a locally deployed SLM model • Showcasing MLOps capabilities</p>
      </header>

      <div className="chat-container">
        <div className="chat-sidebar">
          <div className="model-selector">
            <label htmlFor="model-select">Model:</label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="model-select"
            >
              {models.map(model => (
                <option key={model.name} value={model.name}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <div className="streaming-toggle">
            <label>
              <input
                type="checkbox"
                checked={isStreaming}
                onChange={(e) => setIsStreaming(e.target.checked)}
              />
              <span>Streaming Response</span>
            </label>
          </div>

          <div className="chat-info">
            <h3>About This Demo</h3>
            <p><strong>MLOps Skills:</strong> This chat demonstrates my ability to deploy, serve, and optimize SLM/LLMs in production environments.</p>
            <ul>
              <li>Model serving & inference optimization</li>
              <li>Streaming & non-streaming responses</li>
              <li>API authentication & security</li>
              <li>Error handling & resilience</li>
            </ul>

            <h3 style={{marginTop: '1.5rem'}}>Hardware</h3>
            <p><strong>Running on:</strong> AZW MINI S Mini PC</p>
            <ul style={{fontSize: '0.8rem'}}>
              <li><strong>CPU:</strong> Intel N150 (4 cores, 3.6 GHz)</li>
              <li><strong>RAM:</strong> 16GB DDR4 3200MHz</li>
              <li><strong>Cache:</strong> 6MB L3 Cache</li>
              <li><strong>Storage:</strong> 512GB SSD</li>
            </ul>
            <p style={{fontSize: '0.8rem', marginTop: '0.8rem', opacity: 0.8}}>Showcasing efficient LLM deployment on compact, power-efficient hardware</p>
          </div>
        </div>

        <div className="chat-main">
          {error && (
            <div className="error-banner">
              <p>{error}</p>
              <button onClick={() => setError('')}>×</button>
            </div>
          )}

          <div className="messages-container">
            {messages.map(message => (
              <div key={message.id} className={`message message-${message.role}`}>
                <div className="message-content">
                  <p>{message.content}</p>
                </div>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="message message-loading">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="chat-input-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="chat-input"
              disabled={isLoading || models.length === 0}
            />
            <button
              type="submit"
              className="send-button"
              disabled={isLoading || !inputValue.trim() || models.length === 0}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LLMChat;
