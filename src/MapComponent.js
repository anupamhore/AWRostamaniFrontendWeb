import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';



const MapComponent = () => {
  const [locations, setLocations] = useState({
    latitude: 24.858342986399865,
    longitude: 55.066739235969116,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [pageNo, setPageNo] = useState(1); // Since we are using pagination,to retrieve the location data, hence we use PageNumber
  const [totalPageCount, setTotalPageCount] = useState(0); // Total page count to stop tracking once all the pages are fetched
  const [isTracking, setIsTracking] = useState(false); // To start/stop tracking


  useEffect(() => {
    socket.on('locationUpdate', (data) => {
      setLocations((prevLocations) => ({
        ...prevLocations,
        [data.vehicleId]: data.location,
      }));
    });
  }, []);

  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {Object.keys(locations).map((vehicleId) => (
        <Marker key={vehicleId} position={[locations[vehicleId].latitude, locations[vehicleId].longitude]}>
          <Popup>{vehicleId}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
