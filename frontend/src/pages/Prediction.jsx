import React, { useEffect, useMemo, useState } from 'react'
import { getPredictionBreakdown, getPredictions, getProducts } from '../services/api'
import { useStockThreshold } from '../contexts/StockThresholdContext'
import { DemandPie } from '../components/Charts'

export default function Prediction(){
  const [preds, setPreds] = useState([])
  const [pie, setPie] = useState([])
  const [products, setProducts] = useState([])
  useEffect(()=>{
    getPredictions().then(setPreds)
    getPredictionBreakdown().then(setPie)
    getProducts().then(setProducts)
  },[])
  const rows = useMemo(()=> preds.map(p=> ({...p, current: products.find(x=>x.id===p.id)?.quantity||0})), [preds, products])
  const { threshold } = useStockThreshold()
  return (
    <div className="d-grid gap-3">
      <h5>Seasonal Demand Prediction</h5>
      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <div className="card p-3 shadow-sm h-100">
            <div className="fw-semibold mb-2">Expected Demand Levels</div>
            <DemandPie data={pie} />
            <div className="small text-muted">These predictions estimate which items may sell more next month based on season. Stock more of high-demand items to avoid running out.</div>
          </div>
        </div>
        <div className="col-12 col-lg-7">
          <div className="card p-0 shadow-sm">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Stock</th>
                    <th>Expected Demand</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r=> (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td className={r.current<threshold?'low-stock':''}>{r.current}</td>
                      <td>
                        <span className={`badge ${r.level==='High'?'text-bg-success': r.level==='Medium'?'text-bg-warning':'text-bg-danger'}`}>{r.level}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
