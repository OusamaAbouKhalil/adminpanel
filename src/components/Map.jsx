import { GoogleMap, Marker } from '@react-google-maps/api';
import React from 'react'

const LocationRender = React.memo(({ markerPosition, onMapClick, isLoaded }) => {
    const containerStyle = { height: "200px", width: "100%" };

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
            ) : <div>Loading...</div>}
        </div>
    );
});

export default LocationRender;
