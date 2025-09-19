import React, { useEffect, useState } from 'react';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import socket, { trackRoute, listenForBusUpdates, emitBusLocationUpdate } from './socket';
import axios from 'axios';

const App = () => {
    // Replace room-based state with bus tracking state
    const [buses, setBuses] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [selectedBus, setSelectedBus] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [userType, setUserType] = useState('commuter'); // 'commuter' or 'driver'
    const [routeToETA, setRouteToETA] = useState(null);
    const [loadingRoute, setLoadingRoute] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    
    // For drivers only
    const [driverBusNumber, setDriverBusNumber] = useState('');
    const [isDriverLoggedIn, setIsDriverLoggedIn] = useState(false);

    // Get user location
    useEffect(() => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        const handleLocation = (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });

            // If driver, emit location update
            if (userType === 'driver' && isDriverLoggedIn && driverBusNumber) {
                emitBusLocationUpdate({
                    busNumber: driverBusNumber,
                    lat: latitude,
                    lng: longitude,
                    speed: 0, // You can add speed calculation
                    occupancy: 0 // Driver can update this
                });
            }
        };

        const handleError = () => {
            alert('Location permission denied. Please allow location access.');
        };

        // Get location every 10 seconds for drivers, every 30 seconds for commuters
        const interval = setInterval(() => {
            navigator.geolocation.getCurrentPosition(handleLocation, handleError, {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            });
        }, userType === 'driver' ? 10000 : 30000);

        // Get initial location
        navigator.geolocation.getCurrentPosition(handleLocation, handleError);

        return () => clearInterval(interval);
    }, [userType, isDriverLoggedIn, driverBusNumber]);

    // Load routes on app start
    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                // ✅ FIXED: Changed from '/api/' to '/api/routes'
                const response = await axios.get('http://localhost:4000/api/routes');
                setRoutes(response.data);
            } catch (error) {
                console.error('Error fetching routes:', error);
            }
        };
        fetchRoutes();
    }, []);

    // Track selected route
    useEffect(() => {
        if (selectedRoute) {
            trackRoute(selectedRoute.routeId);
            
            // Fetch buses on this route
            const fetchBuses = async () => {
                try {
                    // ✅ FIXED: Changed single quotes to backticks for template literal
                    const response = await axios.get(
                        `http://localhost:4000/api/routes/${selectedRoute.routeId}/buses`
                    );
                    setBuses(response.data);
                } catch (error) {
                    console.error('Error fetching buses:', error);
                }
            };
            fetchBuses();
        }

        // Listen for real-time bus updates
        listenForBusUpdates((data) => {
            if (data.routeId === selectedRoute?.routeId) {
                setBuses(prev => {
                    const updated = [...prev];
                    data.buses.forEach(updatedBus => {
                        const index = updated.findIndex(bus => bus.busNumber === updatedBus.busNumber);
                        if (index >= 0) {
                            updated[index] = updatedBus;
                        } else {
                            updated.push(updatedBus);
                        }
                    });
                    return updated;
                });
            }
        });

        return () => {
            socket.off('buses-updated');
        };
    }, [selectedRoute]);

    // Calculate route to selected bus
    useEffect(() => {
        const fetchRoute = async () => {
            if (!selectedBus || !userLocation) {
                setRouteToETA(null);
                setLoadingRoute(false);
                return;
            }

            setLoadingRoute(true);
            try {
                // ⚠️ WARNING: This endpoint doesn't exist in your server
                // You need to create this endpoint or remove this functionality
                // For now, commenting out to prevent 404 errors
                
                // const res = await axios.post('http://localhost:4000/api/locations/route', {
                //     start: userLocation,
                //     end: { lat: selectedBus.coordinates.lat, lng: selectedBus.coordinates.lng }
                // });
                // setRouteToETA(res.data);
                
                // Temporary: Set to null until you create the route calculation endpoint
                setRouteToETA(null);
            } catch (err) {
                setRouteToETA(null);
            }
            setLoadingRoute(false);
        };
        fetchRoute();
    }, [selectedBus, userLocation]);

    // Driver login
    const handleDriverLogin = (busNumber) => {
        setDriverBusNumber(busNumber);
        setIsDriverLoggedIn(true);
        setUserType('driver');
    };

    // Show user type selection first
    if (!userType || (userType === 'driver' && !isDriverLoggedIn)) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                <div className="bg-white p-8 rounded shadow max-w-md w-full">
                    <h2 className="mb-4 text-xl font-bold">Bus Tracking System</h2>
                    
                    {userType === 'driver' && !isDriverLoggedIn ? (
                        <div>
                            <h3 className="mb-4">Driver Login</h3>
                            <input
                                type="text"
                                placeholder="Enter your bus number"
                                value={driverBusNumber}
                                onChange={(e) => setDriverBusNumber(e.target.value)}
                                className="border p-2 rounded w-full mb-4"
                            />
                            <button
                                onClick={() => handleDriverLogin(driverBusNumber)}
                                className="bg-green-500 text-white px-4 py-2 rounded w-full mb-2"
                                disabled={!driverBusNumber.trim()}
                            >
                                Login as Driver
                            </button>
                            <button
                                onClick={() => setUserType('commuter')}
                                className="bg-gray-500 text-white px-4 py-2 rounded w-full"
                            >
                                Back
                            </button>
                        </div>
                    ) : (
                        <div>
                            <button
                                onClick={() => setUserType('commuter')}
                                className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-4"
                            >
                                I'm a Commuter
                            </button>
                            <button
                                onClick={() => setUserType('driver')}
                                className="bg-green-500 text-white px-4 py-2 rounded w-full"
                            >
                                I'm a Bus Driver
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col h-screen overflow-hidden">
            {/* Top Bar */}
            <div className="sticky top-0 z-30 bg-gradient-to-r from-blue-600 to-green-600 p-2 text-white shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center w-full md:w-auto">
                        {window.innerWidth < 768 && !isSidebarOpen && (
                            <button
                                className="md:hidden mr-3 bg-white/10 hover:bg-white/20 p-2 rounded-full border border-white/20 transition"
                                onClick={() => setIsSidebarOpen(true)}
                                aria-label="Open sidebar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        )}
                        <span className="font-semibold tracking-wide text-white">
                            {userType === 'driver' ? `Bus: ${driverBusNumber}` : 'Public Bus Tracker'}
                        </span>
                        {selectedRoute && (
                            <span className="ml-2 px-2 py-1 bg-white text-blue-700 rounded-md font-mono text-sm">
                                {selectedRoute.routeName}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative flex flex-1 overflow-hidden">
                {isSidebarOpen && (
                    <Sidebar
                        routes={routes}
                        buses={buses}
                        selectedRoute={selectedRoute}
                        onSelectRoute={setSelectedRoute}
                        selectedBus={selectedBus}
                        onSelectBus={setSelectedBus}
                        isOpen={isSidebarOpen}
                        setIsOpen={setIsSidebarOpen}
                        userType={userType}
                        userLocation={userLocation}
                    />
                )}

                <div className="flex-1 relative z-0 bg-gradient-to-br from-blue-50 to-green-100">
                    {loadingRoute && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
                        </div>
                    )}
                    <Map
                        buses={buses}
                        selectedRoute={selectedRoute}
                        selectedBus={selectedBus}
                        userLocation={userLocation}
                        route={routeToETA}
                        userType={userType}
                    />
                </div>
            </div>
        </div>
    );
};

export default App;