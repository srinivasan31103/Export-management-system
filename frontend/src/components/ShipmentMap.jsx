import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Ship, MapPin, Clock, Package } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom ship icon
const shipIcon = new L.DivIcon({
  html: `<div style="background: #3b82f6; padding: 8px; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
      <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/>
      <path d="M12 10v4"/>
      <path d="M12 2v3"/>
    </svg>
  </div>`,
  className: 'ship-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Port icon
const portIcon = new L.DivIcon({
  html: `<div style="background: #10b981; padding: 6px; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  </div>`,
  className: 'port-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function AnimatedPolyline({ positions }) {
  const [currentPath, setCurrentPath] = useState([]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < positions.length) {
        setCurrentPath(positions.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [positions]);

  return (
    <Polyline
      positions={currentPath}
      pathOptions={{
        color: '#3b82f6',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 5',
      }}
    />
  );
}

function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

export default function ShipmentMap({ shipment }) {
  const [shipmentData, setShipmentData] = useState(null);

  useEffect(() => {
    // Mock shipment tracking data
    const mockData = {
      origin: {
        name: shipment?.port_of_loading || 'Newark, NJ',
        coords: [40.7357, -74.1724],
      },
      destination: {
        name: shipment?.port_of_discharge || 'Southampton, UK',
        coords: [50.9097, -1.4044],
      },
      currentPosition: {
        coords: [45.5, -30.0], // Mid-Atlantic
        timestamp: new Date().toISOString(),
      },
      route: [
        [40.7357, -74.1724],
        [42.0, -50.0],
        [45.5, -30.0],
        [48.0, -10.0],
        [50.9097, -1.4044],
      ],
      status: shipment?.status || 'in_transit',
      vessel: {
        name: shipment?.carrier || 'MV OCEAN EXPLORER',
        speed: '14 knots',
        eta: shipment?.estimated_arrival || '2025-02-15',
      },
    };

    setShipmentData(mockData);
  }, [shipment]);

  if (!shipmentData) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Shipment Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white"
        >
          <div className="flex items-center space-x-3">
            <Ship className="h-8 w-8" />
            <div>
              <p className="text-sm opacity-90">Vessel</p>
              <p className="font-semibold">{shipmentData.vessel.name}</p>
              <p className="text-xs opacity-75">{shipmentData.vessel.speed}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white"
        >
          <div className="flex items-center space-x-3">
            <MapPin className="h-8 w-8" />
            <div>
              <p className="text-sm opacity-90">Current Location</p>
              <p className="font-semibold">Mid-Atlantic</p>
              <p className="text-xs opacity-75">
                {shipmentData.currentPosition.coords[0].toFixed(2)}°N,{' '}
                {Math.abs(shipmentData.currentPosition.coords[1]).toFixed(2)}°W
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white"
        >
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8" />
            <div>
              <p className="text-sm opacity-90">ETA</p>
              <p className="font-semibold">
                {new Date(shipmentData.vessel.eta).toLocaleDateString()}
              </p>
              <p className="text-xs opacity-75">
                {Math.ceil((new Date(shipmentData.vessel.eta) - new Date()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700"
        style={{ height: '500px' }}
      >
        <MapContainer
          center={shipmentData.currentPosition.coords}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController
            center={shipmentData.currentPosition.coords}
            zoom={4}
          />

          {/* Origin Port */}
          <Marker position={shipmentData.origin.coords} icon={portIcon}>
            <Popup>
              <div className="p-2">
                <p className="font-semibold">Origin Port</p>
                <p className="text-sm text-gray-600">{shipmentData.origin.name}</p>
              </div>
            </Popup>
          </Marker>

          {/* Destination Port */}
          <Marker position={shipmentData.destination.coords} icon={portIcon}>
            <Popup>
              <div className="p-2">
                <p className="font-semibold">Destination Port</p>
                <p className="text-sm text-gray-600">{shipmentData.destination.name}</p>
              </div>
            </Popup>
          </Marker>

          {/* Current Ship Position */}
          <Marker position={shipmentData.currentPosition.coords} icon={shipIcon}>
            <Popup>
              <div className="p-2">
                <p className="font-semibold">{shipmentData.vessel.name}</p>
                <p className="text-sm text-gray-600">Speed: {shipmentData.vessel.speed}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Last updated: {new Date(shipmentData.currentPosition.timestamp).toLocaleString()}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Animated Route */}
          <AnimatedPolyline positions={shipmentData.route} />
        </MapContainer>
      </motion.div>

      {/* Route Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Journey Timeline
        </h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          <div className="space-y-6">
            <TimelineItem
              icon={<MapPin className="h-5 w-5" />}
              title="Departed"
              location={shipmentData.origin.name}
              time="Jan 25, 2025 14:30"
              completed={true}
            />
            <TimelineItem
              icon={<Ship className="h-5 w-5" />}
              title="In Transit"
              location="Mid-Atlantic Ocean"
              time="Current Position"
              completed={true}
              active={true}
            />
            <TimelineItem
              icon={<Package className="h-5 w-5" />}
              title="Expected Arrival"
              location={shipmentData.destination.name}
              time={new Date(shipmentData.vessel.eta).toLocaleDateString()}
              completed={false}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function TimelineItem({ icon, title, location, time, completed, active }) {
  return (
    <div className="relative flex items-start space-x-4 pl-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
          completed
            ? 'bg-green-500 text-white'
            : active
            ? 'bg-blue-500 text-white animate-pulse'
            : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
        }`}
      >
        {icon}
      </motion.div>
      <div className="flex-1 pl-8">
        <p className={`font-semibold ${
          completed || active ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
        }`}>
          {title}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{location}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}
