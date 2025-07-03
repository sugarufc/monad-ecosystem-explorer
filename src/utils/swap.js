import { ethers } from 'ethers';
import {
  DEX_CONTRACTS,
  TOKENS,
  UNISWAP_V2_ROUTER_ABI,
  getContract,
  getContractWithSigner,
  getTokenBalance,
  getTokenAllowance,
  approveToken,
  checkNetwork,
  switchToMonadNetwork
} from './web3';

// Класс для управления свапами
export class SwapManager {
  constructor() {
    this.routerAddress = DEX_CONTRACTS.uniswapV2Router;
    this.isInitialized = false;
  }

  // Инициализация свап менеджера
  async initialize() {
    try {
      // Проверяем подключение к правильной сети
      const isCorrectNetwork = await checkNetwork();
      if (!isCorrectNetwork) {
        await switchToMonadNetwork();
      }
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Ошибка инициализации SwapManager:', error);
      throw error;
    }
  }

  // Получение оценки свапа
  async getSwapEstimate(fromToken, toToken, amount) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const router = getContract(this.routerAddress, UNISWAP_V2_ROUTER_ABI);
      
      const fromTokenAddress = fromToken.address;
      const toTokenAddress = toToken.address;
      
      // Парсим количество в wei
      const amountIn = ethers.parseUnits(amount, fromToken.decimals);
      
      // Путь для свапа
      const path = [fromTokenAddress, toTokenAddress];
      
      // Получаем оценку
      const amounts = await router.getAmountsOut(amountIn, path);
      const amountOut = amounts[1];
      
      return {
        amountIn: ethers.formatUnits(amountIn, fromToken.decimals),
        amountOut: ethers.formatUnits(amountOut, toToken.decimals),
        path: path
      };
    } catch (error) {
      console.error('Ошибка получения оценки свапа:', error);
      throw new Error('Не удалось получить оценку свапа');
    }
  }

  // Выполнение свапа токенов
  async executeTokenSwap(fromToken, toToken, amount, slippage = 0.5) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const router = await getContractWithSigner(this.routerAddress, UNISWAP_V2_ROUTER_ABI);
      const signer = await router.signer;
      const userAddress = await signer.getAddress();

      // Получаем оценку свапа
      const estimate = await this.getSwapEstimate(fromToken, toToken, amount);
      
      // Рассчитываем минимальное количество с учетом slippage
      const amountOutMin = ethers.parseUnits(estimate.amountOut, toToken.decimals);
      const slippageAmount = amountOutMin * BigInt(Math.floor(slippage * 100)) / BigInt(10000);
      const finalAmountOutMin = amountOutMin - slippageAmount;

      // Парсим количество в wei
      const amountIn = ethers.parseUnits(amount, fromToken.decimals);
      
      // Устанавливаем deadline (20 минут)
      const deadline = Math.floor(Date.now() / 1000) + 1200;

      let tx;
      
      if (fromToken.address === '0x0000000000000000000000000000000000000000') {
        // Свап нативного токена (MONAD) на ERC20
        tx = await router.swapExactETHForTokens(
          finalAmountOutMin,
          estimate.path,
          userAddress,
          deadline,
          { value: amountIn }
        );
      } else if (toToken.address === '0x0000000000000000000000000000000000000000') {
        // Свап ERC20 на нативный токен (MONAD)
        tx = await router.swapExactTokensForETH(
          amountIn,
          finalAmountOutMin,
          estimate.path,
          userAddress,
          deadline
        );
      } else {
        // Свап ERC20 на ERC20
        tx = await router.swapExactTokensForTokens(
          amountIn,
          finalAmountOutMin,
          estimate.path,
          userAddress,
          deadline
        );
      }

      // Ждем подтверждения транзакции
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        amountIn: estimate.amountIn,
        amountOut: estimate.amountOut
      };

    } catch (error) {
      console.error('Ошибка выполнения свапа:', error);
      
      if (error.code === 'USER_REJECTED') {
        throw new Error('Пользователь отменил транзакцию');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Недостаточно средств для выполнения свапа');
      } else if (error.message.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
        throw new Error('Slippage слишком высокий. Попробуйте увеличить slippage или уменьшить количество.');
      } else {
        throw new Error(`Ошибка свапа: ${error.message}`);
      }
    }
  }

  // Проверка необходимости approval
  async checkApprovalNeeded(fromToken, amount) {
    if (fromToken.address === '0x0000000000000000000000000000000000000000') {
      return false; // Нативный токен не требует approval
    }

    try {
      const signer = await getContractWithSigner(this.routerAddress, UNISWAP_V2_ROUTER_ABI);
      const userAddress = await signer.signer.getAddress();
      
      const allowance = await getTokenAllowance(fromToken.address, userAddress, this.routerAddress);
      const allowanceAmount = parseFloat(allowance);
      const requiredAmount = parseFloat(amount);
      
      return allowanceAmount < requiredAmount;
    } catch (error) {
      console.error('Ошибка проверки approval:', error);
      return true; // В случае ошибки считаем что approval нужен
    }
  }

  // Выполнение approval
  async executeApproval(fromToken, amount) {
    if (fromToken.address === '0x0000000000000000000000000000000000000000') {
      return { success: true }; // Нативный токен не требует approval
    }

    try {
      const result = await approveToken(fromToken.address, this.routerAddress, amount);
      return { success: true, transactionHash: result.hash };
    } catch (error) {
      console.error('Ошибка approval:', error);
      throw new Error('Не удалось утвердить токены для свапа');
    }
  }

  // Получение балансов токенов
  async getTokenBalances(userAddress) {
    const balances = {};
    
    for (const [symbol, token] of Object.entries(TOKENS)) {
      try {
        const balance = await getTokenBalance(token.address, userAddress);
        balances[symbol] = {
          symbol: token.symbol,
          balance: balance,
          decimals: token.decimals,
          icon: token.icon
        };
      } catch (error) {
        console.error(`Ошибка получения баланса ${symbol}:`, error);
        balances[symbol] = {
          symbol: token.symbol,
          balance: '0',
          decimals: token.decimals,
          icon: token.icon
        };
      }
    }
    
    return balances;
  }

  // Получение цены токена в USD (через USDC пару)
  async getTokenPrice(tokenSymbol) {
    try {
      if (tokenSymbol === 'USDC') return 1;
      
      const token = TOKENS[tokenSymbol];
      const usdc = TOKENS.USDC;
      
      if (!token || !usdc) {
        throw new Error('Токен не найден');
      }

      // Получаем цену через USDC пару
      const estimate = await this.getSwapEstimate(token, usdc, '1');
      return parseFloat(estimate.amountOut);
    } catch (error) {
      console.error(`Ошибка получения цены ${tokenSymbol}:`, error);
      return 0;
    }
  }

  // Получение информации о пуле ликвидности
  async getPoolInfo(tokenA, tokenB) {
    try {
      const factory = getContract(DEX_CONTRACTS.uniswapV2Factory, [
        {
          "inputs": [
            {"internalType": "address", "name": "tokenA", "type": "address"},
            {"internalType": "address", "name": "tokenB", "type": "address"}
          ],
          "name": "getPair",
          "outputs": [{"internalType": "address", "name": "pair", "type": "address"}],
          "stateMutability": "view",
          "type": "function"
        }
      ]);

      const pairAddress = await factory.getPair(tokenA.address, tokenB.address);
      
      if (pairAddress === '0x0000000000000000000000000000000000000000') {
        return null; // Пул не существует
      }

      return {
        pairAddress: pairAddress,
        tokenA: tokenA.symbol,
        tokenB: tokenB.symbol
      };
    } catch (error) {
      console.error('Ошибка получения информации о пуле:', error);
      return null;
    }
  }
}

// Создание экземпляра SwapManager
export const swapManager = new SwapManager();

// Утилиты для работы со свапами
export const swapUtils = {
  // Форматирование числа с учетом decimals
  formatTokenAmount: (amount, decimals) => {
    return ethers.formatUnits(amount, decimals);
  },

  // Парсинг числа в wei
  parseTokenAmount: (amount, decimals) => {
    return ethers.parseUnits(amount, decimals);
  },

  // Расчет slippage
  calculateSlippage: (amount, slippagePercent) => {
    const amountBig = ethers.parseUnits(amount, 18);
    const slippage = amountBig * BigInt(Math.floor(slippagePercent * 100)) / BigInt(10000);
    return amountBig - slippage;
  },

  // Валидация суммы свапа
  validateSwapAmount: (amount, balance) => {
    const numAmount = parseFloat(amount);
    const numBalance = parseFloat(balance);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return { valid: false, error: 'Введите корректную сумму' };
    }
    
    if (numAmount > numBalance) {
      return { valid: false, error: 'Недостаточно средств' };
    }
    
    return { valid: true };
  },

  // Получение статуса транзакции
  getTransactionStatus: async (transactionHash) => {
    try {
      const provider = getContract().provider;
      const receipt = await provider.getTransactionReceipt(transactionHash);
      
      if (!receipt) {
        return { status: 'pending', message: 'Транзакция в обработке' };
      }
      
      if (receipt.status === 1) {
        return { status: 'success', message: 'Транзакция выполнена успешно' };
      } else {
        return { status: 'failed', message: 'Транзакция не удалась' };
      }
    } catch (error) {
      return { status: 'error', message: 'Ошибка получения статуса' };
    }
  }
}; 