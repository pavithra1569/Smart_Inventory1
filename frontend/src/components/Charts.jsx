import React from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function SalesLine({ data }){
  return (
    <div style={{width:'100%', height:200}}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top:10, right:20, left:-20, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="sales" stroke="#2e7d32" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SalesBar({ data }){
  return (
    <div style={{width:'100%', height:200}}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top:10, right:20, left:-20, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales" fill="#66bb6a" radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// DemandPie removed with prediction module
