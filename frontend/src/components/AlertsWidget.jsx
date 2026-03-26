import React, { useState, useEffect } from 'react'
import { getPendingAlerts } from '../services/api'

export default function AlertsWidget() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchAlerts() {
    try {
      const data = await getPendingAlerts()
      setAlerts(data)
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="widget-loading">Loading...</div>

  return (
    <div className="alerts-widget">
      <div className="widget-header">
        <h3>📱 Low Stock Alerts</h3>
        <span className="alert-count">{alerts.length}</span>
      </div>
      
      {alerts.length === 0 ? (
        <div className="widget-empty">✓ No pending alerts</div>
      ) : (
        <div className="alerts-preview">
          {alerts.slice(0, 3).map(alert => (
            <div key={alert.id} className="alert-item">
              <span className="icon">⚠️</span>
              <div className="alert-text">
                <div className="product-name">{alert.productName}</div>
                <div className="alert-detail">{alert.currentQuantity} units left</div>
              </div>
            </div>
          ))}
          {alerts.length > 3 && (
            <div className="see-more">+{alerts.length - 3} more alerts</div>
          )}
        </div>
      )}
    </div>
  )
}
