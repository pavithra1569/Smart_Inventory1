import React, { useEffect, useMemo, useState } from 'react'
import { addProduct, deleteProduct, getProducts, updateProduct } from '../services/api'
import ProductForm from '../components/ProductForm'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { useStockThreshold } from '../contexts/StockThresholdContext' 

export default function Products(){
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [q, setQ] = useState('')
  const load = () => getProducts().then(setProducts)
  useEffect(()=>{ load() },[])
  const filtered = useMemo(()=>products.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())),[products,q])
  const onSave = async (data) => {
    if(editing) await updateProduct(editing.id, data)
    else await addProduct(data)
    setShowForm(false); setEditing(null); load()
  }
  const { threshold } = useStockThreshold()
  const stockLabel = (qty) => qty < threshold ? 'Low' : 'Normal'
  return (
    <div className="d-grid gap-3">
      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
        <h5 className="mb-0">Product Management</h5>
        <div className="d-flex gap-2 align-items-center">
          <input className="form-control" placeholder="Search products" value={q} onChange={e=>setQ(e.target.value)} />
          <button className="btn btn-outline-secondary" onClick={() => {
            // export CSV
            const rows = products.map(p => ({
              Name: p.name,
              Category: p.category,
              Unit: p.unit,
              Price: p.price,
              Quantity: p.quantity,
              Expiry: p.expiry
            }))
            const csv = [Object.keys(rows[0]||{}).join(','), ...rows.map(r=>Object.values(r).map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n')
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'products.csv'
            a.click()
            URL.revokeObjectURL(url)
          }}>Export CSV</button>
          <button className="btn btn-outline-secondary" onClick={() => {
            // export PDF via printable window
            const html = `
              <html><head><title>Products</title>
              <style>body{font-family: Arial, Helvetica, sans-serif; padding:20px} table{width:100%; border-collapse:collapse} th,td{border:1px solid #ddd; padding:8px}</style>
              </head><body>
              <h3>Product List</h3>
              <table>
                <thead><tr><th>Name</th><th>Category</th><th>Unit</th><th>Price</th><th>Quantity</th><th>Expiry</th></tr></thead>
                <tbody>
                  ${products.map(p=>`<tr><td>${p.name}</td><td>${p.category}</td><td>${p.unit}</td><td>₹${p.price}</td><td>${p.quantity}</td><td>${p.expiry}</td></tr>`).join('')}
                </tbody>
              </table>
              </body></html>`
            const w = window.open('', '_blank')
            if (!w) return
            w.document.write(html)
            w.document.close()
            setTimeout(()=>{ w.print(); /* w.close(); */ }, 300)
          }}>Export PDF</button>
          <button className="btn btn-agro" onClick={()=>{setShowForm(true); setEditing(null)}}>Add Product</button>
        </div>
      </div>
      {showForm && (
        <div className="card p-3 shadow-sm">
          <ProductForm onSubmit={onSave} onCancel={()=>{setShowForm(false); setEditing(null)}} initial={editing||undefined} />
        </div>
      )}
      <div className="card p-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>                <th>Unit</th>                <th>Price</th>
                <th>Quantity</th>
                <th>Expiry</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p=> (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.unit}</td>
                  <td>₹{p.price}</td>
                  <td className={p.quantity<threshold?'low-stock':''}>{p.quantity}</td>
                  <td>{p.expiry}</td>
                  <td>
                    <span className={`badge ${p.quantity<threshold?'text-bg-danger':'text-bg-success'}`}>{stockLabel(p.quantity)}</span>
                  </td>
                  <td className="text-end">
                    <button className="icon-btn me-2" onClick={()=>{setEditing(p); setShowForm(true)}}><FaEdit/></button>
                    <button className="icon-btn text-danger" onClick={async()=>{await deleteProduct(p.id); load()}}><FaTrash/></button>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && (
                <tr><td colSpan={7} className="text-center text-muted py-4">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
