import React, { useState, useEffect } from 'react';
import './App.css';
import WalletConnect from './components/WalletConnect';
import MonadInfo from './components/MonadInfo';
import SwapInterface from './components/SwapInterface';
import PortfolioView from './components/PortfolioView';
import ChatBot from './components/ChatBot';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const handleWalletConnect = (address) => {
    setWalletAddress(address);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setWalletAddress('');
    setIsConnected(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 Monad Ecosystem Explorer</h1>
        <p>High-performance Ethereum-compatible L1 blockchain explorer</p>
      </header>

      <div className="container">
        <WalletConnect 
          isConnected={isConnected}
          walletAddress={walletAddress}
          onConnect={handleWalletConnect}
          onDisconnect={handleDisconnect}
        />

        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            📊 Network Info
          </button>
          <button 
            className={`tab-button ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            💼 Portfolio
          </button>
          <button 
            className={`tab-button ${activeTab === 'swap' ? 'active' : ''}`}
            onClick={() => setActiveTab('swap')}
          >
            🔄 Swap Interface
          </button>
          <button 
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            🤖 AI Assistant
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'info' && <MonadInfo />}
          {activeTab === 'portfolio' && <PortfolioView isConnected={isConnected} walletAddress={walletAddress} />}
          {activeTab === 'swap' && <SwapInterface isConnected={isConnected} walletAddress={walletAddress} />}
          {activeTab === 'chat' && <ChatBot />}
        </div>
      </div>
    </div>
  );
}

export default App; 