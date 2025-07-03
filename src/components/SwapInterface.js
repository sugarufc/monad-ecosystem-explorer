import React, { useState, useEffect } from 'react';
import './SwapInterface.css';
import { swapManager, swapUtils } from '../utils/swap';
import { TOKENS, formatAddress } from '../utils/web3';
import { blockvisionAPI } from '../utils/blockvision';

const SwapInterface = ({ isConnected, walletAddress }) => {
  const [fromToken, setFromToken] = useState('MONAD');
  const [toToken, setToToken] = useState('WETH');
  const [amount, setAmount] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenBalances, setTokenBalances] = useState({});
  const [slippage, setSlippage] = useState(0.5);
  const [isApprovalNeeded, setIsApprovalNeeded] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const tokens = Object.values(TOKENS);

  // Загрузка балансов токенов
  useEffect(() => {
    if (isConnected && walletAddress) {
      loadTokenBalances();
    }
  }, [isConnected, walletAddress]);

  // Получение балансов токенов
  const loadTokenBalances = async () => {
    try {
      // Пробуем получить данные из BlockVision API
      if (process.env.REACT_APP_BLOCKVISION_API_KEY) {
        const accountTokens = await blockvisionAPI.getAccountTokens(walletAddress);
        const realBalances = {};
        
        if (accountTokens.data) {
          accountTokens.data.forEach(token => {
            realBalances[token.symbol] = {
              symbol: token.symbol,
              balance: blockvisionAPI.formatTokenBalance(token.balance, token.decimals),
              decimals: token.decimals,
              icon: token.symbol === 'MONAD' ? '🚀' : 
                    token.symbol === 'WETH' ? '🔷' : 
                    token.symbol === 'USDC' ? '💵' : '💲',
              usdValue: token.usdValue
            };
          });
        }
        
        setTokenBalances(realBalances);
      } else {
        // Fallback на демо данные
        const balances = await swapManager.getTokenBalances(walletAddress);
        setTokenBalances(balances);
      }
    } catch (error) {
      console.error('Ошибка загрузки балансов:', error);
      // Fallback на демо данные при ошибке
      const balances = await swapManager.getTokenBalances(walletAddress);
      setTokenBalances(balances);
    }
  };

  // Получение оценки свапа
  const getSwapEstimate = async (fromTokenSymbol, toTokenSymbol, amount) => {
    if (!amount || parseFloat(amount) <= 0) {
      setEstimatedAmount('0');
      return;
    }

    try {
      const fromToken = TOKENS[fromTokenSymbol];
      const toToken = TOKENS[toTokenSymbol];
      
      if (!fromToken || !toToken) {
        setEstimatedAmount('0');
        return;
      }

      const estimate = await swapManager.getSwapEstimate(fromToken, toToken, amount);
      setEstimatedAmount(estimate.amountOut);
      setError('');
    } catch (error) {
      console.error('Ошибка получения оценки:', error);
      setEstimatedAmount('0');
      setError('Не удалось получить оценку свапа');
    }
  };

  const handleAmountChange = async (e) => {
    const value = e.target.value;
    setAmount(value);
    setError('');
    setSuccess('');
    
    if (value && !isNaN(value) && parseFloat(value) > 0) {
      await getSwapEstimate(fromToken, toToken, value);
      
      // Проверяем необходимость approval
      try {
        const fromTokenObj = TOKENS[fromToken];
        const needsApproval = await swapManager.checkApprovalNeeded(fromTokenObj, value);
        setIsApprovalNeeded(needsApproval);
      } catch (error) {
        console.error('Ошибка проверки approval:', error);
      }
    } else {
      setEstimatedAmount('0');
      setIsApprovalNeeded(false);
    }
  };

  // Выполнение approval
  const handleApproval = async () => {
    if (!isConnected || !amount) return;
    
    setIsApproving(true);
    setError('');
    
    try {
      const fromTokenObj = TOKENS[fromToken];
      const result = await swapManager.executeApproval(fromTokenObj, amount);
      
      if (result.success) {
        setSuccess('Токены утверждены успешно!');
        setIsApprovalNeeded(false);
        await loadTokenBalances(); // Обновляем балансы
      }
    } catch (error) {
      console.error('Ошибка approval:', error);
      setError(error.message || 'Ошибка утверждения токенов');
    } finally {
      setIsApproving(false);
    }
  };

  const handleSwap = async () => {
    if (!isConnected) {
      setError('Пожалуйста, подключите кошелек!');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Введите корректную сумму!');
      return;
    }

    // Валидация баланса
    const balance = tokenBalances[fromToken]?.balance || '0';
    const validation = swapUtils.validateSwapAmount(amount, balance);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const fromTokenObj = TOKENS[fromToken];
      const toTokenObj = TOKENS[toToken];
      
      const result = await swapManager.executeTokenSwap(fromTokenObj, toTokenObj, amount, slippage);
      
      if (result.success) {
        setSuccess(`Свап выполнен успешно! Hash: ${formatAddress(result.transactionHash)}`);
        setAmount('');
        setEstimatedAmount('0');
        await loadTokenBalances(); // Обновляем балансы
      }
    } catch (error) {
      console.error('Ошибка свапа:', error);
      setError(error.message || 'Ошибка выполнения свапа');
    } finally {
      setIsLoading(false);
    }
  };

  const switchTokens = async () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount('');
    setEstimatedAmount('0');
    setError('');
    setSuccess('');
    setIsApprovalNeeded(false);
    
    // Пересчитываем оценку если есть сумма
    if (amount && parseFloat(amount) > 0) {
      await getSwapEstimate(toToken, fromToken, amount);
    }
  };

  return (
    <div className="swap-interface">
      <div className="swap-header">
        <h3>🔄 Real Token Swap Interface</h3>
        <p>Secure DEX integration for Monad ecosystem</p>
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
            <span>✅ Connected: {formatAddress(walletAddress)}</span>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="error-message">
              <span>❌ {error}</span>
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <span>✅ {success}</span>
            </div>
          )}

                      <div className="swap-card">
              <div className="swap-input">
                <div className="input-header">
                  <span>From</span>
                  <span>Balance: {tokenBalances[fromToken]?.balance || '0'} {fromToken}</span>
                </div>
                <div className="input-container">
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.0"
                    min="0"
                    step="0.000001"
                    disabled={isLoading}
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
                  <span>Balance: {tokenBalances[toToken]?.balance || '0'} {toToken}</span>
                </div>
                <div className="input-container">
                  <input
                    type="number"
                    value={estimatedAmount}
                    readOnly
                    placeholder="0.0"
                    disabled={isLoading}
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
                <span>1 {fromToken} = {amount && estimatedAmount && parseFloat(amount) > 0 ? (parseFloat(estimatedAmount) / parseFloat(amount)).toFixed(6) : '0'} {toToken}</span>
              </div>
              <div className="info-row">
                <span>Network Fee:</span>
                <span>~0.0001 MONAD</span>
              </div>
              <div className="info-row">
                <span>Slippage:</span>
                <div className="slippage-control">
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={slippage}
                    onChange={(e) => setSlippage(parseFloat(e.target.value))}
                    disabled={isLoading}
                  />
                  <span>{slippage}%</span>
                </div>
              </div>
            </div>

            {/* Approval Button */}
            {isApprovalNeeded && (
              <button 
                className="approval-button"
                onClick={handleApproval}
                disabled={isApproving || isLoading}
              >
                {isApproving ? 'Утверждение...' : `Утвердить ${fromToken}`}
              </button>
            )}

            <button 
              className="swap-button"
              onClick={handleSwap}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading || isApprovalNeeded}
            >
              {isLoading ? 'Выполнение свапа...' : `Swap ${fromToken} for ${toToken}`}
            </button>

            <div className="swap-disclaimer">
              <p>⚠️ Real DEX integration - transactions will be executed on Monad network.</p>
              <p>Make sure you have sufficient balance and gas fees before swapping.</p>
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