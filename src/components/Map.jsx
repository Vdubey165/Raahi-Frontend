import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Map = ({ buses, selectedRoute, selectedBus, userLocation, route, userType }) => {
    const [currentLocation, setCurrentLocation] = useState(null);

    useEffect(() => {
        if (userLocation) {
            setCurrentLocation([userLocation.lat, userLocation.lng]);
        }
    }, [userLocation]);

    function FitBounds({ userLocation, buses, selectedRoute }) {
        const map = useMap();
        
        useEffect(() => {
            if (selectedBus && userLocation) {
                // Fit bounds to show user and selected bus
                const bounds = L.latLngBounds([
                    [userLocation.lat, userLocation.lng],
                    [selectedBus.coordinates.lat, selectedBus.coordinates.lng]
                ]);
                map.fitBounds(bounds, { padding: [80, 80] });
            } else if (selectedRoute && buses.length > 0) {
                // Fit bounds to show all buses on route + stops
                const allPoints = [];
                
                // Add bus positions
                buses.forEach(bus => {
                    if (bus.coordinates.lat && bus.coordinates.lng) {
                        allPoints.push([bus.coordinates.lat, bus.coordinates.lng]);
                    }
                });
                
                // Add bus stops
                if (selectedRoute.stops) {
                    selectedRoute.stops.forEach(stop => {
                        if (stop.coordinates.lat && stop.coordinates.lng) {
                            allPoints.push([stop.coordinates.lat, stop.coordinates.lng]);
                        }
                    });
                }
                
                if (userLocation) {
                    allPoints.push([userLocation.lat, userLocation.lng]);
                }
                
                if (allPoints.length > 0) {
                    const bounds = L.latLngBounds(allPoints);
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            } else if (userLocation) {
                map.setView([userLocation.lat, userLocation.lng], 15);
            }
        }, [userLocation, buses, selectedRoute, selectedBus, map]);
        
        return null;
    }

    // Create custom bus icon
    const getBusIcon = (bus, isSelected = false) => {
        const size = isSelected ? [60, 80] : [50, 70];
        let iconUrl = '/bus-icon.png'; // You'll need to add bus icons
        
        // Different colors for bus status
        if (bus.status === 'delayed') iconUrl = '/bus-delayed.png';
        if (bus.status === 'offline') iconUrl = '/bus-offline.png';
        
        return new L.Icon({ 
            iconUrl, 
            iconSize: size,
            className: isSelected ? 'border-4 border-yellow-500 rounded-full' : ''
        });
    };

    // Create bus stop icon
    const busStopIcon = new L.Icon({
        iconUrl: '/bus-stop.png', // You'll need to add this
        iconSize: [30, 30]
    });

    // Extract polyline coordinates from route
    let polylineCoords = [];
    if (route && route.features && route.features[0]) {
        polylineCoords = route.features[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
        );
    }

    return (
        <MapContainer
            center={currentLocation || [28.6139, 77.2090]} // Delhi coordinates as default
            zoom={13}
            style={{ height: '100vh', width: '100%' }}
            className="shadow-lg"
        >
            <FitBounds 
                userLocation={userLocation} 
                buses={buses} 
                selectedRoute={selectedRoute} 
            />
            
            <TileLayer
                attribution='Bus Tracker'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User location marker */}
            {userLocation && (
                <Marker
                    position={[userLocation.lat, userLocation.lng]}
                    icon={new L.Icon({ 
                        iconUrl: userType === 'driver' ? '/driver-icon.png' : '/user-icon.png', 
                        iconSize: [40, 40] 
                    })}
                >
                    <Popup>
                        {userType === 'driver' ? 'Driver Location' : 'Your Location'}
                    </Popup>
                </Marker>
            )}

            {/* Bus markers */}
            {buses.map((bus) => (
                bus.coordinates.lat && bus.coordinates.lng && (
                    <Marker
                        key={bus.busNumber}
                        position={[bus.coordinates.lat, bus.coordinates.lng]}
                        icon={getBusIcon(bus, selectedBus?.busNumber === bus.busNumber)}
                    >
                        <Popup>
                            <div className="text-sm">
                                <strong>Bus #{bus.busNumber}</strong><br/>
                                Route: {selectedRoute?.routeName}<br/>
                                Status: <span className={`font-bold ${
                                    bus.status === 'active' ? 'text-green-600' : 
                                    bus.status === 'delayed' ? 'text-orange-600' : 
                                    'text-red-600'
                                }`}>{bus.status}</span><br/>
                                Occupancy: {bus.currentOccupancy}/{bus.capacity}<br/>
                                Speed: {bus.speed || 0} km/h<br/>
                                Last Update: {new Date(bus.lastUpdated).toLocaleTimeString()}
                            </div>
                        </Popup>
                    </Marker>
                )
            ))}

            {/* Bus stops */}
            {selectedRoute && selectedRoute.stops && selectedRoute.stops.map((stop) => (
                stop.coordinates.lat && stop.coordinates.lng && (
                    <Marker
                        key={stop.stopId}
                        position={[stop.coordinates.lat, stop.coordinates.lng]}
                        icon={busStopIcon}
                    >
                        <Popup>
                            <div className="text-sm">
                                <strong>{stop.stopName}</strong><br/>
                                Stop #{stop.order}<br/>
                                Route: {selectedRoute.routeName}
                            </div>
                        </Popup>
                    </Marker>
                )
            ))}

            {/* Route polyline */}
            {polylineCoords.length > 0 && (
                <Polyline 
                    positions={polylineCoords} 
                    color="#2563eb" 
                    weight={4} 
                    opacity={0.7} 
                />
            )}
        </MapContainer>
    );
};

export default Map;