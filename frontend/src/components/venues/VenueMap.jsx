import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { FiMapPin, FiNavigation } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to recenter map when venues change or user location updates
const RecenterMap = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
};

const VenueMap = ({ venues, userLocation }) => {
    const [center, setCenter] = useState([27.7172, 85.3240]); // Default to Kathmandu
    const [zoom, setZoom] = useState(13);

    useEffect(() => {
        if (userLocation) {
            setCenter([userLocation.latitude, userLocation.longitude]);
            setZoom(14);
        } else if (venues.length > 0) {
            // Find center of all venues if no user location
            // Or just take the first venue
            // Ideally valid coordinates check needed
            const validVenue = venues.find(v => v.location?.coordinates?.latitude);
            if (validVenue) {
                setCenter([validVenue.location.coordinates.latitude, validVenue.location.coordinates.longitude]);
            }
        }
    }, [userLocation, venues]);

    return (
        <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 relative z-0">
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <RecenterMap center={center} zoom={zoom} />

                {/* User Location Marker */}
                {userLocation && (
                    <Marker
                        position={[userLocation.latitude, userLocation.longitude]}
                        icon={new L.Icon({
                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                        })}
                    >
                        <Popup>
                            <div className="font-bold text-center">You are here</div>
                        </Popup>
                    </Marker>
                )}

                {/* Venue Markers */}
                {venues.map((venue) => (
                    venue.location?.coordinates?.latitude && (
                        <Marker
                            key={venue._id}
                            position={[venue.location.coordinates.latitude, venue.location.coordinates.longitude]}
                            icon={new L.Icon({
                                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                shadowSize: [41, 41]
                            })}
                        >
                            <Popup>
                                <div className="w-64">
                                    <img
                                        src={venue.images?.[0] ? `http://localhost:5001/uploads/${venue.images[0]}` : 'https://via.placeholder.com/150'}
                                        alt={venue.name}
                                        className="w-full h-32 object-cover rounded-t-lg mb-2"
                                    />
                                    <h3 className="font-bold text-lg mb-1">{venue.name}</h3>
                                    <p className="text-gray-600 text-sm mb-2 flex items-center">
                                        <FiMapPin className="mr-1" /> {venue.location.city}
                                    </p>
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="font-bold text-primary-600">${venue.basePrice}/hr</span>
                                        <Link
                                            to={`/venues/${venue._id}`}
                                            className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>

            {!userLocation && (
                <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-md max-w-xs">
                    <p className="text-sm text-gray-600 flex items-start">
                        <FiNavigation className="mt-1 mr-2 text-primary-500 flex-shrink-0" />
                        Enable location services to see venues near you.
                    </p>
                </div>
            )}
        </div>
    );
};

export default VenueMap;
