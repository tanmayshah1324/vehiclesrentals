export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'car' | 'bike';
  brand: string;
  model: string;
  year: number;
  images: string[];
  price: {
    hourly: number;
    daily: number;
    weekly: number;
  };
  specifications: {
    seats?: number;
    fuelType?: string;
    transmission?: string;
    engineCapacity?: string;
    mileage?: string;
    features: string[];
  };
  availability: boolean;
  rating: number;
  reviews: number;
}

export interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid';
  createdAt: string;
}

export interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pickupLocation: string;
  startDate: string;
  endDate: string;
  rentalType: 'hourly' | 'daily' | 'weekly';
}