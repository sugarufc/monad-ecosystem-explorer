// BlockVision Monad Indexing API Integration
// https://docs.blockvision.org/reference/monad-indexing-api

export class BlockVisionAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = process.env.REACT_APP_BLOCKVISION_BASE_URL || 'https://monad-testnet.blockvision.org/v1';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 минут
  }

  // Общий метод для API запросов
  async makeRequest(endpoint, params = {}) {
    try {
      // Для вашего API используем ключ как часть URL
      const url = new URL(`${this.baseUrl}/${this.apiKey}${endpoint}`);
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('BlockVision API Error:', error);
      throw error;
    }
  }

  // Кэширование результатов
  getCacheKey(endpoint, params) {
    return `${endpoint}?${JSON.stringify(params)}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // 1. Получение токенов аккаунта
  async getAccountTokens(address, page = 1, limit = 20) {
    const cacheKey = this.getCacheKey('/account/tokens', { address, page, limit });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest('/account/tokens', {
      address,
      page,
      limit
    });

    this.setCache(cacheKey, data);
    return data;
  }

  // 2. Получение деталей токена
  async getTokenDetail(tokenAddress) {
    const cacheKey = this.getCacheKey('/token/detail', { address: tokenAddress });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest('/token/detail', {
      address: tokenAddress
    });

    this.setCache(cacheKey, data);
    return data;
  }

  // 3. Получение активности аккаунта
  async getAccountActivity(address, page = 1, limit = 20) {
    const cacheKey = this.getCacheKey('/account/activity', { address, page, limit });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest('/account/activity', {
      address,
      page,
      limit
    });

    this.setCache(cacheKey, data);
    return data;
  }

  // 4. Получение транзакций аккаунта
  async getAccountTransactions(address, page = 1, limit = 20) {
    const cacheKey = this.getCacheKey('/account/transactions', { address, page, limit });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest('/account/transactions', {
      address,
      page,
      limit
    });

    this.setCache(cacheKey, data);
    return data;
  }

  // 5. Получение держателей токена
  async getTokenHolders(tokenAddress, page = 1, limit = 20) {
    const cacheKey = this.getCacheKey('/token/holders', { address: tokenAddress, page, limit });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest('/token/holders', {
      address: tokenAddress,
      page,
      limit
    });

    this.setCache(cacheKey, data);
    return data;
  }

  // 6. Получение NFT аккаунта
  async getAccountNFTs(address, page = 1, limit = 20) {
    const cacheKey = this.getCacheKey('/account/nfts', { address, page, limit });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest('/account/nfts', {
      address,
      page,
      limit
    });

    this.setCache(cacheKey, data);
    return data;
  }

  // 7. Получение активности токенов аккаунта
  async getAccountTokenActivities(address, page = 1, limit = 20) {
    const cacheKey = this.getCacheKey('/account/token-activities', { address, page, limit });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest('/account/token-activities', {
      address,
      page,
      limit
    });

    this.setCache(cacheKey, data);
    return data;
  }

  // 8. Получение исходного кода контракта
  async getContractSourceCode(contractAddress) {
    const cacheKey = this.getCacheKey('/contract/source-code', { address: contractAddress });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest('/contract/source-code', {
      address: contractAddress
    });

    this.setCache(cacheKey, data);
    return data;
  }

  // Утилиты для форматирования данных
  formatTokenBalance(balance, decimals = 18) {
    if (!balance) return '0';
    return (parseFloat(balance) / Math.pow(10, decimals)).toFixed(6);
  }

  formatUSDValue(value) {
    if (!value) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleString();
  }

  // Получение полного портфолио пользователя
  async getAccountPortfolio(address) {
    try {
      const [tokens, nfts, activity] = await Promise.all([
        this.getAccountTokens(address),
        this.getAccountNFTs(address),
        this.getAccountActivity(address, 1, 10) // Последние 10 активностей
      ]);

      return {
        tokens: tokens.data || [],
        nfts: nfts.data || [],
        recentActivity: activity.data || [],
        totalTokens: tokens.data?.length || 0,
        totalNFTs: nfts.data?.length || 0
      };
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw error;
    }
  }

  // Получение рыночных данных токена
  async getTokenMarketData(tokenAddress) {
    try {
      const tokenDetail = await this.getTokenDetail(tokenAddress);
      const holders = await this.getTokenHolders(tokenAddress, 1, 1); // Только количество

      return {
        ...tokenDetail.data,
        totalHolders: holders.total || 0,
        marketCap: tokenDetail.data?.marketCap || 0,
        price: tokenDetail.data?.price || 0,
        volume24h: tokenDetail.data?.volume24h || 0
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  // Очистка кэша
  clearCache() {
    this.cache.clear();
  }

  // Получение статистики использования API
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Создание экземпляра API с ключом из переменных окружения
export const blockvisionAPI = new BlockVisionAPI(
  process.env.REACT_APP_BLOCKVISION_API_KEY || '2zMWz9a4lic3XoSuK18mvyxomiR'
);

// Утилиты для работы с данными
export const blockvisionUtils = {
  // Фильтрация токенов по балансу
  filterTokensByBalance: (tokens, minBalance = 0) => {
    return tokens.filter(token => 
      parseFloat(token.balance || 0) > minBalance
    );
  },

  // Сортировка токенов по стоимости
  sortTokensByValue: (tokens) => {
    return tokens.sort((a, b) => {
      const valueA = parseFloat(a.usdValue || 0);
      const valueB = parseFloat(b.usdValue || 0);
      return valueB - valueA;
    });
  },

  // Группировка транзакций по типу
  groupTransactionsByType: (transactions) => {
    return transactions.reduce((groups, tx) => {
      const type = tx.type || 'unknown';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(tx);
      return groups;
    }, {});
  },

  // Получение статистики портфолио
  getPortfolioStats: (tokens) => {
    const totalValue = tokens.reduce((sum, token) => 
      sum + parseFloat(token.usdValue || 0), 0
    );
    
    const tokenCount = tokens.length;
    const nonZeroTokens = tokens.filter(token => 
      parseFloat(token.balance || 0) > 0
    ).length;

    return {
      totalValue,
      tokenCount,
      nonZeroTokens,
      averageValue: tokenCount > 0 ? totalValue / tokenCount : 0
    };
  }
}; 