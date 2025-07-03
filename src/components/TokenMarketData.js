import React, { useState, useEffect } from 'react';
import { blockvisionAPI } from '../utils/blockvision';
import { formatAddress } from '../utils/web3';
import './TokenMarketData.css';

const TokenMarketData = ({ tokenAddress }) => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tokenAddress) {
      loadMarketData();
    }
  }, [tokenAddress]);

  const loadMarketData = async () => {
    if (!tokenAddress) return;

    setLoading(true);
    setError('');

    try {
      const data = await blockvisionAPI.getTokenMarketData(tokenAddress);
      setMarketData(data);
    } catch (error) {
      console.error('Error loading market data:', error);
      setError('Ошибка загрузки рыночных данных');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="market-data">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка рыночных данных...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="market-data">
        <div className="error-container">
          <h4>❌ Ошибка</h4>
          <p>{error}</p>
          <button onClick={loadMarketData} className="retry-button">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="market-data">
        <div className="empty-container">
          <p>Нет рыночных данных</p>
        </div>
      </div>
    );
  }

  return (
    <div className="market-data">
      <div className="market-header">
        <h4>📈 Рыночные данные</h4>
        <button onClick={loadMarketData} className="refresh-button">
          🔄
        </button>
      </div>

      <div className="market-stats">
        <div className="market-stat">
          <div className="stat-label">Цена</div>
          <div className="stat-value">
            {blockvisionAPI.formatUSDValue(marketData.price)}
          </div>
        </div>

        <div className="market-stat">
          <div className="stat-label">Рыночная капитализация</div>
          <div className="stat-value">
            {blockvisionAPI.formatUSDValue(marketData.marketCap)}
          </div>
        </div>

        <div className="market-stat">
          <div className="stat-label">Объём 24ч</div>
          <div className="stat-value">
            {blockvisionAPI.formatUSDValue(marketData.volume24h)}
          </div>
        </div>

        <div className="market-stat">
          <div className="stat-label">Держателей</div>
          <div className="stat-value">
            {marketData.totalHolders?.toLocaleString() || 'N/A'}
          </div>
        </div>
      </div>

      {marketData.symbol && (
        <div className="token-info">
          <div className="token-symbol">{marketData.symbol}</div>
          <div className="token-name">{marketData.name}</div>
          <div className="token-address">{formatAddress(tokenAddress)}</div>
        </div>
      )}
    </div>
  );
};

export default TokenMarketData; 