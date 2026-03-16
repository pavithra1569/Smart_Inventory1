require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Bill = require('../models/Bill');

async function connect() {
  await mongoose.connect(process.env.MONGO_URI);
}

function daysFromNow(days){
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function seed(){
  try{
    await connect();
    console.log('Connected to MongoDB');

    const sampleProducts = [
      { name: 'SuperGrow Fertilizer', category: 'Fertilizer', price: 250, quantity: 50, unit: 'kg', expiry: daysFromNow(365) },
      { name: 'Hybrid Maize Seed', category: 'Seed', price: 120, quantity: 200, unit: 'kg', expiry: daysFromNow(540) },
      { name: 'CropShield Insecticide', category: 'Medicine', price: 75, quantity: 80, unit: 'litre', expiry: daysFromNow(720) },
      { name: 'WeedAway Herbicide', category: 'Herbicides', price: 150, quantity: 40, unit: 'litre', expiry: daysFromNow(540) },
      { name: 'FungiStop Fungicide', category: 'Fungicides', price: 180, quantity: 60, unit: 'litre', expiry: daysFromNow(600) },
      { name: 'Tablets TAB', category: 'Medicine', price: 50, quantity: 120, unit: 'pcs', expiry: daysFromNow(365) }
    ];

    const inserted = [];
    for(const p of sampleProducts){
      const prod = await Product.findOneAndUpdate({ name: p.name }, p, { upsert:true, new:true, setDefaultsOnInsert:true });
      inserted.push(prod);
    }
    console.log('Upserted products:', inserted.map(p=>p.name).join(', '));

    // create sample bills (some recent, some previous months)
    const now = new Date();
    const sampleBills = [
      { offsetDays: 0, items: [{ name: 'Tablets TAB', qty: 2 }, { name: 'SuperGrow Fertilizer', qty: 1 }] },
      { offsetDays: 3, items: [{ name: 'Hybrid Maize Seed', qty: 10 }] },
      { offsetDays: 30, items: [{ name: 'CropShield Insecticide', qty: 3 }] },
      { offsetDays: 60, items: [{ name: 'WeedAway Herbicide', qty: 2 }, { name: 'FungiStop Fungicide', qty:1 }] },
      { offsetDays: 120, items: [{ name: 'Tablets TAB', qty: 5 }] }
    ];

    for(const sb of sampleBills){
      const billItems = [];
      let grandTotal = 0;
      for(const it of sb.items){
        const prod = await Product.findOne({ name: it.name });
        if(!prod) continue;
        const qty = it.qty;
        // decrement stock (ensure not negative)
        const newQty = Math.max(0, prod.quantity - qty);
        prod.quantity = newQty;
        await prod.save();

        billItems.push({ productId: prod._id, quantity: qty, unitPrice: prod.price, total: prod.price * qty });
        grandTotal += prod.price * qty;
      }
      const billDate = new Date(now.getTime() - (sb.offsetDays * 24*60*60*1000));
      const bill = new Bill({ items: billItems, grandTotal, createdAt: billDate, updatedAt: billDate });
      await bill.save();
      console.log('Inserted bill on', billDate.toISOString(), 'total', grandTotal);
    }

    console.log('Seeding completed.');
    process.exit(0);
  }catch(err){
    console.error('Seed error', err);
    process.exit(1);
  }
}

seed();
