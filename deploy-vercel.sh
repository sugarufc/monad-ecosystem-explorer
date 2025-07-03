#!/bin/bash

# 🚀 Скрипт деплоя Monad Ecosystem Explorer на Vercel

echo "🚀 Начинаем деплой Monad Ecosystem Explorer на Vercel..."

# Проверяем наличие Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI не установлен. Устанавливаем..."
    npm install -g vercel
fi

# Проверяем наличие .env.production
if [ ! -f ".env.production" ]; then
    echo "⚠️  Файл .env.production не найден. Создаем из примера..."
    cp env.production.example .env.production
    echo "📝 Пожалуйста, отредактируйте .env.production с реальными адресами контрактов"
    echo "   Затем запустите скрипт снова"
    exit 1
fi

# Проверяем зависимости
echo "📦 Проверяем зависимости..."
npm install

# Собираем проект
echo "🔨 Собираем проект..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Ошибка сборки проекта"
    exit 1
fi

# Деплой на Vercel
echo "🚀 Деплоим на Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Деплой успешно завершен!"
    echo "🌐 Ваше приложение доступно по ссылке выше"
    echo ""
    echo "📋 Следующие шаги:"
    echo "1. Проверьте работу всех функций"
    echo "2. Протестируйте свапы на testnet"
    echo "3. Настройте мониторинг (Sentry, Analytics)"
    echo "4. Запустите маркетинг кампанию"
else
    echo "❌ Ошибка деплоя"
    exit 1
fi 