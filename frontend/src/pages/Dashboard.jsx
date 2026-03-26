import React, { useEffect, useState } from 'react'
import { getDashboardSummary, getLowStock, getProducts, getSalesTrends } from '../services/api'
import { useStockThreshold } from '../contexts/StockThresholdContext'
import { FaTimes, FaBoxOpen, FaExclamationTriangle, FaChartLine, FaChartBar } from 'react-icons/fa'
import { SalesLine } from '../components/Charts'

export default function Dashboard(){
  const [summary, setSummary] = useState({ totalProducts:0, lowStock:0, monthlySales:0, highDemand:0 })
  const [lowStockList, setLowStockList] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [salesTrends, setSalesTrends] = useState([])
  const [modal, setModal] = useState({ show: false, type: null })
  
  const { threshold } = useStockThreshold()
  const role = localStorage.getItem('role')

  useEffect(()=>{
    const loadData = async () => {
      try {
        const summaryData = await getDashboardSummary(threshold)
        setSummary(summaryData)
        
        const products = await getProducts()
        setAllProducts(products)
        
        const lowStock = await getLowStock(threshold)
        setLowStockList(lowStock)
        
        const trends = await getSalesTrends()
        setSalesTrends(trends)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }
    loadData()
  },[threshold])
  
  const getModalContent = () => {
    switch(modal.type) {
      case 'total':
        return {
          title: 'All Products',
          items: allProducts,
          columns: ['name', 'category', 'unit', 'price', 'quantity', 'expiry']
        }
      case 'lowstock':
        return {
          title: 'Low Stock Items',
          items: lowStockList,
          columns: ['name', 'category', 'unit', 'price', 'quantity', 'expiry']
        }
      case 'sales':
        return {
          title: 'Monthly Sales Trends',
          items: salesTrends,
          columns: ['month', 'sales'],
          isTrends: true
        }
      case 'demand':
        const highDemandProducts = allProducts.slice(0, summary.highDemand)
        return {
          title: 'High-Demand Products',
          items: highDemandProducts,
          columns: ['name', 'category', 'quantity', 'price']
        }
      default:
        return null
    }
  }
  
  const modalContent = getModalContent()
  
  return (
    <div className="d-grid gap-4 dashboard-root">
      <div className="row g-3 metrics-row">
        <div className="col-6 col-lg-3">
          <div className="metric-card shadow-sm" onClick={()=>setModal({show:true, type:'total'})}>
            <div className="metric-left">
              <div className="metric-icon bg-primary"><FaBoxOpen/></div>
            </div>
            <div className="metric-right">
              <div className="metric-label">Total Products</div>
              <div className="metric-value">{summary.totalProducts}</div>
            </div>
          </div>
        </div>
        {role === 'admin' && (
          <div className="col-6 col-lg-3">
            <div className="metric-card shadow-sm" onClick={()=>setModal({show:true, type:'lowstock'})}>
              <div className="metric-left">
                <div className="metric-icon bg-warning"><FaExclamationTriangle/></div>
              </div>
              <div className="metric-right">
                <div className="metric-label">Low Stock</div>
                <div className="metric-value">{summary.lowStock}</div>
              </div>
            </div>
          </div>
        )}
        <div className="col-6 col-lg-3">
          <div className="metric-card shadow-sm" onClick={()=>setModal({show:true, type:'sales'})}>
            <div className="metric-left">
              <div className="metric-icon bg-success"><FaChartLine/></div>
            </div>
            <div className="metric-right">
              <div className="metric-label">Monthly Sales</div>
              <div className="metric-value">₹{summary.monthlySales.toLocaleString()}</div>
            </div>
          </div>
        </div>
        {role === 'admin' && (
          <div className="col-6 col-lg-3">
            <div className="metric-card shadow-sm" onClick={()=>setModal({show:true, type:'demand'})}>
              <div className="metric-left">
                <div className="metric-icon bg-info"><FaChartBar/></div>
              </div>
              <div className="metric-right">
                <div className="metric-label">High Demand</div>
                <div className="metric-value">{summary.highDemand}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {role === 'admin' && lowStockList.length>0 && (
        <div className="alert alert-low">
          <div className="fw-semibold mb-1">Low stock alert</div>
          <div className="small">Refill soon: {lowStockList.map(p=>p.name).join(', ')}</div>
        </div>
      )}

      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <div className="card p-3 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="fw-semibold">Sales Trend</div>
              <div className="small text-muted">Monthly</div>
            </div>
            <SalesLine data={salesTrends} />
          </div>
        </div>
        {role === 'admin' && (
          <div className="col-12 col-lg-4">
            <div className="card p-3 shadow-sm">
              <div className="fw-semibold mb-2">Top Low Stock Items</div>
              <div className="list-group list-group-flush">
                {lowStockList.slice(0,6).map((p,i)=> (
                  <div key={p.id||i} className="d-flex justify-content-between align-items-center py-2">
                    <div>
                      <div className="fw-semibold small mb-0">{p.name}</div>
                      <div className="text-muted small">{p.category}</div>
                    </div>
                    <div className={`fw-bold ${p.quantity<threshold?'text-danger':''}`}>{p.quantity}</div>
                  </div>
                ))}
                {lowStockList.length===0 && <div className="text-muted small">No low stock items</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      {modal.show && modalContent && (
        <div className="modal d-block" style={{backgroundColor:'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalContent.title}</h5>
                <button type="button" className="btn-close" onClick={()=>setModal({show:false, type:null})}></button>
              </div>
              <div className="modal-body">
                {modalContent.items.length === 0 ? (
                  <p className="text-muted text-center">No data available</p>
                ) : modalContent.isTrends ? (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th className="text-end">Sales</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalContent.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.month}</td>
                            <td className="text-end">₹{item.sales.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          {modalContent.columns.map(col => (
                            <th key={col} className={col === 'quantity' || col === 'price' || col === 'sales' ? 'text-end' : ''}>
                              {col.charAt(0).toUpperCase() + col.slice(1)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {modalContent.items.map((item, idx) => (
                          <tr key={idx}>
                            {modalContent.columns.map(col => (
                              <td key={col} className={col === 'quantity' || col === 'price' || col === 'sales' ? 'text-end' : ''}>
                                {col === 'expiry' ? new Date(item[col]).toLocaleDateString() : col === 'price' ? `₹${item[col]}` : item[col]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
