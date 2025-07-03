# 🔗 BlockVision API Integration

## 📋 Обзор

Интеграция [BlockVision Monad Indexing API](https://docs.blockvision.org/reference/monad-indexing-api) позволяет получать реальные данные о токенах, NFT и активности пользователей в сети Monad.

## 🚀 Что добавлено

### 1. **BlockVision API утилиты** (`src/utils/blockvision.js`)
- Полный класс для работы с API
- Кэширование запросов (5 минут)
- Обработка ошибок
- Форматирование данных

### 2. **Компонент портфолио** (`src/components/PortfolioView.js`)
- Реальные балансы токенов
- NFT коллекции
- История активности
- Статистика портфолио

### 3. **Рыночные данные** (`src/components/TokenMarketData.js`)
- Цены токенов
- Рыночная капитализация
- Объём торгов
- Количество держателей

### 4. **Обновлённый SwapInterface**
- Интеграция с реальными балансами
- Fallback на демо данные при отсутствии API ключа

## 🔧 Настройка

### 1. **Получение API ключа**
1. Зарегистрируйтесь на [BlockVision](https://docs.blockvision.org)
2. Выберите план:
   - **Бесплатно**: 30 вызовов для тестирования
   - **Lite/Basic/Pro**: платные планы для продакшена
3. Получите API ключ

### 2. **Настройка переменных окружения**
```env
# .env.production
REACT_APP_BLOCKVISION_API_KEY=your_api_key_here
```

### 3. **Локальная разработка**
```env
# .env.local
REACT_APP_BLOCKVISION_API_KEY=your_api_key_here
```

## 📊 Доступные API методы

### **Account APIs**
```javascript
// Получение токенов аккаунта
const tokens = await blockvisionAPI.getAccountTokens(address);

// Получение NFT аккаунта
const nfts = await blockvisionAPI.getAccountNFTs(address);

// Получение активности аккаунта
const activity = await blockvisionAPI.getAccountActivity(address);

// Получение транзакций аккаунта
const transactions = await blockvisionAPI.getAccountTransactions(address);

// Получение активности токенов
const tokenActivities = await blockvisionAPI.getAccountTokenActivities(address);
```

### **Token APIs**
```javascript
// Получение деталей токена
const tokenDetail = await blockvisionAPI.getTokenDetail(tokenAddress);

// Получение держателей токена
const holders = await blockvisionAPI.getTokenHolders(tokenAddress);

// Получение рыночных данных
const marketData = await blockvisionAPI.getTokenMarketData(tokenAddress);
```

### **Contract APIs**
```javascript
// Получение исходного кода контракта
const sourceCode = await blockvisionAPI.getContractSourceCode(contractAddress);
```

### **Utility Methods**
```javascript
// Получение полного портфолио
const portfolio = await blockvisionAPI.getAccountPortfolio(address);

// Форматирование данных
const formattedBalance = blockvisionAPI.formatTokenBalance(balance, decimals);
const formattedUSD = blockvisionAPI.formatUSDValue(value);
const formattedAddress = blockvisionAPI.formatAddress(address);
const formattedDate = blockvisionAPI.formatDate(timestamp);

// Управление кэшем
blockvisionAPI.clearCache();
const cacheStats = blockvisionAPI.getCacheStats();
```

## 🎯 Использование в компонентах

### **PortfolioView**
```javascript
import PortfolioView from './components/PortfolioView';

<PortfolioView 
  isConnected={isConnected} 
  walletAddress={walletAddress} 
/>
```

### **TokenMarketData**
```javascript
import TokenMarketData from './components/TokenMarketData';

<TokenMarketData tokenAddress="0x..." />
```

### **Прямое использование API**
```javascript
import { blockvisionAPI } from './utils/blockvision';

// В компоненте
const [tokens, setTokens] = useState([]);

useEffect(() => {
  const loadTokens = async () => {
    try {
      const data = await blockvisionAPI.getAccountTokens(walletAddress);
      setTokens(data.data || []);
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  };
  
  if (walletAddress) {
    loadTokens();
  }
}, [walletAddress]);
```

## 🛡️ Безопасность

### **Что реализовано:**
- ✅ API ключ хранится в переменных окружения
- ✅ Кэширование для оптимизации запросов
- ✅ Обработка ошибок и fallback
- ✅ Валидация данных
- ✅ Rate limiting через кэш

### **Рекомендации:**
- Не коммитьте API ключи в Git
- Используйте разные ключи для разработки и продакшена
- Мониторьте использование API
- Регулярно обновляйте кэш

## 📈 Оптимизация

### **Кэширование**
- Автоматическое кэширование на 5 минут
- Возможность очистки кэша
- Статистика использования кэша

### **Обработка ошибок**
- Graceful fallback на демо данные
- Информативные сообщения об ошибках
- Возможность повтора запросов

### **Производительность**
- Параллельные запросы для портфолио
- Ленивая загрузка данных
- Оптимизированные запросы

## 🔄 Обновление данных

### **Автоматическое обновление**
- При изменении адреса кошелька
- При переключении табов
- При нажатии кнопки обновления

### **Ручное обновление**
```javascript
// Очистка кэша и перезагрузка
blockvisionAPI.clearCache();
loadPortfolio(); // или другой метод загрузки
```

## 🎨 UI/UX особенности

### **Состояния загрузки**
- Спиннеры загрузки
- Прогресс-бары
- Skeleton loading

### **Обработка ошибок**
- Информативные сообщения
- Кнопки повтора
- Fallback контент

### **Адаптивность**
- Responsive дизайн
- Оптимизация для мобильных
- Touch-friendly интерфейс

## 📊 Мониторинг

### **Статистика API**
```javascript
const stats = blockvisionAPI.getCacheStats();
console.log('Cache size:', stats.size);
console.log('Cached keys:', stats.keys);
```

### **Логирование**
- Все API запросы логируются
- Ошибки записываются в консоль
- Возможность интеграции с Sentry

## 🚀 Деплой

### **Vercel**
1. Добавьте переменную окружения в Vercel Dashboard
2. Перезапустите деплой
3. Проверьте работу API

### **Netlify**
1. Добавьте переменную в Environment Variables
2. Пересоберите проект
3. Проверьте работу

### **Docker**
```dockerfile
ENV REACT_APP_BLOCKVISION_API_KEY=your_key_here
```

## 🆘 Поддержка

### **Полезные ссылки:**
- [BlockVision API Documentation](https://docs.blockvision.org/reference/monad-indexing-api)
- [Monad Documentation](https://docs.monad.xyz)
- [BlockVision Discord](https://discord.gg/blockvision)

### **Частые проблемы:**
1. **API ключ не работает** - проверьте правильность ключа
2. **Нет данных** - убедитесь, что адрес кошелька правильный
3. **Ошибки 429** - превышен лимит запросов, подождите или обновите план
4. **Медленная загрузка** - проверьте кэш и оптимизируйте запросы

---

## 🎉 Результат

После интеграции BlockVision API ваше приложение получит:
- ✅ Реальные данные вместо демо
- ✅ Профессиональный вид
- ✅ Актуальную информацию
- ✅ Лучший пользовательский опыт
- ✅ Конкурентное преимущество

**Готово к использованию! 🚀** 