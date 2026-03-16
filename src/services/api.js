import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

export async function login({ username, password }){
  if(username && password) return { token: 'ok' }
  throw new Error('Invalid')
}

// Product API calls
export async function getProducts(){
  try {
    const response = await axios.get(`${API_BASE_URL}/products`)
    return response.data.map(product => ({
      ...product,
      id: product._id
    }))
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

export async function addProduct(data){
  try {
    const response = await axios.post(`${API_BASE_URL}/products`, data)
    return {
      ...response.data.product,
      id: response.data.product._id
    }
  } catch (error) {
    console.error('Error adding product:', error)
    throw error
  }
}

export async function updateProduct(id, data){
  try {
    const response = await axios.put(`${API_BASE_URL}/products/${id}`, data)
    return {
      ...response.data.product,
      id: response.data.product._id
    }
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

export async function deleteProduct(id){
  try {
    await axios.delete(`${API_BASE_URL}/products/${id}`)
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}
export async function getLowStock(threshold = 10){
  try {
    const products = await getProducts()
    return products.filter(p => p.quantity < threshold)
  } catch (error) {
    console.error('Error fetching low stock:', error)
    throw error
  }
}

export async function getDashboardSummary(threshold = 10){
  try {
    const products = await getProducts()
    const totalProducts = products.length
    const lowStock = products.filter(p => p.quantity < threshold).length
    // compute monthly sales from bills
    try {
      const resp = await axios.get(`${API_BASE_URL}/bills`)
      const bills = resp.data || []
      const now = new Date()
      const thisMonth = now.getMonth()
      const thisYear = now.getFullYear()
      const monthlySales = bills
        .filter(b => {
          const d = new Date(b.createdAt || b.created_at || b.date || b._id?.getTimestamp?.() )
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear
        })
        .reduce((s,b)=> s + (b.grandTotal || b.total || 0), 0)
      const highDemand = 3
      return { totalProducts, lowStock, monthlySales, highDemand }
    } catch (err) {
      // fallback
      const monthlySales = 0
      const highDemand = 3
      return { totalProducts, lowStock, monthlySales, highDemand }
    }
  } catch (error) {
    console.error('Error fetching dashboard summary:', error)
    throw error
  }
}

export async function getSalesTrends(){
  // generate sales per month for last 12 months from bills
  try {
    const resp = await axios.get(`${API_BASE_URL}/bills`)
    const bills = resp.data || []
    const now = new Date()
    const months = []
    for(let i=11;i>=0;i--){
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1)
      months.push({ key: `${d.getFullYear()}-${d.getMonth()+1}`, label: d.toLocaleString(undefined,{month:'short'}), year: d.getFullYear(), month: d.getMonth(), sales:0 })
    }
    bills.forEach(b => {
      const d = new Date(b.createdAt || b.created_at || b.date)
      const mKey = `${d.getFullYear()}-${d.getMonth()+1}`
      const entry = months.find(x=>x.key===mKey)
      if(entry) entry.sales += (b.grandTotal || b.total || 0)
    })
    return months.map(m=>({ month: m.label, sales: m.sales }))
  } catch (err) {
    console.error('Error fetching bills for trends:', err)
    return []
  }
}

export async function getBills(){
  try {
    const resp = await axios.get(`${API_BASE_URL}/bills`)
    return resp.data.map(b => ({ ...b, id: b._id }))
  } catch (err) {
    console.error('Error fetching bills:', err)
    throw err
  }
}

export async function getExpiryRisks(daysThreshold = 120){
  try {
    const products = await getProducts()
    const now = new Date()
    const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000
    return products
      .map(p => ({
        ...p,
        daysToExpiry: Math.ceil((new Date(p.expiry) - now) / (24*60*60*1000))
      }))
      .filter(p => p.daysToExpiry >= 0 && (new Date(p.expiry) - now) <= thresholdMs)
  } catch (error) {
    console.error('Error fetching expiry risks:', error)
    throw error
  }
}

export async function generateBill(items, grandTotal){
  try {
    const billItems = items.map(item => ({
      productId: item.productId,
      quantity: Number(item.qty)
    }))
    
    const response = await axios.post(`${API_BASE_URL}/bills`, {
      items: billItems,
      grandTotal
    })
    
    return response.data
  } catch (error) {
    console.error('Error generating bill:', error)
    throw error
  }
}

export const api = axios.create({ baseURL: 'http://localhost:5000/api' })
