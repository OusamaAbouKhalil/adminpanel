import { GoogleMap, Marker } from '@react-google-maps/api';
import React from 'react'

const LocationRender = React.memo(({ markerPosition, onMapClick, isLoaded }) => {
    const containerStyle = { height: "400px", width: "100%" };

    return (
        <div style={containerStyle}>
            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={markerPosition}
                    zoom={16}
                    onClick={onMapClick}
                >
                    <Marker position={markerPosition} />
                </GoogleMap>
            ) :  <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-t-4 border-green-600 rounded-full animate-spin"></div>
  </div>}
        </div>
    );
});

export default LocationRender;
