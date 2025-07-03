import { ethers } from 'ethers';

// Monad Network Configuration
export const MONAD_CONFIG = {
  chainId: 1337, // Monad testnet chain ID
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MONAD',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.monad.xyz'],
  blockExplorerUrls: ['https://explorer.monad.xyz'],
};

// DEX Contract Addresses (нужно заменить на реальные)
export const DEX_CONTRACTS = {
  uniswapV2Factory: '0x0000000000000000000000000000000000000000', // Заменить на реальный
  uniswapV2Router: '0x0000000000000000000000000000000000000000',   // Заменить на реальный
  sushiswapFactory: '0x0000000000000000000000000000000000000000',  // Заменить на реальный
  sushiswapRouter: '0x0000000000000000000000000000000000000000',   // Заменить на реальный
};

// Token Addresses (нужно заменить на реальные)
export const TOKENS = {
  MONAD: {
    address: '0x0000000000000000000000000000000000000000', // Нативный токен
    symbol: 'MONAD',
    decimals: 18,
    name: 'Monad',
    icon: '🚀'
  },
  WETH: {
    address: '0x0000000000000000000000000000000000000000', // Wrapped ETH
    symbol: 'WETH',
    decimals: 18,
    name: 'Wrapped Ether',
    icon: '🔷'
  },
  USDC: {
    address: '0x0000000000000000000000000000000000000000', // USDC
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin',
    icon: '💵'
  },
  USDT: {
    address: '0x0000000000000000000000000000000000000000', // USDT
    symbol: 'USDT',
    decimals: 6,
    name: 'Tether',
    icon: '💲'
  }
};

// ERC20 Token ABI (минимальный набор для свапов)
export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  }
];

// Uniswap V2 Router ABI (основные функции для свапов)
export const UNISWAP_V2_ROUTER_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
      {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
      {"internalType": "address[]", "name": "path", "type": "address[]"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "deadline", "type": "uint256"}
    ],
    "name": "swapExactTokensForTokens",
    "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
      {"internalType": "address[]", "name": "path", "type": "address[]"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "deadline", "type": "uint256"}
    ],
    "name": "swapExactETHForTokens",
    "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
      {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
      {"internalType": "address[]", "name": "path", "type": "address[]"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "deadline", "type": "uint256"}
    ],
    "name": "swapExactTokensForETH",
    "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
      {"internalType": "address[]", "name": "path", "type": "address[]"}
    ],
    "name": "getAmountsOut",
    "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Получение провайдера
export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  // Fallback на публичный RPC
  return new ethers.JsonRpcProvider(MONAD_CONFIG.rpcUrls[0]);
};

// Получение подписчика
export const getSigner = async () => {
  const provider = getProvider();
  if (provider instanceof ethers.BrowserProvider) {
    return await provider.getSigner();
  }
  throw new Error('MetaMask не подключен');
};

// Получение контракта
export const getContract = (address, abi) => {
  const provider = getProvider();
  return new ethers.Contract(address, abi, provider);
};

// Получение контракта с подписчиком
export const getContractWithSigner = async (address, abi) => {
  const signer = await getSigner();
  return new ethers.Contract(address, abi, signer);
};

// Подключение к Monad сети
export const switchToMonadNetwork = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask не установлен');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${MONAD_CONFIG.chainId.toString(16)}` }],
    });
  } catch (switchError) {
    // Если сеть не добавлена, добавляем её
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [MONAD_CONFIG],
        });
      } catch (addError) {
        throw new Error('Не удалось добавить сеть Monad');
      }
    } else {
      throw switchError;
    }
  }
};

// Получение баланса токена
export const getTokenBalance = async (tokenAddress, userAddress) => {
  if (tokenAddress === '0x0000000000000000000000000000000000000000') {
    // Нативный токен (MONAD)
    const provider = getProvider();
    const balance = await provider.getBalance(userAddress);
    return ethers.formatEther(balance);
  } else {
    // ERC20 токен
    const tokenContract = getContract(tokenAddress, ERC20_ABI);
    const balance = await tokenContract.balanceOf(userAddress);
    const decimals = await tokenContract.decimals();
    return ethers.formatUnits(balance, decimals);
  }
};

// Получение allowance
export const getTokenAllowance = async (tokenAddress, userAddress, spenderAddress) => {
  if (tokenAddress === '0x0000000000000000000000000000000000000000') {
    return ethers.parseEther('999999999'); // Нативный токен не требует allowance
  }
  
  const tokenContract = getContract(tokenAddress, ERC20_ABI);
  const allowance = await tokenContract.allowance(userAddress, spenderAddress);
  const decimals = await tokenContract.decimals();
  return ethers.formatUnits(allowance, decimals);
};

// Утверждение токенов для свапа
export const approveToken = async (tokenAddress, spenderAddress, amount) => {
  if (tokenAddress === '0x0000000000000000000000000000000000000000') {
    return true; // Нативный токен не требует approval
  }

  const tokenContract = await getContractWithSigner(tokenAddress, ERC20_ABI);
  const decimals = await tokenContract.decimals();
  const amountWei = ethers.parseUnits(amount, decimals);
  
  const tx = await tokenContract.approve(spenderAddress, amountWei);
  return await tx.wait();
};

// Проверка подключения к правильной сети
export const checkNetwork = async () => {
  const provider = getProvider();
  const network = await provider.getNetwork();
  return network.chainId === BigInt(MONAD_CONFIG.chainId);
};

// Форматирование адреса для отображения
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Валидация адреса
export const isValidAddress = (address) => {
  try {
    ethers.getAddress(address);
    return true;
  } catch {
    return false;
  }
}; 