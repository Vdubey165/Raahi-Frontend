import { io } from "socket.io-client";

const socket = io('http://localhost:4000');

// For route tracking (commuters)
export const trackRoute = (routeId) => {
    socket.emit("track-route", routeId);
};

// For bus drivers to update location
export const emitBusLocationUpdate = (busData) => {
    socket.emit("bus-location-update", busData);
};

// Listen for bus updates on tracked routes
export const listenForBusUpdates = (callback) => {
    socket.on("buses-updated", callback);
};

// Clean up listeners
export const cleanupSocketListeners = () => {
    socket.off("buses-updated");
};

export default socket;