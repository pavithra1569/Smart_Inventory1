const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require("dotenv").config();

let client;
let isReady = false;

function initializeWhatsApp() {
    console.log("Initializing WhatsApp Bot...");
    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-features=CalculateNativeWinOcclusion'
            ],
            timeout: 60000 // 60 seconds timeout
        }
    });

    client.on('qr', (qr) => {
        console.log('\n==================================================');
        console.log('SCAN THIS QR CODE WITH YOUR WHATSAPP TO LOG IN');
        console.log('==================================================');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('\n================================');
        console.log('📱 WhatsApp Client is READY!');
        console.log('================================\n');
        isReady = true;
    });

    client.on('auth_failure', msg => {
        console.error('AUTHENTICATION FAILURE', msg);
    });

    client.initialize();
}

async function sendLowStockAlert(productName, currentQuantity, threshold) {
    if (!isReady || !client) {
        throw new Error("WhatsApp bot is not ready yet. Please check the terminal.");
    }

    const { ADMIN_WHATSAPP_NUMBER } = process.env;

    if (!ADMIN_WHATSAPP_NUMBER) {
        throw new Error("ADMIN_WHATSAPP_NUMBER is not set in .env");
    }

    // Format the number so it works with whatsapp-web.js (e.g. 1234567890@c.us)
    // ADMIN_WHATSAPP_NUMBER normally looks like "whatsapp:+1234567890" in your .env
    let formattedNumber = ADMIN_WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
    const chatId = `${formattedNumber}@c.us`;

    const message = `⚠️ LOW STOCK ALERT\n\nProduct: ${productName}\nCurrent Stock: ${currentQuantity} units\nThreshold: ${threshold} units\n\nPlease reorder immediately.`;

    try {
        await client.sendMessage(chatId, message);
        console.log("WhatsApp alert sent via whatsapp-web.js!");
        return { success: true };
    } catch (error) {
        console.error("Failed to send WhatsApp message:", error);
        throw error;
    }
}

module.exports = { initializeWhatsApp, sendLowStockAlert };

