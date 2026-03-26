import React, { useEffect, useMemo, useState } from 'react'
import { getProducts, generateBill, getBills } from '../services/api'

export default function Billing(){
  const [products, setProducts] = useState([])
  const [items, setItems] = useState([{ productId:'', qty:1 }])
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [bills, setBills] = useState([])
  
  useEffect(()=>{ getProducts().then(setProducts) },[])
  useEffect(()=>{ loadBills() },[])

  const loadBills = async () => {
    try {
      const data = await getBills()
      setBills(data)
    } catch (err) {
      console.error('Failed to load bills', err)
    }
  }
  
  const addRow = () => setItems([...items, { productId:'', qty:1 }])
  const updateRow = (i, field, value) => setItems(items.map((r,idx)=> idx===i ? { ...r, [field]: value } : r))
  const removeRow = i => setItems(items.filter((_,idx)=>idx!==i))
  const enriched = useMemo(()=> items.map(r=> ({...r, product: products.find(p=>p.id===r.productId)})),[items,products])
  const total = useMemo(()=> enriched.reduce((s,r)=> s + ((r.product?.price||0) * (Number(r.qty)||0)), 0), [enriched])
  
  const submit = async (e) => { 
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Validation
    const validItems = enriched.filter(r => r.productId && r.product && r.qty > 0)
    if (validItems.length === 0) {
      setError('Please add at least one valid item to the bill')
      return
    }
    
    if (total === 0) {
      setError('Bill total cannot be zero')
      return
    }
    
    setLoading(true)
    try {
      await generateBill(validItems, total)
      setSuccess('Bill generated successfully and stocks updated!')
      setTimeout(()=>setSuccess(''), 2000)
      setItems([{productId:'', qty:1}])
      // Refresh products to show updated stock
      const updatedProducts = await getProducts()
      setProducts(updatedProducts)
      // Refresh bill history
      await loadBills()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate bill')
    } finally {
      setLoading(false)
    }
  }

  const downloadBillPDF = () => {
    const billHtml = `
      <html>
      <head>
        <title>Bill</title>
        <style> body{font-family: Arial, Helvetica, sans-serif; padding:20px} .item{margin-bottom:8px} .total{font-weight:bold; margin-top:12px} </style>
      </head>
      <body>
        <h3>Smart Agro-Retail - Bill</h3>
        <div>
          ${enriched.filter(r=>r.product).map(r=>`<div class="item">${r.product.name} x ${r.qty} = ₹${(r.product.price||0) * (Number(r.qty)||0)}</div>`).join('')}
        </div>
        <div class="total">Grand Total: ₹${total}</div>
      </body>
      </html>
    `
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(billHtml)
    w.document.close()
    w.focus()
    setTimeout(()=>{ w.print(); /* w.close(); */ }, 300)
  }
  
  return (
    <div className="d-grid gap-3">
      <h5>Billing / Sales</h5>
      {success && <div className="alert alert-success py-2">{success}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <form onSubmit={submit} className="card p-3 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th style={{minWidth:220}}>Product</th>
                <th style={{width:140}}>Quantity</th>
                <th style={{width:140}}>Unit Price</th>
                <th style={{width:140}}>Total</th>
                <th style={{width:80}}></th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((r,i)=> (
                <tr key={i}>
                  <td>
                    <select className="form-select" value={r.productId} onChange={e=>updateRow(i,'productId', e.target.value)}>
                      <option value="">Select product</option>
                      {products.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                  <td>
                    <input type="number" className="form-control" min={1} value={r.qty} onChange={e=>updateRow(i,'qty', e.target.value)} />
                  </td>
                  <td>₹{r.product?.price||0}</td>
                  <td>₹{(r.product?.price||0) * (Number(r.qty)||0)}</td>
                  <td>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>removeRow(i)} disabled={items.length===1}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <button type="button" className="btn btn-light" onClick={addRow}>Add Item</button>
          <div className="fs-5">Grand Total: <span className="fw-bold">₹{total}</span></div>
        </div>
        <div className="mt-3 d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={downloadBillPDF} disabled={enriched.filter(r=>r.product).length===0}>Download PDF</button>
          <button className="btn btn-agro" disabled={loading}>{loading ? 'Generating...' : 'Generate Bill'}</button>
        </div>
      </form>
      <div className="card p-3 shadow-sm">
        <div className="fw-semibold mb-2">Bill Preview</div>
        <div className="d-flex justify-content-between">
          <div>
            {enriched.filter(r=>r.product).map((r,i)=> (
              <div key={i} className="small">{r.product.name} x {r.qty} = ₹{(r.product.price||0) * (Number(r.qty)||0)}</div>
            ))}
          </div>
          <div className="fw-bold">₹{total}</div>
        </div>
      </div>
      <div className="card p-3 shadow-sm">
        <div className="fw-semibold mb-2">Bill History</div>
        <div className="table-responsive">
          <table className="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Items</th>
                <th className="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(b => (
                <tr key={b.id}>
                  <td>{new Date(b.createdAt || b.created_at || b.date).toLocaleString()}</td>
                  <td className="small">
                    {b.items.map(it => `${it.productId?.name || it.productName || ''} x ${it.quantity}`).join(', ')}
                  </td>
                  <td className="text-end">₹{b.grandTotal || b.total || 0}</td>
                </tr>
              ))}
              {bills.length===0 && <tr><td colSpan={3} className="text-center text-muted">No bills yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
