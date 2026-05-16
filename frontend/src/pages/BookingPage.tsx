import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BookingForm from '../components/booking/BookingForm';
import { vehicles } from '../data/vehicles';

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const vehicle = vehicles.find(v => v.id === id);

  useEffect(() => {
    if (vehicle) {
      document.title = `Book ${vehicle.name} - TSWheels`;
    } else {
      document.title = 'Booking - TSWheels';
    }
  }, [vehicle]);

  return (
    <div>
      <BookingForm />
    </div>
  );
};

export default BookingPage;