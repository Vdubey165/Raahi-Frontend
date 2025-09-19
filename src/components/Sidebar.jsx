import React from 'react';
import RouteCard from './RouteCard';
import BusCard from './BusCard';

const Sidebar = ({ 
    routes, 
    buses, 
    selectedRoute, 
    onSelectRoute, 
    selectedBus, 
    onSelectBus, 
    isOpen, 
    setIsOpen, 
    userType, 
    userLocation 
}) => {
    // Route selection
    const handleRouteSelect = (route) => {
        onSelectRoute(route);
        onSelectBus(null); // Clear bus selection when changing routes
        if (window.innerWidth < 768) setIsOpen(false);
    };

    // Bus selection
    const handleBusSelect = (bus) => {
        onSelectBus(bus);
        if (window.innerWidth < 768) setIsOpen(false);
    };

    // Close button
    const handleClose = () => setIsOpen(false);

    // Calculate distance to bus (simple calculation)
    const calculateDistance = (bus) => {
        if (!userLocation || !bus.coordinates.lat || !bus.coordinates.lng) return null;
        
        const R = 6371; // Earth's radius in km
        const dLat = (bus.coordinates.lat - userLocation.lat) * Math.PI / 180;
        const dLon = (bus.coordinates.lng - userLocation.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(bus.coordinates.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        return distance.toFixed(1);
    };

    return (
        <>
            {/* Sidebar */}
            <div
                className={`
                    fixed top-0 left-0 z-40 h-full w-4/5 max-w-xs md:static md:z-10 md:w-80
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    bg-white shadow-2xl md:shadow-md border-r border-blue-200
                    p-5 rounded-r-2xl md:rounded-none flex flex-col
                `}
                style={{ height: '100vh' }}
            >
                {/* Header with close button on mobile */}
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-bold text-blue-700">
                        {userType === 'driver' ? 'Driver Panel' : 'Bus Tracker'}
                    </h2>
                    {window.innerWidth < 768 && (
                        <button
                            className="md:hidden bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow"
                            onClick={handleClose}
                            aria-label="Close sidebar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Routes Section */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Bus Routes</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {routes.map(route => (
                            <div
                                key={route.routeId}
                                onClick={() => handleRouteSelect(route)}
                                className={`
                                    cursor-pointer rounded-xl transition-all duration-200 
                                    ${selectedRoute?.routeId === route.routeId
                                        ? 'bg-blue-100 ring-2 ring-blue-500 scale-[1.02]'
                                        : 'hover:bg-gray-50 shadow-sm hover:shadow-md'}
                                `}
                            >
                                <RouteCard route={route} isSelected={selectedRoute?.routeId === route.routeId} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Buses Section - Only show if route is selected */}
                {selectedRoute && (
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">
                            Buses on {selectedRoute.routeName}
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            {buses.length === 0 ? (
                                <div className="text-center text-gray-500 py-4">
                                    No buses currently active on this route
                                </div>
                            ) : (
                                buses.map(bus => (
                                    <div
                                        key={bus.busNumber}
                                        onClick={() => handleBusSelect(bus)}
                                        className={`
                                            cursor-pointer rounded-xl transition-all duration-200
                                            ${selectedBus?.busNumber === bus.busNumber
                                                ? 'bg-green-100 ring-2 ring-green-500 scale-[1.02]'
                                                : 'hover:bg-blue-50 shadow-sm hover:shadow-md'}
                                        `}
                                    >
                                        <BusCard 
                                            bus={bus} 
                                            distance={calculateDistance(bus)}
                                            isSelected={selectedBus?.busNumber === bus.busNumber}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Overlay for mobile */}
            {isOpen && window.innerWidth < 768 && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
                    onClick={handleClose}
                />
            )}
        </>
    );
};

export default Sidebar;