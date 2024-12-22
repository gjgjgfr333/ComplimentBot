const TelegramApi = require('node-telegram-bot-api')
const express = require('express'); // Подключаем фреймворк Express

const app = express(); // Создаем экземпляр приложения

// Устанавливаем простой маршрут
app.get('/', (req, res) => {
    res.send('Hello, World!');
});


// Устанавливаем порт из переменной окружения или по умолчанию
const PORT = process.env.PORT || 3000;

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const token = '7731147552:AAEoMYG2aXTy9cpOmZ01mIKGwU2-oLE7flM'
const bot = new TelegramApi(token, {polling: true})

const button = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Получить комплимент❤️', callback_data: 'give_compliment'}]
        ]
    })
}

const chatIds = new Set()

const sendCompliment = async (chanId) => {
    try {
        const response = await fetch('https://tools-api.robolatoriya.com/compliment?type=1');

        if (!response.ok) {
            throw new Error(`Ошибка API: ${response.status}`);
        }

        const data = await response.json();
        console.log(data, 'data')

        await bot.sendMessage(
            chanId,
            `${data?.text || 'Вы великолепны!'}`,
            button
        );
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);

        await bot.sendMessage(
            chanId,
            'Произошла ошибка, попробуйте позже!',
            button
        );
    }
}

bot.setMyCommands([
    {command: '/start', description: 'Запуск бота'}
])

bot.on('message', (message) => {
    console.log(message)

    if (message.text === '/start') {
        chatIds.add(message.chat.id)
        bot.sendMessage(
            message.chat.id,
            `Привет ${message.chat.first_name}, я бот комплиментов и теперь раз в сутки в 10 утра я буду делать тебе комплимент!`,
            button
            )
    }
})

bot.on('callback_query', async (query) => {
    const chanId = query.message.chat.id
    await sendCompliment(chanId)
});

// Запуск интервала для ежедневной рассылки
const sendDailyCompliments = () => {
    // Определяем дату отправки
    const now = new Date();
    const targetTime = new Date();

    // Ждем до 10 утра
    targetTime.setHours(10, 0, 0, 0); // Устанавливаем на 10:00
    const delay = targetTime - now > 0 ? targetTime - now : 24 * 60 * 60 * 1000 + (targetTime - now);

    // Ждем до 10 утра
    setTimeout(() => {
        setInterval(() => {
            console.log('Ежедневная рассылка комплиментов!');
            chatIds?.forEach((chatId) => sendCompliment(chatId));
        }, 24 * 60 * 60 * 1000); // Интервал раз в сутки
    }, delay);
};

// Запуск
sendDailyCompliments();