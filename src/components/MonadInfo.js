import React, { useState, useEffect } from 'react';
import './MonadInfo.css';

const MonadInfo = () => {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      
      // Simulate network data fetch (in real app, this would call Monad RPC)
      const mockData = {
        latestBlock: Math.floor(Math.random() * 1000000) + 5000000,
        totalTransactions: Math.floor(Math.random() * 10000000) + 50000000,
        averageTPS: Math.floor(Math.random() * 5000) + 8000,
        blockTime: '500ms',
        finality: '1s',
        chainId: '10143',
        rpcUrl: 'https://testnet-rpc.monad.xyz'
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNetworkData(mockData);
    } catch (err) {
      setError('Failed to fetch network data');
    } finally {
      setLoading(false);
    }
  };

  const monadFeatures = [
    {
      title: 'MonadBFT',
      description: 'Performant, tail-fork-resistant BFT consensus',
      icon: '🛡️'
    },
    {
      title: 'RaptorCast',
      description: 'Efficient block transmission mechanism',
      icon: '🚀'
    },
    {
      title: 'Asynchronous Execution',
      description: 'Pipelining consensus and execution',
      icon: '⚡'
    },
    {
      title: 'Parallel Execution',
      description: 'Efficient transaction execution',
      icon: '🔄'
    },
    {
      title: 'MonadDb',
      description: 'High-performance state backend',
      icon: '💾'
    }
  ];

  if (loading) {
    return (
      <div className="monad-info">
        <div className="loading">Loading Monad network data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="monad-info">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="monad-info">
      <h2>🚀 Monad Network Overview</h2>
      
      <div className="network-stats">
        <div className="stat-card">
          <h3>Latest Block</h3>
          <div className="stat-value">{networkData.latestBlock.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <h3>Total Transactions</h3>
          <div className="stat-value">{networkData.totalTransactions.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <h3>Average TPS</h3>
          <div className="stat-value">{networkData.averageTPS.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <h3>Block Time</h3>
          <div className="stat-value">{networkData.blockTime}</div>
        </div>
        <div className="stat-card">
          <h3>Finality</h3>
          <div className="stat-value">{networkData.finality}</div>
        </div>
        <div className="stat-card">
          <h3>Chain ID</h3>
          <div className="stat-value">{networkData.chainId}</div>
        </div>
      </div>

      <div className="features-section">
        <h3>🔧 Monad's Five Key Innovations</h3>
        <div className="features-grid">
          {monadFeatures.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="comparison-section">
        <h3>📊 Monad vs Ethereum Comparison</h3>
        <div className="comparison-table">
          <div className="comparison-row header">
            <div>Attribute</div>
            <div>Ethereum</div>
            <div>Monad</div>
          </div>
          <div className="comparison-row">
            <div>Transactions/second</div>
            <div>~10</div>
            <div>~10,000</div>
          </div>
          <div className="comparison-row">
            <div>Block Frequency</div>
            <div>12s</div>
            <div>500ms</div>
          </div>
          <div className="comparison-row">
            <div>Finality</div>
            <div>12-18 min</div>
            <div>1s</div>
          </div>
          <div className="comparison-row">
            <div>Max Contract Size</div>
            <div>24.5 kb</div>
            <div>128 kb</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonadInfo; 