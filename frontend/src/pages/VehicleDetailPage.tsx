import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VehicleDetails from '../components/vehicles/VehicleDetails';
import { vehicles } from '../data/vehicles';

const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const vehicle = vehicles.find(v => v.id === id);

  useEffect(() => {
    if (vehicle) {
      document.title = `${vehicle.name} - TSWheels`;
    } else {
      document.title = 'Vehicle Not Found - TSWheels';
    }
  }, [vehicle]);

  return (
    <div>
      <VehicleDetails />
    </div>
  );
};

export default VehicleDetailPage;