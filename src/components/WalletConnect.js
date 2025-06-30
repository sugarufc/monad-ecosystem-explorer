import React, { useState } from 'react';
import './WalletConnect.css';

const WalletConnect = ({ isConnected, walletAddress, onConnect, onDisconnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');

    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        
        // Switch to Monad testnet if needed
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x279F' }], // Monad testnet chain ID
          });
        } catch (switchError) {
          // If Monad testnet is not added, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x279F',
                chainName: 'Monad Testnet',
                nativeCurrency: {
                  name: 'MONAD',
                  symbol: 'MONAD',
                  decimals: 18
                },
                rpcUrls: ['https://testnet-rpc.monad.xyz'],
                blockExplorerUrls: ['https://explorer.testnet.monad.xyz']
              }]
            });
          }
        }

        onConnect(address);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    onDisconnect();
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-connect">
      {!isConnected ? (
        <div className="wallet-card">
          <h3>🔗 Connect Wallet</h3>
          <p>Connect your wallet to view Monad network data</p>
          <button 
            className="connect-button"
            onClick={connectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>
      ) : (
        <div className="wallet-card connected">
          <h3>✅ Wallet Connected</h3>
          <p>Address: <span className="address">{formatAddress(walletAddress)}</span></p>
          <button 
            className="disconnect-button"
            onClick={disconnectWallet}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 