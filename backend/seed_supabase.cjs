const { createClient } = require('@supabase/supabase-js');
const db = require('./db.json');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://ckiqrybmvkogklxjtvun.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_secret_key';
const WebSocket = require('ws');
const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: { transport: WebSocket },
    global: { fetch: (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)) }
});

async function seed() {
    console.log('Starting seed process...');
    
    // Seed Vehicles
    if (db.vehicles && db.vehicles.length > 0) {
        console.log(`Inserting ${db.vehicles.length} vehicles...`);
        for (const v of db.vehicles) {
            const vehicleToBackend = {
                name: v.name,
                type: v.type || '',
                brand: v.brand,
                model: v.model,
                year: v.year,
                images: v.images,
                price_hourly: v.price?.hourly || 0,
                price_daily: v.price?.daily || 0,
                price_weekly: v.price?.weekly || 0,
                price_monthly: v.price?.monthly || 0,
                registration_number: v.registrationNumber || '',
                category: v.category || '',
                rental_hub: v.rentalHub || '',
                insurance_expiry: v.insuranceExpiry || '',
                puc_expiry: v.pucExpiry || '',
                engine_capacity: v.specifications?.engineCapacity || '',
                mileage: v.specifications?.mileage || '',
                features: v.specifications?.features || [],
                seats: v.specifications?.seats || 5,
                fuel_type: v.specifications?.fuelType || 'Petrol',
                transmission: v.specifications?.transmission || 'Automatic',
                availability: v.availability,
                rating: v.rating || 5.0,
                reviews: v.reviews || 0
            };
            const { error } = await supabase.from('vehicles').insert(vehicleToBackend);
            if (error) console.error(`Error inserting ${v.name}:`, error.message);
            else console.log(`Inserted ${v.name}`);
        }
    }
    
    // Seed Hubs
    if (db.hubs && db.hubs.length > 0) {
        console.log(`\nInserting ${db.hubs.length} hubs...`);
        for (const h of db.hubs) {
             const hubToBackend = {
                name: h.name,
                address: h.address,
                latitude: h.latitude,
                longitude: h.longitude
            };
            const { error } = await supabase.from('rental_hubs').insert(hubToBackend);
            if (error) console.error(`Error inserting ${h.name}:`, error.message);
            else console.log(`Inserted ${h.name}`);
        }
    }

    console.log('\nSeed process complete!');
}

seed();
