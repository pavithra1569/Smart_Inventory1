# WhatsApp Low Stock Alert System - Setup Guide

## ✅ AUTOMATICALLY IMPLEMENTED

### Backend
- ✅ **Alert Model** (`backend/models/Alert.js`) - Stores all low stock alerts with status tracking
- ✅ **WhatsApp Service** (`backend/services/whatsappService.js`) - Handles WhatsApp Cloud API integration
- ✅ **Alert Routes** (`backend/routes/alertRoutes.js`) - Full CRUD API endpoints for alerts
- ✅ **Auto-trigger Logic** - Product updates automatically trigger alerts when stock < threshold
- ✅ **Server Integration** - Alert routes added to main server

### Frontend
- ✅ **API Functions** (`src/services/api.js`) - Alert API service calls
- ✅ **Alerts Page** (`src/pages/Alerts.jsx`) - Full alert management interface
- ✅ **Alerts Widget** (`src/components/AlertsWidget.jsx`) - Dashboard widget for quick overview
- ✅ **Styling** (`src/styles/Alerts.css`) - Beautiful responsive UI

---

## 📝 YOU NEED TO DO MANUALLY

### 1️⃣ Get WhatsApp Cloud API Credentials

**Step 1:** Create a Meta Developer App
- Go to https://developers.facebook.com/apps
- Click **Create App** → choose **Business** → continue

**Step 2:** Add the WhatsApp product
- Inside your app, click **Add Product** → **WhatsApp**
- Go to **WhatsApp > Getting Started**

**Step 3:** Get your credentials
- Copy the **Access Token** (long string) and set it as `WHATSAPP_API_TOKEN`
- Copy the **Phone Number ID** and set it as `WHATSAPP_PHONE_NUMBER_ID`

**Step 4:** Verify Your Admin Phone
- In the WhatsApp Cloud API dashboard, add your personal WhatsApp number as a recipient
- You should see a confirmation that your number is registered for testing

### 2️⃣ Update `.env` File

Replace the placeholders in `d:\con-project\Smart_Inventory1\.env`:

```env
WHATSAPP_API_TOKEN=your_whatsapp_cloud_api_token
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
ADMIN_WHATSAPP_NUMBER=whatsapp:+your_phone_number
```
### 3️⃣ Add Routes to Frontend Navigation

In your `App.jsx` or routing file, add the Alerts page:

```jsx
import Alerts from './pages/Alerts'

// In your routes:
<Route path="/alerts" element={<Alerts />} />
```

### 4️⃣ Add Menu Item to Sidebar/Navbar

In `src/components/Sidebar.jsx` or `Navbar.jsx`, add:

```jsx
<a href="/alerts" className="nav-item">
  📱 Low Stock Alerts
</a>
```

### 5️⃣ (Optional) Add AlertsWidget to Dashboard

In `src/pages/Dashboard.jsx`, add:

```jsx
import AlertsWidget from '../components/AlertsWidget'

// In your component JSX:
<AlertsWidget />
```

---

## 🎯 HOW IT WORKS (Automatically)

### Trigger Flow
1. **Admin updates product quantity** in Products/Inventory page
2. **Quantity drops below threshold** (default: 10 units)
3. **System automatically:**
   - Creates an Alert record in database
   - Sends WhatsApp message to admin
   - Updates alert status to "sent"
   - Alert appears in Alerts page

### Alert Lifecycle
- **Pending**: Waiting to be sent via WhatsApp
- **Sent**: WhatsApp message delivered successfully
- **Resolved**: Admin marked as handled

### Alert Management
- ✓ View all alerts by status
- ✓ Mark alerts as resolved
- ✓ Delete alerts
- ✓ Auto-refresh every 30 seconds

---

## 🚀 Testing

### Test WhatsApp Message
1. Go to any product and **reduce quantity below 10**
2. Click Update
3. **Check your phone** for WhatsApp message (may take 1-5 seconds)
4. Go to **Alerts page** to see the alert logged

### Example WhatsApp Message
```
⚠️ LOW STOCK ALERT

Product: Fertilizer A
Current Stock: 5 units
Threshold: 10 units

Please reorder immediately.
```

---

## 🔧 Customization Options

### Change Threshold
Edit `.env`:
```env
LOW_STOCK_THRESHOLD=20  # Change from 10 to 20
```

### Change Alert Message
Edit `backend/services/whatsappService.js`:
```javascript
body: `Your custom message template`
```

### Change Refresh Interval
Edit `src/pages/Alerts.jsx`:
```javascript
const interval = setInterval(fetchAlerts, 60000) // Change to 60 seconds
```

---

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| WhatsApp not sending | Check WhatsApp Cloud API token/phone ID in `.env` |
| Phone not registered | Add your phone number under WhatsApp Cloud API > Settings |
| Alerts not appearing | Restart backend: `npm run dev` |
| Wrong phone format | Use format: `whatsapp:+1234567890` |

---

## 📱 Meta WhatsApp Cloud API Notes
- The WhatsApp Cloud API token expires periodically (usually 24 hours for test tokens). If messages stop sending, refresh the token and update `.env`.
- For production, create a business verification and a long-lived token.

Enjoy your WhatsApp alert system! 🎉
