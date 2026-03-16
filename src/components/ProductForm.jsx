import React, { useEffect, useState } from 'react'

export default function ProductForm({ onSubmit, onCancel, initial }){
  const [form, setForm] = useState({ name:'', category:'Fertilizer', price:'', quantity:'', unit:'pcs', expiry:'' })
  const [errors, setErrors] = useState({})
  
  useEffect(()=>{ 
    if(initial) {
      setForm({
        ...initial,
        expiry: initial.expiry ? new Date(initial.expiry).toISOString().split('T')[0] : ''
      })
    }
  },[initial])
  
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  
  const validate = () => {
    const e = {}
    if(!form.name) e.name = 'Required'
    if(!form.price || Number(form.price)<=0) e.price = 'Enter valid price'
    if(!form.quantity || Number(form.quantity)<0) e.quantity = 'Enter valid quantity'
    if(!form.expiry) e.expiry = 'Required'
    setErrors(e)
    return Object.keys(e).length===0
  }
  
  const submit = ev => { 
    ev.preventDefault()
    if(validate()) {
      onSubmit({ 
        ...form, 
        price: Number(form.price), 
        quantity: Number(form.quantity),
        expiry: new Date(form.expiry).toISOString()
      }) 
    }
  }
  
  return (
    <form onSubmit={submit} className="row g-3">
      <div className="col-md-6">
        <label className="form-label">Product Name</label>
        <input className={`form-control ${errors.name?'is-invalid':''}`} name="name" value={form.name} onChange={handleChange} />
        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
      </div>
      <div className="col-md-4">
        <label className="form-label">Category</label>
        <select className="form-select" name="category" value={form.category} onChange={handleChange}>
          <option>Fertilizer</option>
          <option>Seed</option>
          <option>Medicine</option>
          <option>Herbicides</option>
          <option>Fungicides</option>
          <option>Insecticides</option>
        </select>
      </div>
      <div className="col-md-2">
        <label className="form-label">Unit</label>
        <select className="form-select" name="unit" value={form.unit} onChange={handleChange}>
          <option value="pcs">pcs</option>
          <option value="kg">kg</option>
          <option value="litre">litre</option>
        </select>
      </div>
      <div className="col-md-4">
        <label className="form-label">Price</label>
        <input type="number" className={`form-control ${errors.price?'is-invalid':''}`} name="price" value={form.price} onChange={handleChange} />
        {errors.price && <div className="invalid-feedback">{errors.price}</div>}
      </div>
      <div className="col-md-4">
        <label className="form-label">Quantity</label>
        <input type="number" className={`form-control ${errors.quantity?'is-invalid':''}`} name="quantity" value={form.quantity} onChange={handleChange} />
        {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
      </div>
      <div className="col-md-4">
        <label className="form-label">Expiry Date</label>
        <input type="date" className={`form-control ${errors.expiry?'is-invalid':''}`} name="expiry" value={form.expiry} onChange={handleChange} />
        {errors.expiry && <div className="invalid-feedback">{errors.expiry}</div>}
      </div>
      <div className="col-12 d-flex gap-2 justify-content-end">
        <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>
        <button className="btn btn-agro">Save</button>
      </div>
    </form>
  )
}
