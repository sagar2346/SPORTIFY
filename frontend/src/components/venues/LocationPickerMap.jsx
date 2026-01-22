import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position ? (
        <Marker position={position}>
            <Popup>Selected Location</Popup>
        </Marker>
    ) : null;
};

// Component to recenter map on user location
const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

const LocationPickerMap = ({ onLocationSelect, initialLocation }) => {
    const [position, setPosition] = useState(initialLocation ? { lat: initialLocation.latitude, lng: initialLocation.longitude } : null);
    const [userLocation, setUserLocation] = useState(null);

    // Get Current Location on Mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const newPos = { lat: latitude, lng: longitude };
                    setUserLocation(newPos);

                    // Only set position/center to user location if no initial location provided
                    if (!initialLocation) {
                        setPosition(newPos);
                        onLocationSelect({ latitude, longitude });
                    }
                },
                (err) => {
                    console.error("Error getting location: ", err);
                    // Default to Kathmandu if location fails
                    if (!initialLocation) {
                        const defaultPos = { lat: 27.7172, lng: 85.3240 };
                        setUserLocation(defaultPos);
                        setPosition(defaultPos);
                    }
                }
            );
        }
    }, []);

    const handleSetPosition = (latlng) => {
        setPosition(latlng);
        onLocationSelect({ latitude: latlng.lat, longitude: latlng.lng });
    };

    const center = position || userLocation || { lat: 27.7172, lng: 85.3240 };

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-300 z-0 relative">
            <MapContainer
                center={center}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <RecenterMap center={center} />
                <LocationMarker position={position} setPosition={handleSetPosition} />
            </MapContainer>
            <div className="absolute bottom-2 right-2 z-[400] bg-white px-2 py-1 rounded shadow text-xs text-gray-600">
                Click map to set location
            </div>
        </div>
    );
};

export default LocationPickerMap;
