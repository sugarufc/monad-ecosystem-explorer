# 🚀 План деплоя Monad Ecosystem Explorer с реальными свапами

## 📋 Текущее состояние
- ✅ React приложение готово
- ✅ Docker конфигурация настроена
- ✅ Безопасность реализована
- ❌ Свапы только демо (не реальные)

## 🎯 Цели деплоя
1. Развернуть на хостинге
2. Интегрировать реальные DEX контракты
3. Обеспечить безопасность транзакций
4. Добавить мониторинг и аналитику

## 🌐 Варианты хостинга

### 1. Vercel (Рекомендуемый)
```bash
# Установка Vercel CLI
npm i -g vercel

# Деплой
vercel --prod
```

**Преимущества:**
- Автоматический деплой из GitHub
- SSL сертификаты
- CDN глобально
- Бесплатный план
- Отличная производительность

### 2. Netlify
```bash
# Установка Netlify CLI
npm install -g netlify-cli

# Деплой
netlify deploy --prod
```

### 3. Railway
- Поддержка Docker
- Автоматический деплой
- Мониторинг

## 🔗 Интеграция с реальными DEX

### Шаг 1: Получение DEX контрактов
```javascript
// Примеры DEX контрактов для Monad
const DEX_CONTRACTS = {
  uniswapV2: "0x...", // Адрес Uniswap V2 Factory
  uniswapV3: "0x...", // Адрес Uniswap V3 Factory
  sushiswap: "0x...", // Адрес SushiSwap
  custom: "0x..."     // Кастомный DEX
};
```

### Шаг 2: ABI контрактов
```javascript
// Uniswap V2 Router ABI (фрагмент)
const UNISWAP_V2_ROUTER_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amountOutMin",
        "type": "uint256"
      },
      {
        "internalType": "address[]",
        "name": "path",
        "type": "address[]"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "name": "swapExactTokensForTokens",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "amounts",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
```

### Шаг 3: Реальные токены Monad
```javascript
const MONAD_TOKENS = {
  MONAD: {
    address: "0x...", // Нативный токен
    symbol: "MONAD",
    decimals: 18,
    name: "Monad"
  },
  USDC: {
    address: "0x...", // USDC на Monad
    symbol: "USDC", 
    decimals: 6,
    name: "USD Coin"
  },
  WETH: {
    address: "0x...", // Wrapped ETH
    symbol: "WETH",
    decimals: 18,
    name: "Wrapped Ether"
  }
};
```

## 🔧 Технические требования

### 1. Переменные окружения
```env
# .env.production
REACT_APP_MONAD_RPC_URL=https://rpc.monad.xyz
REACT_APP_DEX_ROUTER_ADDRESS=0x...
REACT_APP_FACTORY_ADDRESS=0x...
REACT_APP_CHAIN_ID=1337
REACT_APP_NETWORK_NAME=Monad
```

### 2. Web3 интеграция
```javascript
// src/utils/web3.js
import { ethers } from 'ethers';

export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return new ethers.JsonRpcProvider(process.env.REACT_APP_MONAD_RPC_URL);
};

export const getContract = (address, abi) => {
  const provider = getProvider();
  return new ethers.Contract(address, abi, provider);
};
```

### 3. Swap функция
```javascript
// src/utils/swap.js
export const executeSwap = async (
  fromToken,
  toToken,
  amount,
  slippage = 0.5
) => {
  const router = getContract(DEX_ROUTER_ADDRESS, ROUTER_ABI);
  const signer = await getProvider().getSigner();
  
  const path = [fromToken.address, toToken.address];
  const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 минут
  
  const tx = await router.connect(signer).swapExactTokensForTokens(
    ethers.parseUnits(amount, fromToken.decimals),
    0, // amountOutMin (рассчитывается отдельно)
    path,
    signer.address,
    deadline
  );
  
  return await tx.wait();
};
```

## 🛡️ Безопасность

### 1. Проверки транзакций
- Валидация адресов токенов
- Проверка баланса
- Расчет slippage
- Проверка allowance

### 2. Обработка ошибок
```javascript
try {
  const result = await executeSwap(fromToken, toToken, amount);
  // Успех
} catch (error) {
  if (error.code === 'USER_REJECTED') {
    // Пользователь отменил
  } else if (error.code === 'INSUFFICIENT_FUNDS') {
    // Недостаточно средств
  } else {
    // Другие ошибки
  }
}
```

## 📊 Мониторинг

### 1. Аналитика
- Google Analytics
- Mixpanel
- Hotjar

### 2. Логирование
- Sentry для ошибок
- LogRocket для сессий

## 🚀 Пошаговый деплой

### Этап 1: Подготовка (1-2 дня)
1. Получить адреса DEX контрактов
2. Настроить переменные окружения
3. Протестировать локально

### Этап 2: Деплой (1 день)
1. Создать аккаунт на Vercel
2. Подключить GitHub репозиторий
3. Настроить автоматический деплой

### Этап 3: Тестирование (1-2 дня)
1. Тест на testnet
2. Тест с реальными токенами
3. Проверка безопасности

### Этап 4: Запуск (1 день)
1. Переключение на mainnet
2. Мониторинг
3. Маркетинг

## 💰 Стоимость деплоя

### Vercel
- Бесплатный план: $0/месяц
- Pro план: $20/месяц (если нужен)

### Доменное имя
- .com: ~$10-15/год
- .xyz: ~$5-10/год

### Мониторинг
- Sentry: $26/месяц
- LogRocket: $99/месяц

**Итого: ~$50-150/месяц для полноценного проекта**

## 🎯 Следующие шаги

1. **Получить DEX контракты** - связаться с Monad командой
2. **Настроить переменные окружения** - создать .env файлы
3. **Интегрировать реальные свапы** - заменить демо код
4. **Деплой на Vercel** - развернуть приложение
5. **Тестирование** - проверить все функции
6. **Запуск** - открыть для пользователей

## 📞 Контакты для получения контрактов

- **Monad Discord**: https://discord.gg/monad
- **Monad Twitter**: @monad_xyz
- **Monad GitHub**: https://github.com/monad-xyz

---

**Готов начать деплой? Выберите хостинг и получим DEX контракты! 🚀** 