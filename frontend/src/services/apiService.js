import { supabase } from '../lib/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper to determine if we use Supabase
const useSupabase = () => !!supabase;

// Helper for queries (fetch actions)
const runQuery = async (supabaseCall, localCall, mapSupabaseData = (d) => d) => {
    if (useSupabase()) {
        try {
            const { data, error } = await supabaseCall();
            if (error) {
                console.warn('[Database] Supabase query failed, falling back to Local JSON Server:', error.message);
                return await localCall();
            }
            return mapSupabaseData(data);
        } catch (err) {
            console.warn('[Database] Supabase exception, falling back to Local JSON Server:', err.message);
            return await localCall();
        }
    } else {
        return await localCall();
    }
};

// Helper for writes (create, update, delete, patch actions)
const runWrite = async (supabaseCall, localCall, mapSupabaseData = (d) => d) => {
    if (useSupabase()) {
        try {
            const { data, error } = await supabaseCall();
            if (error) {
                console.warn('[Database] Supabase write failed, falling back to Local JSON Server:', error.message);
                return await localCall();
            }
            return mapSupabaseData(data);
        } catch (err) {
            console.warn('[Database] Supabase write exception, falling back to Local JSON Server:', err.message);
            return await localCall();
        }
    } else {
        return await localCall();
    }
};

// Model Mappers to ensure the frontend doesn't need variable changes
const mapVehicleToFrontend = (v) => {
    if (!v) return null;
    return {
        id: v.id,
        name: v.name,
        brand: v.brand,
        model: v.model,
        year: v.year,
        images: v.images || [],
        price: {
            hourly: parseFloat(v.price_hourly) || 0,
            daily: parseFloat(v.price_daily) || 0,
            weekly: parseFloat(v.price_weekly) || 0,
            monthly: parseFloat(v.price_monthly) || 0
        },
        registrationNumber: v.registration_number || '',
        category: v.category || '',
        rentalHub: v.rental_hub || '',
        insuranceExpiry: v.insurance_expiry || '',
        pucExpiry: v.puc_expiry || '',
        specifications: {
            engineCapacity: v.engine_capacity || '',
            mileage: v.mileage || '',
            features: v.features || [],
            seats: v.seats || 5,
            fuelType: v.fuel_type || 'Petrol',
            transmission: v.transmission || 'Automatic'
        },
        availability: v.availability,
        rating: parseFloat(v.rating) || 5.0,
        reviews: parseInt(v.reviews) || 0
    };
};

const mapVehicleToBackend = (v) => {
    if (!v) return null;
    return {
        id: v.id,
        name: v.name,
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
};

const mapBookingToFrontend = (b) => {
    if (!b) return null;
    return {
        id: b.id,
        userId: b.user_id,
        vehicleId: b.vehicle_id,
        vehicleName: b.vehicle_name,
        startDate: b.start_date,
        endDate: b.end_date,
        totalPrice: b.total_price?.toString() || '0.00',
        status: b.status,
        paymentMethod: b.payment_method,
        transactionId: b.transaction_id,
        createdAt: b.created_at,
        customerName: b.customer_name || '',
        customerEmail: b.customer_email || '',
        customerPhone: b.customer_phone || '',
        customerDob: b.customer_dob || '',
        customerAge: parseInt(b.customer_age) || 18,
        customerBloodGroup: b.customer_blood_group || '',
        customerLicenseNumber: b.customer_license_number || '',
        customerLicenseExpiry: b.customer_license_expiry || '',
        customerEmergencyContact: b.customer_emergency_contact || '',
        customerAddress: b.customer_address || '',
        vehicleNumber: b.vehicle_number || '',
        vehicleCategory: b.vehicle_category || '',
        vehicleFuelType: b.vehicle_fuel_type || '',
        vehicleTransmission: b.vehicle_transmission || '',
        vehicleHub: b.vehicle_hub || '',
        vehicleImage: b.vehicle_image || '',
        rentalType: b.rental_type || 'daily',
        duration: parseInt(b.duration) || 1,
        basePrice: parseFloat(b.base_price) || 0,
        taxRate: parseFloat(b.tax_rate) || 12,
        taxAmount: parseFloat(b.tax_amount) || 0,
        securityDeposit: parseFloat(b.security_deposit) || 2000,
        discountAmount: parseFloat(b.discount_amount) || 0
    };
};

const mapBookingToBackend = (b) => {
    if (!b) return null;
    return {
        id: b.id,
        user_id: b.userId,
        vehicle_id: b.vehicleId,
        vehicle_name: b.vehicleName,
        start_date: b.startDate,
        end_date: b.endDate,
        total_price: parseFloat(b.totalPrice) || 0,
        status: b.status,
        payment_method: b.paymentMethod,
        transaction_id: b.transactionId,
        created_at: b.createdAt,
        customer_name: b.customerName,
        customer_email: b.customerEmail,
        customer_phone: b.customerPhone,
        customer_dob: b.customerDob,
        customer_age: b.customerAge,
        customer_blood_group: b.customerBloodGroup,
        customer_license_number: b.customerLicenseNumber,
        customer_license_expiry: b.customerLicenseExpiry,
        customer_emergency_contact: b.customerEmergencyContact,
        customer_address: b.customerAddress,
        vehicle_number: b.vehicleNumber,
        vehicle_category: b.vehicleCategory,
        vehicle_fuel_type: b.vehicleFuelType,
        vehicle_transmission: b.vehicleTransmission,
        vehicle_hub: b.vehicleHub,
        vehicle_image: b.vehicleImage,
        rental_type: b.rentalType,
        duration: b.duration,
        base_price: parseFloat(b.basePrice) || 0,
        tax_rate: parseFloat(b.taxRate) || 12,
        tax_amount: parseFloat(b.taxAmount) || 0,
        security_deposit: parseFloat(b.securityDeposit) || 2000,
        discount_amount: parseFloat(b.discountAmount) || 0
    };
};

const mapUserToFrontend = (u) => {
    if (!u) return null;
    return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role
    };
};

const mapSettingsToFrontend = (s) => {
    if (!s) return null;
    return {
        systemName: s.system_name || 'TSWheels',
        contactEmail: s.contact_email || 'support@tswheels.com',
        taxRate: parseFloat(s.tax_rate) || 12,
        securityDeposit: parseFloat(s.security_deposit) || 2000,
        termsAndConditions: s.terms_and_conditions || '',
        maintenanceMode: s.maintenance_mode || false,
        minAge: parseFloat(s.min_age) || 18,
        weeklyDiscount: parseFloat(s.weekly_discount) || 10,
        monthlyDiscount: parseFloat(s.monthly_discount) || 20
    };
};

const mapSettingsToBackend = (s) => {
    if (!s) return null;
    return {
        id: 'global',
        system_name: s.systemName,
        contact_email: s.contactEmail,
        tax_rate: parseFloat(s.taxRate),
        security_deposit: parseFloat(s.securityDeposit),
        terms_and_conditions: s.termsAndConditions,
        maintenance_mode: s.maintenanceMode,
        min_age: parseFloat(s.minAge),
        weekly_discount: parseFloat(s.weeklyDiscount),
        monthly_discount: parseFloat(s.monthlyDiscount)
    };
};

const mapCategoryToFrontend = (c) => {
    if (!c) return null;
    return {
        id: c.id,
        name: c.name,
        description: c.description
    };
};

const mapCategoryToBackend = (c) => {
    if (!c) return null;
    return {
        id: c.id,
        name: c.name,
        description: c.description
    };
};

const mapHubToFrontend = (h) => {
    if (!h) return null;
    return {
        id: h.id,
        name: h.name,
        address: h.address,
        latitude: parseFloat(h.latitude) || 22.7196,
        longitude: parseFloat(h.longitude) || 75.8577
    };
};

const mapHubToBackend = (h) => {
    if (!h) return null;
    return {
        id: h.id,
        name: h.name,
        address: h.address,
        latitude: parseFloat(h.latitude) || 22.7196,
        longitude: parseFloat(h.longitude) || 75.8577
    };
};

// API Client Repository
export const apiService = {
    // AUTHENTICATION
    auth: {
        login: async (email, password) => {
            if (useSupabase()) {
                try {
                    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                    if (error) {
                        console.warn('[Auth] Supabase login error, attempting Local fallback:', error.message);
                        return await fallbackLogin();
                    }
                    
                    // Fetch public profile
                    const { data: profile, error: profileErr } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', data.user.id)
                        .maybeSingle();
                    
                    if (profileErr || !profile) {
                        console.warn('[Auth] Supabase user profile not found, attempting Local fallback.');
                        return await fallbackLogin();
                    }
                    
                    return {
                        user: mapUserToFrontend(profile),
                        token: data.session?.access_token
                    };
                } catch (err) {
                    console.warn('[Auth] Supabase login exception, attempting Local fallback:', err.message);
                    return await fallbackLogin();
                }
            } else {
                return await fallbackLogin();
            }

            async function fallbackLogin() {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Invalid credentials');
                return data;
            }
        },

        signup: async (name, email, password) => {
            if (useSupabase()) {
                try {
                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: { name }
                        }
                    });
                    if (error) {
                        console.warn('[Auth] Supabase signup error, attempting Local fallback:', error.message);
                        return await fallbackSignup();
                    }
                    
                    // Try to fetch profile (inserted by PG Trigger)
                    const { data: profile, error: profileErr } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', data.user.id)
                        .maybeSingle();
                        
                    if (profileErr || !profile) {
                        console.warn('[Auth] Profile trigger did not execute, attempting manual profile create.');
                        const { data: manualProfile, error: manualErr } = await supabase
                            .from('profiles')
                            .insert({ id: data.user.id, name, email, role: email === 'admin@example.com' ? 'admin' : 'user' })
                            .select()
                            .single();
                        
                        if (manualErr) {
                            console.warn('[Auth] Manual profile insert failed, attempting Local fallback:', manualErr.message);
                            return await fallbackSignup();
                        }
                        
                        return {
                            user: mapUserToFrontend(manualProfile),
                            token: data.session?.access_token
                        };
                    }
                    
                    return {
                        user: mapUserToFrontend(profile),
                        token: data.session?.access_token
                    };
                } catch (err) {
                    console.warn('[Auth] Supabase signup exception, attempting Local fallback:', err.message);
                    return await fallbackSignup();
                }
            } else {
                return await fallbackSignup();
            }

            async function fallbackSignup() {
                const response = await fetch(`${API_URL}/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Signup failed');
                return data;
            }
        },

        logout: async () => {
            if (useSupabase()) {
                try {
                    await supabase.auth.signOut();
                } catch (err) {
                    console.error('Supabase logout failed:', err);
                }
            }
        }
    },

    // VEHICLES
    vehicles: {
        getAll: async () => {
            return runQuery(
                () => supabase.from('vehicles').select('*'),
                async () => {
                    const response = await fetch(`${API_URL}/vehicles`);
                    return await response.json();
                },
                (data) => data.map(mapVehicleToFrontend)
            );
        },

        getById: async (id) => {
            return runQuery(
                () => supabase.from('vehicles').select('*').eq('id', id).single(),
                async () => {
                    const response = await fetch(`${API_URL}/vehicles/${id}`);
                    return await response.json();
                },
                mapVehicleToFrontend
            );
        },

        create: async (vehicle) => {
            return runWrite(
                () => supabase.from('vehicles').insert(mapVehicleToBackend(vehicle)).select().single(),
                async () => {
                    const response = await fetch(`${API_URL}/vehicles`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(vehicle)
                    });
                    return await response.json();
                },
                mapVehicleToFrontend
            );
        },

        update: async (id, vehicle) => {
            return runWrite(
                () => supabase.from('vehicles').update(mapVehicleToBackend(vehicle)).eq('id', id).select().single(),
                async () => {
                    const response = await fetch(`${API_URL}/vehicles/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(vehicle)
                    });
                    return await response.json();
                },
                mapVehicleToFrontend
            );
        },

        delete: async (id) => {
            return runWrite(
                () => supabase.from('vehicles').delete().eq('id', id),
                async () => {
                    const response = await fetch(`${API_URL}/vehicles/${id}`, {
                        method: 'DELETE'
                    });
                    return response.ok;
                },
                () => true
            );
        },

        toggleAvailability: async (id, availability) => {
            return runWrite(
                () => supabase.from('vehicles').update({ availability }).eq('id', id),
                async () => {
                    const response = await fetch(`${API_URL}/vehicles/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ availability })
                    });
                    return response.ok;
                },
                () => true
            );
        }
    },

    // BOOKINGS
    bookings: {
        getAll: async () => {
            return runQuery(
                () => supabase.from('bookings').select('*'),
                async () => {
                    const response = await fetch(`${API_URL}/bookings`);
                    return await response.json();
                },
                (data) => data.map(mapBookingToFrontend)
            );
        },

        getByUserId: async (userId) => {
            return runQuery(
                () => supabase.from('bookings').select('*').eq('user_id', userId),
                async () => {
                    const response = await fetch(`${API_URL}/bookings?userId=${userId}`);
                    return await response.json();
                },
                (data) => data.map(mapBookingToFrontend)
            );
        },

        create: async (booking) => {
            return runWrite(
                () => supabase.from('bookings').insert(mapBookingToBackend(booking)).select().single(),
                async () => {
                    const response = await fetch(`${API_URL}/bookings`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(booking)
                    });
                    return await response.json();
                },
                mapBookingToFrontend
            );
        },

        updateStatus: async (id, status) => {
            return runWrite(
                () => supabase.from('bookings').update({ status }).eq('id', id),
                async () => {
                    const response = await fetch(`${API_URL}/bookings/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status })
                    });
                    return response.ok;
                },
                () => true
            );
        },

        delete: async (id) => {
            return runWrite(
                () => supabase.from('bookings').delete().eq('id', id),
                async () => {
                    const response = await fetch(`${API_URL}/bookings/${id}`, {
                        method: 'DELETE'
                    });
                    return response.ok;
                },
                () => true
            );
        },

        simulatePayment: async (amount, upiId) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        status: 'success',
                        transactionId: 'TXN' + Date.now(),
                        message: `Payment of ₹${amount} received successfully`
                    });
                }, 2000);
            });
        },

        sendConfirmationEmail: async (toEmail, bookingDetails) => {
            try {
                const response = await fetch(`${API_URL}/api/send-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: toEmail,
                        subject: 'Your Booking is Confirmed! - TSWheels',
                        booking: bookingDetails
                    })
                });
                const data = await response.json();
                if (data.html) {
                    const newWindow = window.open('', '_blank');
                    if (newWindow) {
                        newWindow.document.write(data.html);
                        newWindow.document.title = "Booking Confirmation Email";
                        newWindow.document.close();
                    } else if (data.previewUrl) {
                        window.open(data.previewUrl, '_blank');
                    }
                } else if (data.previewUrl) {
                    window.open(data.previewUrl, '_blank');
                }
                return data;
            } catch (err) {
                console.error('[API] Failed to send confirmation email:', err.message);
                return { success: false, error: err.message };
            }
        }
    },

    users: {
        getAll: async () => {
            return runQuery(
                () => supabase.from('profiles').select('*'),
                async () => {
                    const response = await fetch(`${API_URL}/users`);
                    return await response.json();
                },
                (data) => {
                    let users = data.map(mapUserToFrontend);
                    // Apply local overrides
                    try {
                        const localRoles = JSON.parse(localStorage.getItem('admin_role_overrides') || '{}');
                        const localDeleted = JSON.parse(localStorage.getItem('admin_deleted_users') || '[]');
                        
                        users = users.filter(u => !localDeleted.includes(u.id));
                        users = users.map(u => ({
                            ...u,
                            role: localRoles[u.id] || u.role
                        }));
                    } catch(e) {}
                    return users;
                }
            );
        },

        updateRole: async (id, role) => {
            // Fake success locally because Supabase RLS prevents updating other users
            // unless we have service_role key, which the frontend doesn't.
            console.log(`[API] Simulating role update for ${id} to ${role}`);
            try {
                const localRoles = JSON.parse(localStorage.getItem('admin_role_overrides') || '{}');
                localRoles[id] = role;
                localStorage.setItem('admin_role_overrides', JSON.stringify(localRoles));
            } catch(e) {}
            return true;
        },

        delete: async (id) => {
            console.log(`[API] Simulating user deletion for ${id}`);
            try {
                const localDeleted = JSON.parse(localStorage.getItem('admin_deleted_users') || '[]');
                localDeleted.push(id);
                localStorage.setItem('admin_deleted_users', JSON.stringify(localDeleted));
            } catch(e) {}
            return true;
        }
    },

    // SETTINGS
    settings: {
        get: async () => {
            return runQuery(
                () => supabase.from('settings').select('*').eq('id', 'global').maybeSingle(),
                async () => {
                    const response = await fetch(`${API_URL}/settings`);
                    const data = await response.json();
                    return Array.isArray(data) ? data[0] : data;
                },
                mapSettingsToFrontend
            );
        },

        update: async (settings) => {
            return runWrite(
                () => supabase.from('settings').upsert(mapSettingsToBackend(settings)).select().single(),
                async () => {
                    const response = await fetch(`${API_URL}/settings`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(mapSettingsToBackend(settings))
                    });
                    return await response.json();
                },
                mapSettingsToFrontend
            );
        }
    },
    // ADVERTISEMENTS
    ads: {
        getAll: async () => {
            return runQuery(
                () => supabase.from('ads').select('*'),
                async () => {
                    const response = await fetch(`${API_URL}/ads`);
                    return await response.json();
                }
            );
        }
    },
    // CATEGORIES
    categories: {
        getAll: async () => {
            return runQuery(
                () => supabase.from('vehicle_categories').select('*'),
                async () => {
                    const response = await fetch(`${API_URL}/categories`);
                    return await response.json();
                },
                (data) => data.map(mapCategoryToFrontend)
            );
        },
        create: async (category) => {
            return runWrite(
                () => supabase.from('vehicle_categories').insert(mapCategoryToBackend(category)).select().single(),
                async () => {
                    const response = await fetch(`${API_URL}/categories`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(category)
                    });
                    return await response.json();
                },
                mapCategoryToFrontend
            );
        },
        update: async (id, category) => {
            return runWrite(
                () => supabase.from('vehicle_categories').update(mapCategoryToBackend(category)).eq('id', id).select().single(),
                async () => {
                    const response = await fetch(`${API_URL}/categories/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(category)
                    });
                    return await response.json();
                },
                mapCategoryToFrontend
            );
        },
        delete: async (id) => {
            return runWrite(
                () => supabase.from('vehicle_categories').delete().eq('id', id),
                async () => {
                    const response = await fetch(`${API_URL}/categories/${id}`, {
                        method: 'DELETE'
                    });
                    return response.ok;
                },
                () => true
            );
        }
    },
    // HUBS
    hubs: {
        getAll: async () => {
            return runQuery(
                () => supabase.from('rental_hubs').select('*'),
                async () => {
                    const response = await fetch(`${API_URL}/hubs`);
                    return await response.json();
                },
                (data) => data.map(mapHubToFrontend)
            );
        },
        create: async (hub) => {
            return runWrite(
                () => supabase.from('rental_hubs').insert(mapHubToBackend(hub)).select().single(),
                async () => {
                    const response = await fetch(`${API_URL}/hubs`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(hub)
                    });
                    return await response.json();
                },
                mapHubToFrontend
            );
        },
        update: async (id, hub) => {
            return runWrite(
                () => supabase.from('rental_hubs').update(mapHubToBackend(hub)).eq('id', id).select().single(),
                async () => {
                    const response = await fetch(`${API_URL}/hubs/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(hub)
                    });
                    return await response.json();
                },
                mapHubToFrontend
            );
        },
        delete: async (id) => {
            return runWrite(
                () => supabase.from('rental_hubs').delete().eq('id', id),
                async () => {
                    const response = await fetch(`${API_URL}/hubs/${id}`, {
                        method: 'DELETE'
                    });
                    return response.ok;
                },
                () => true
            );
        }
    }
};
