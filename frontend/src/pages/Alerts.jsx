import React, { useState, useEffect } from 'react'
import { getAlerts, resolveAlert, deleteAlert } from '../services/api'
import '../styles/Alerts.css'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, sent, resolved

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  async function fetchAlerts() {
    try {
      setLoading(true)
      const data = await getAlerts()
      setAlerts(data)
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleResolve(alertId) {
    try {
      await resolveAlert(alertId)
      fetchAlerts()
    } catch (error) {
      console.error('Failed to resolve alert:', error)
      alert('Error resolving alert')
    }
  }

  async function handleDelete(alertId) {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      try {
        await deleteAlert(alertId)
        fetchAlerts()
      } catch (error) {
        console.error('Failed to delete alert:', error)
        alert('Error deleting alert')
      }
    }
  }

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.status === filter)

  const getStatusBadge = (status) => {
    const statusClass = {
      pending: 'badge-danger',
      sent: 'badge-warning',
      resolved: 'badge-success'
    }
    return statusClass[status] || 'badge-secondary'
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '⏳'
      case 'sent': return '✓'
      case 'resolved': return '✓✓'
      default: return '•'
    }
  }

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <h1>📱 Low Stock Alerts</h1>
        <p className="alerts-subtitle">WhatsApp notifications to admin for low inventory</p>
      </div>

      <div className="alerts-controls">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({alerts.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({alerts.filter(a => a.status === 'pending').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'sent' ? 'active' : ''}`}
          onClick={() => setFilter('sent')}
        >
          Sent ({alerts.filter(a => a.status === 'sent').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
          onClick={() => setFilter('resolved')}
        >
          Resolved ({alerts.filter(a => a.status === 'resolved').length})
        </button>
      </div>

      {loading && <div className="loading">Loading alerts...</div>}

      {!loading && filteredAlerts.length === 0 && (
        <div className="no-alerts">
          <p>✓ No {filter !== 'all' ? filter : ''} alerts</p>
        </div>
      )}

      <div className="alerts-list">
        {filteredAlerts.map(alert => (
          <div key={alert.id} className={`alert-card alert-${alert.status}`}>
            <div className="alert-header-row">
              <div className="alert-title">
                <span className="alert-icon">⚠️</span>
                <h3>{alert.productName}</h3>
              </div>
              <span className={`badge ${getStatusBadge(alert.status)}`}>
                {getStatusIcon(alert.status)} {alert.status.toUpperCase()}
              </span>
            </div>

            <div className="alert-details">
              <div className="detail-item">
                <span className="label">Current Stock:</span>
                <span className="value">{alert.currentQuantity} units</span>
              </div>
              <div className="detail-item">
                <span className="label">Threshold:</span>
                <span className="value">{alert.threshold} units</span>
              </div>
              <div className="detail-item">
                <span className="label">Created:</span>
                <span className="value">{new Date(alert.createdAt).toLocaleString()}</span>
              </div>
              {alert.sentAt && (
                <div className="detail-item">
                  <span className="label">Sent:</span>
                  <span className="value">{new Date(alert.sentAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="alert-actions">
              {alert.status !== 'resolved' && (
                <button 
                  className="btn btn-resolve"
                  onClick={() => handleResolve(alert.id)}
                  title="Mark as resolved"
                >
                  ✓ Resolve
                </button>
              )}
              <button 
                className="btn btn-delete"
                onClick={() => handleDelete(alert.id)}
                title="Delete alert"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
