import React, { useState, useEffect } from 'react';
import { blockvisionAPI, blockvisionUtils } from '../utils/blockvision';
import { formatAddress } from '../utils/web3';
import './PortfolioView.css';

const PortfolioView = ({ walletAddress, isConnected }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('tokens');
  const [refreshKey, setRefreshKey] = useState(0);

  // Загрузка портфолио
  const loadPortfolio = async () => {
    if (!isConnected || !walletAddress) return;

    setLoading(true);
    setError('');

    try {
      const data = await blockvisionAPI.getAccountPortfolio(walletAddress);
      setPortfolio(data);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      setError('Ошибка загрузки портфолио. Проверьте API ключ.');
    } finally {
      setLoading(false);
    }
  };

  // Обновление данных
  const refreshPortfolio = () => {
    setRefreshKey(prev => prev + 1);
    blockvisionAPI.clearCache();
    loadPortfolio();
  };

  useEffect(() => {
    loadPortfolio();
  }, [walletAddress, isConnected, refreshKey]);

  if (!isConnected) {
    return (
      <div className="portfolio-view">
        <div className="connect-prompt">
          <h3>🔗 Подключите кошелёк</h3>
          <p>Для просмотра портфолио необходимо подключить MetaMask</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="portfolio-view">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка портфолио...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-view">
        <div className="error-container">
          <h3>❌ Ошибка</h3>
          <p>{error}</p>
          <button onClick={refreshPortfolio} className="retry-button">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="portfolio-view">
        <div className="empty-container">
          <h3>📊 Портфолио</h3>
          <p>Нет данных для отображения</p>
        </div>
      </div>
    );
  }

  const stats = blockvisionUtils.getPortfolioStats(portfolio.tokens);
  const sortedTokens = blockvisionUtils.sortTokensByValue(portfolio.tokens);

  return (
    <div className="portfolio-view">
      <div className="portfolio-header">
        <h3>📊 Портфолио</h3>
        <div className="portfolio-actions">
          <button onClick={refreshPortfolio} className="refresh-button">
            🔄 Обновить
          </button>
        </div>
      </div>

      {/* Статистика портфолио */}
      <div className="portfolio-stats">
        <div className="stat-card">
          <div className="stat-value">{blockvisionAPI.formatUSDValue(stats.totalValue)}</div>
          <div className="stat-label">Общая стоимость</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.tokenCount}</div>
          <div className="stat-label">Токенов</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.nonZeroTokens}</div>
          <div className="stat-label">С балансом</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{portfolio.totalNFTs}</div>
          <div className="stat-label">NFT</div>
        </div>
      </div>

      {/* Табы */}
      <div className="portfolio-tabs">
        <button 
          className={`tab-button ${activeTab === 'tokens' ? 'active' : ''}`}
          onClick={() => setActiveTab('tokens')}
        >
          💰 Токены ({portfolio.tokens.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'nfts' ? 'active' : ''}`}
          onClick={() => setActiveTab('nfts')}
        >
          🖼️ NFT ({portfolio.nfts.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          📈 Активность ({portfolio.recentActivity.length})
        </button>
      </div>

      {/* Контент табов */}
      <div className="tab-content">
        {activeTab === 'tokens' && (
          <div className="tokens-tab">
            {sortedTokens.length === 0 ? (
              <div className="empty-state">
                <p>Нет токенов в портфолио</p>
              </div>
            ) : (
              <div className="tokens-list">
                {sortedTokens.map((token, index) => (
                  <div key={index} className="token-item">
                    <div className="token-info">
                      <div className="token-symbol">{token.symbol || 'Unknown'}</div>
                      <div className="token-name">{token.name || 'Unknown Token'}</div>
                      <div className="token-address">{formatAddress(token.address)}</div>
                    </div>
                    <div className="token-balance">
                      <div className="balance-amount">
                        {blockvisionAPI.formatTokenBalance(token.balance, token.decimals)}
                      </div>
                      <div className="balance-value">
                        {blockvisionAPI.formatUSDValue(token.usdValue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'nfts' && (
          <div className="nfts-tab">
            {portfolio.nfts.length === 0 ? (
              <div className="empty-state">
                <p>Нет NFT в портфолио</p>
              </div>
            ) : (
              <div className="nfts-grid">
                {portfolio.nfts.map((nft, index) => (
                  <div key={index} className="nft-item">
                    <div className="nft-image">
                      {nft.image ? (
                        <img src={nft.image} alt={nft.name} />
                      ) : (
                        <div className="nft-placeholder">🖼️</div>
                      )}
                    </div>
                    <div className="nft-info">
                      <div className="nft-name">{nft.name || 'Unknown NFT'}</div>
                      <div className="nft-collection">{nft.collection || 'Unknown Collection'}</div>
                      <div className="nft-token-id">ID: {nft.tokenId}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-tab">
            {portfolio.recentActivity.length === 0 ? (
              <div className="empty-state">
                <p>Нет активности</p>
              </div>
            ) : (
              <div className="activity-list">
                {portfolio.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'transfer' ? '🔄' : 
                       activity.type === 'swap' ? '💱' : 
                       activity.type === 'mint' ? '🎨' : '📝'}
                    </div>
                    <div className="activity-info">
                      <div className="activity-type">{activity.type || 'Unknown'}</div>
                      <div className="activity-description">
                        {activity.description || 'No description'}
                      </div>
                      <div className="activity-date">
                        {blockvisionAPI.formatDate(activity.timestamp)}
                      </div>
                    </div>
                    <div className="activity-value">
                      {activity.value && blockvisionAPI.formatUSDValue(activity.value)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Информация о кошельке */}
      <div className="wallet-info">
        <div className="wallet-address">
          <span>Кошелёк: {formatAddress(walletAddress)}</span>
        </div>
        <div className="api-info">
          <span>BlockVision API</span>
          <span>Кэш: {blockvisionAPI.getCacheStats().size} записей</span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioView; 