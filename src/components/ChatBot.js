import React, { useState } from 'react';
import './ChatBot.css';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your Monad AI assistant. I can help you with information about the Monad ecosystem, development tools, and network features. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Knowledge base about Monad
  const monadKnowledge = {
    'performance': {
      keywords: ['tps', 'transactions', 'speed', 'performance', 'throughput'],
      response: 'Monad achieves over 10,000 transactions per second (TPS) compared to Ethereum\'s ~10 TPS. This is achieved through five key innovations: MonadBFT consensus, RaptorCast block transmission, Asynchronous Execution, Parallel Execution, and MonadDb storage.'
    },
    'consensus': {
      keywords: ['consensus', 'monadbft', 'bft', 'block time'],
      response: 'Monad uses MonadBFT, a performant, tail-fork-resistant BFT consensus mechanism. Block time is 500ms with 1-second finality, compared to Ethereum\'s 12-second blocks and 12-18 minute finality.'
    },
    'development': {
      keywords: ['develop', 'foundry', 'hardhat', 'scaffold', 'tools'],
      response: 'Monad supports all Ethereum development tools. Key templates: foundry-monad (Foundry template), scaffold-eth-monad (Scaffold ETH), and monad-mcp-tutorial (MCP server). You can deploy contracts using Foundry, Hardhat, or Remix with full EVM compatibility.'
    },
    'contracts': {
      keywords: ['contract', 'size', 'evm', 'bytecode'],
      response: 'Monad supports all EVM opcodes and precompiles from the Cancun fork. Maximum contract size is 128kb (vs 24.5kb in Ethereum). All existing Ethereum smart contracts work without modification.'
    },
    'testnet': {
      keywords: ['testnet', 'faucet', 'explorer', 'rpc'],
      response: 'Monad testnet is live! RPC URL: https://testnet-rpc.monad.xyz, Chain ID: 10143. You can get testnet funds from the faucet and explore transactions on the block explorer.'
    },
    'ecosystem': {
      keywords: ['ecosystem', 'projects', 'github', 'community'],
      response: 'The Monad ecosystem includes projects like 2048-contracts (on-chain game), kuru-terminal (orderbook indexing), and various development templates. Join the community on Discord and GitHub for the latest updates.'
    },
    'wallet': {
      keywords: ['wallet', 'metamask', 'phantom', 'connect'],
      response: 'Monad is fully compatible with standard Ethereum wallets like MetaMask and Phantom. Just add the network with Chain ID 10143 and RPC URL https://testnet-rpc.monad.xyz.'
    },
    'gas': {
      keywords: ['gas', 'fees', 'pricing', 'eip-1559'],
      response: 'Monad is EIP-1559 compatible with base fee and priority fee. In testnet, base fee is hard-coded to 50 gwei. Transactions are charged based on gas limit rather than gas usage for DOS prevention.'
    }
  };

  const findResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [key, data] of Object.entries(monadKnowledge)) {
      if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return data.response;
      }
    }
    
    return 'I\'m here to help with Monad-related questions! You can ask me about performance, development tools, consensus, smart contracts, testnet, ecosystem, wallets, or gas fees. What specific aspect of Monad would you like to learn about?';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    const userMsg = {
      id: messages.length + 1,
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = findResponse(userMessage);
      const botMsg = {
        id: messages.length + 2,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chatbot">
      <div className="chat-header">
        <h3>🤖 Monad AI Assistant</h3>
        <p>Ask me anything about Monad ecosystem!</p>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-time">
              {formatTime(message.timestamp)}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message bot">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about Monad performance, development, testnet..."
          disabled={isTyping}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isTyping}
        >
          Send
        </button>
      </div>

      <div className="chat-suggestions">
        <p>Quick questions:</p>
        <div className="suggestion-chips">
          <button onClick={() => setInputValue('How fast is Monad?')}>
            How fast is Monad?
          </button>
          <button onClick={() => setInputValue('How to deploy contracts?')}>
            How to deploy contracts?
          </button>
          <button onClick={() => setInputValue('What is MonadBFT?')}>
            What is MonadBFT?
          </button>
          <button onClick={() => setInputValue('How to connect wallet?')}>
            How to connect wallet?
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot; 