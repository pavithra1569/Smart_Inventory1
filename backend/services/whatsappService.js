require("dotenv").config();

const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ADMIN_WHATSAPP_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER;
const API_VERSION = process.env.WHATSAPP_API_VERSION || "v17.0";

const BASE_URL = `https://graph.facebook.com/${API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

async function sendLowStockAlert(productName, currentQuantity, threshold) {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !ADMIN_WHATSAPP_NUMBER) {
    throw new Error("WhatsApp Cloud API is not configured. Please set WHATSAPP_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID, and ADMIN_WHATSAPP_NUMBER in your .env file.");
  }

  const body = {
    messaging_product: "whatsapp",
    to: ADMIN_WHATSAPP_NUMBER,
    type: "text",
    text: {
      body: `⚠️ LOW STOCK ALERT\n\nProduct: ${productName}\nCurrent Stock: ${currentQuantity} units\nThreshold: ${threshold} units\n\nPlease reorder immediately.`
    }
  };

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WHATSAPP_API_TOKEN}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("WhatsApp Cloud API error:", response.status, text);
    throw new Error(`WhatsApp Cloud API error: ${response.status}`);
  }

  const data = await response.json();
  console.log("WhatsApp alert sent:", data);
  return { success: true, data };
}

module.exports = { sendLowStockAlert };
