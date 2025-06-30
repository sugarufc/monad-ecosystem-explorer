import React, { useState } from 'react';
import './SwapInterface.css';

const SwapInterface = ({ isConnected, walletAddress }) => {
  const [fromToken, setFromToken] = useState('MONAD');
  const [toToken, setToToken] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState('0');

  const tokens = [
    { symbol: 'MONAD', name: 'Monad', icon: '🚀' },
    { symbol: 'ETH', name: 'Ethereum', icon: '🔷' },
    { symbol: 'USDC', name: 'USD Coin', icon: '💵' },
    { symbol: 'USDT', name: 'Tether', icon: '💲' }
  ];

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    
    // Simulate price calculation (in real app, this would call DEX API)
    if (value && !isNaN(value)) {
      const rate = 0.001; // Mock exchange rate
      setEstimatedAmount((parseFloat(value) * rate).toFixed(6));
    } else {
      setEstimatedAmount('0');
    }
  };

  const handleSwap = () => {
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount!');
      return;
    }

    // This is a demo - no actual swap will be executed
    alert('This is a demo interface. In a real application, this would execute a swap transaction on Monad network.');
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount('');
    setEstimatedAmount('0');
  };

  return (
    <div className="swap-interface">
      <div className="swap-header">
        <h3>🔄 Token Swap Interface</h3>
        <p>Safe demo interface for Monad ecosystem</p>
      </div>

      {!isConnected ? (
        <div className="connect-prompt">
          <div className="prompt-card">
            <h4>🔗 Connect Wallet Required</h4>
            <p>Please connect your wallet to use the swap interface</p>
            <div className="wallet-info">
              <span>Status: Not Connected</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="swap-container">
          <div className="wallet-status">
            <span>✅ Connected: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</span>
          </div>

          <div className="swap-card">
            <div className="swap-input">
              <div className="input-header">
                <span>From</span>
                <span>Balance: 1000 MONAD</span>
              </div>
              <div className="input-container">
                <input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.0"
                  min="0"
                  step="0.000001"
                />
                <div className="token-selector">
                  <span className="token-icon">
                    {tokens.find(t => t.symbol === fromToken)?.icon}
                  </span>
                  <span className="token-symbol">{fromToken}</span>
                </div>
              </div>
            </div>

            <div className="swap-arrow" onClick={switchTokens}>
              <span>↓</span>
            </div>

            <div className="swap-input">
              <div className="input-header">
                <span>To</span>
                <span>Balance: 0.5 ETH</span>
              </div>
              <div className="input-container">
                <input
                  type="number"
                  value={estimatedAmount}
                  readOnly
                  placeholder="0.0"
                />
                <div className="token-selector">
                  <span className="token-icon">
                    {tokens.find(t => t.symbol === toToken)?.icon}
                  </span>
                  <span className="token-symbol">{toToken}</span>
                </div>
              </div>
            </div>

            <div className="swap-info">
              <div className="info-row">
                <span>Exchange Rate:</span>
                <span>1 {fromToken} = 0.001 {toToken}</span>
              </div>
              <div className="info-row">
                <span>Network Fee:</span>
                <span>~0.0001 MONAD</span>
              </div>
              <div className="info-row">
                <span>Slippage:</span>
                <span>0.5%</span>
              </div>
            </div>

            <button 
              className="swap-button"
              onClick={handleSwap}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              Swap {fromToken} for {toToken}
            </button>

            <div className="swap-disclaimer">
              <p>⚠️ This is a demo interface. No actual transactions will be executed.</p>
              <p>Real swaps would require proper DEX integration and transaction signing.</p>
            </div>
          </div>

          <div className="available-tokens">
            <h4>Available Tokens on Monad</h4>
            <div className="token-list">
              {tokens.map((token, index) => (
                <div key={index} className="token-item">
                  <span className="token-icon">{token.icon}</span>
                  <span className="token-name">{token.name}</span>
                  <span className="token-symbol">({token.symbol})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapInterface; 