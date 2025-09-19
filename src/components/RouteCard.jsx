import React from 'react';

const RouteCard = ({ route, isSelected }) => {
    const getOperatingStatus = () => {
        if (!route.operatingHours) return 'Unknown';
        
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        if (currentTime >= route.operatingHours.start && currentTime <= route.operatingHours.end) {
            return 'Operating';
        }
        return 'Closed';
    };

    return (
        <div className={`p-3 rounded-xl ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-50'}`}>
            <h3 className="font-semibold mb-1">{route.routeName}</h3>
            <div className="text-sm opacity-80">
                <div>Route ID: {route.routeId}</div>
                <div>Stops: {route.stops?.length || 0}</div>
                {route.operatingHours && (
                    <div>Hours: {route.operatingHours.start} - {route.operatingHours.end}</div>
                )}
                {route.frequency && (
                    <div>Frequency: Every {route.frequency} mins</div>
                )}
                <div className={`font-medium ${
                    getOperatingStatus() === 'Operating' ? 'text-green-600' : 'text-red-600'
                } ${isSelected ? 'text-white' : ''}`}>
                    {getOperatingStatus()}
                </div>
            </div>
        </div>
    );
};

export default RouteCard;