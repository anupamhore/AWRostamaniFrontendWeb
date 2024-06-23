import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import classes from './App.css';


// Import marker icons
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';


// Your API URL
const API_URL = process.env.REACT_APP_API_URL;

const markerIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


const App = () => {
  const [location, setLocation] = useState({
    latitude: 24.858342986399865,
    longitude: 55.066739235969116,
  });

  const [pageNo, setPageNo] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [isTracking, setIsTracking] = useState(false);


  /*
    Fetch vehicle location data from the API
    Set the total page count when fetching the first page
    Update the page number when fetching subsequent pages

  */
  const fetchData = async () => {
      try {
        const body = {
          vehicleId: 'Vehicle 1',
          pageNo: pageNo,
        };
        const response = await axios.post(`${API_URL}/api/getVehicleLocation`, body);

        if (response.data.responseCode === 200) {
          const locationObj = response.data.responseData;
          const locationArr = locationObj.location.coordinates;
          const [longitude, latitude] = locationArr;

          if (pageNo === 1) {
            setTotalPageCount(parseInt(locationObj.totalRecords, 10));
          }

          setLocation({ latitude, longitude });

          setPageNo((prevPageNo) => {
            if (prevPageNo >= totalPageCount) {
              setIsTracking(false);
              setPageNo(1);
              return 1; 
            }
            return prevPageNo + 1;
          });
        }
      } catch (error) {
        console.log(error);
      }
    };


    /*
      Fetch vehicle location data every 3 seconds when tracking is enabled
      Clear the interval when tracking is disabled

    */
    useEffect(() => {
      let intervalId = null;
  
      if (isTracking) {
        intervalId = setInterval(() => {
          fetchData();
        }, 3000);
      }
  
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }, [isTracking, pageNo]);


  // Set the initial region for the map
  const region = {
    lat: location.latitude,
    lng: location.longitude,
  };

  return (
    <div className={classes["App"]}>
      <button 
        onClick={() => setIsTracking(!isTracking)} 
        style={{  
          backgroundColor: '#007bff',
          color: '#fff',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 1000,
          marginTop: '20px',
          marginLeft: '10px',
          marginBottom: '10px'}}
      >
        {isTracking ? 'Stop Tracking' : 'Start Tracking'}
      </button>
      <MapContainer
        center={region}
        zoom={13}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {isTracking && (
          <AnimatedMarker position={location} icon={markerIcon} />
        )}

      </MapContainer>

    </div>
  );
};


const AnimatedMarker = ({ position, icon }) => {
  const [currentPosition, setCurrentPosition] = useState(position);
  const markerRef = useRef(null);

  /*
    Animate the marker when the position prop changes
    Calculate the next position based on the current and next latitude and longitude values
    Update the marker position until the animation is complete
  */
  useEffect(() => {
    if (!markerRef.current || !currentPosition) return;

    const { lat: currentLat, lng: currentLng } = markerRef.current.getLatLng();
    const { latitude, longitude } = currentPosition;

    const animateMarker = () => {
      const startTime = performance.now();
      const duration = 3000; // Animation duration in milliseconds

      const animate = (timestamp) => {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const nextLat = currentLat + (latitude - currentLat) * progress;
        const nextLng = currentLng + (longitude - currentLng) * progress;

        markerRef.current.setLatLng([nextLat, nextLng]);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    };

    animateMarker();

  }, [currentPosition]);

  // Update marker position when position prop changes
  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  return (
    <Marker position={[currentPosition.latitude, currentPosition.longitude]} ref={markerRef} icon={icon}>
      <Popup>Vehicle in transit</Popup>
    </Marker>
  );
};


export default App;
