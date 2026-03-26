import React, { useEffect, useMemo, useState } from 'react'
import { getLowStock, getExpiryRisks, getSalesTrends } from '../services/api'
import { SalesLine } from '../components/Charts'

export default function Analysis(){
  const [lowStock, setLowStock] = useState([])
  const [expiryRisks, setExpiryRisks] = useState([])
  const [trend, setTrend] = useState([])
  const [days, setDays] = useState(120)

  useEffect(()=>{
    getLowStock().then(setLowStock)
    getExpiryRisks(days).then(setExpiryRisks)
    getSalesTrends().then(setTrend)
  },[days])

  const lowStockRows = useMemo(()=> lowStock.sort((a,b)=>a.quantity-b.quantity), [lowStock])
  const expiryRows = useMemo(()=> expiryRisks.sort((a,b)=>a.daysToExpiry-b.daysToExpiry), [expiryRisks])

  return (
    <div className="d-grid gap-4">
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="card p-0 shadow-sm h-100">
            <div className="p-3 border-bottom fw-semibold">Low Stock Items</div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockRows.map(item=> (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td className={item.quantity<5? 'low-stock':''}>{item.quantity}</td>
                    </tr>
                  ))}
                  {lowStockRows.length===0 && (
                    <tr><td colSpan={3} className="text-muted small p-3">No low stock items.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card p-0 shadow-sm h-100">
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
              <div className="fw-semibold">Expiry Risks</div>
              <div className="d-flex align-items-center gap-2">
                <label className="small text-muted">Within (days)</label>
                <input type="number" min={7} max={365} value={days} onChange={e=>setDays(Number(e.target.value)||120)} className="form-control form-control-sm" style={{width:100}} />
              </div>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Expiry</th>
                    <th>Days Left</th>
                  </tr>
                </thead>
                <tbody>
                  {expiryRows.map(item=> (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{new Date(item.expiry).toLocaleDateString()}</td>
                      <td className={item.daysToExpiry<=30? 'text-danger fw-semibold':''}>{item.daysToExpiry}</td>
                    </tr>
                  ))}
                  {expiryRows.length===0 && (
                    <tr><td colSpan={3} className="text-muted small p-3">No items nearing expiry.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-3 shadow-sm">
        <div className="fw-semibold mb-2">Sales Trends</div>
        <SalesLine data={trend} />
      </div>
    </div>
  )
}
