const TelegramApi = require('node-telegram-bot-api')
const {complimentData} = require('./complimentData')

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

    const randomNumber = Math.floor(Math.random() * complimentData.length);

    await bot.sendMessage(
        chanId,
        `${complimentData[randomNumber] || 'Вы великолепны!'}`,
        button
    );
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