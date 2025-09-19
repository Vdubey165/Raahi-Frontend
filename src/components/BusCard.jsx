import React from 'react';

const BusCard = ({ bus, distance, isSelected }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-green-600';
            case 'delayed': return 'text-orange-600';
            case 'idle': return 'text-yellow-600';
            case 'offline': return 'text-red-600';
            case 'maintenance': return 'text-purple-600';
            default: return 'text-gray-600';
        }
    };

    const getOccupancyColor = (occupancy, capacity) => {
        const percentage = (occupancy / capacity) * 100;
        if (percentage >= 90) return 'text-red-600';
        if (percentage >= 70) return 'text-orange-600';
        if (percentage >= 50) return 'text-yellow-600';
        return 'text-green-600';
    };

    const formatLastUpdate = (timestamp) => {
        const now = new Date();
        const updated = new Date(timestamp);
        const diffMinutes = Math.floor((now - updated) / (1000 * 60));
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes === 1) return '1 min ago';
        if (diffMinutes < 60) return `${diffMinutes} mins ago`;
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours === 1) return '1 hour ago';
        return `${diffHours} hours ago`;
    };

    return (
        <div className={`p-3 rounded-2xl ${
            isSelected ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
        }`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">Bus #{bus.busNumber}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    isSelected ? 'bg-white text-green-700' : 'bg-white text-blue-700'
                }`}>
                    {bus.status}
                </span>
            </div>
            
            <div className="space-y-1 text-sm">
                {distance && (
                    <div className="flex justify-between">
                        <span>Distance:</span>
                        <span className="font-medium">{distance} km</span>
                    </div>
                )}
                
                <div className="flex justify-between">
                    <span>Occupancy:</span>
                    <span className={`font-medium ${getOccupancyColor(bus.currentOccupancy, bus.capacity)}`}>
                        {bus.currentOccupancy}/{bus.capacity}
                    </span>
                </div>
                
                <div className="flex justify-between">
                    <span>Speed:</span>
                    <span className="font-medium">{bus.speed || 0} km/h</span>
                </div>
                
                {bus.driverName && (
                    <div className="flex justify-between">
                        <span>Driver:</span>
                        <span className="font-medium">{bus.driverName}</span>
                    </div>
                )}
                
                <div className="flex justify-between text-xs opacity-75 mt-2">
                    <span>Updated:</span>
                    <span>{formatLastUpdate(bus.lastUpdated)}</span>
                </div>
            </div>
        </div>
    );
};

export default BusCard;