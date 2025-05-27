import { GoogleMap, Marker } from '@react-google-maps/api';
import React, { useEffect, useState, useRef } from 'react';

const LocationRender = React.memo(({ markerPosition, onMapClick, isLoaded }) => {
    const containerStyle = { height: "400px", width: "100%" };
    const [map, setMap] = useState(null);
    
    // Custom SVG marker
    const svgMarker = {
        path: "M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z",
        fillColor: "#E53935",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#B71C1C",
        rotation: 0,
        scale: 2,
        anchor: { x: 12, y: 22 },
    };
    
    // Optional pulsating effect
    const [circle, setCircle] = useState(null);
    const directionRef = useRef(true); // true = growing, false = shrinking
    
    // Set up circle animation when map loads
    useEffect(() => {
        if (isLoaded && map && markerPosition) {
            // Clean up any existing circle
            if (circle) {
                circle.setMap(null);
            }
            
            // Create new circle with initial small radius
            const newCircle = new window.google.maps.Circle({
                strokeColor: "#E53935",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#E53935",
                fillOpacity: 0.2,
                map: map,
                center: markerPosition,
                radius: 20
            });
            
            // Animate the circle with a smooth pulsating effect
            let radius = 20;
            const minRadius = 20;
            const maxRadius = 50;
            
            const animationInterval = setInterval(() => {
                if (directionRef.current) {
                    // Growing
                    radius += 1;
                    if (radius >= maxRadius) {
                        directionRef.current = false;
                    }
                } else {
                    // Shrinking
                    radius -= 1;
                    if (radius <= minRadius) {
                        directionRef.current = true;
                    }
                }
                
                newCircle.setRadius(radius);
            }, 50);
            
            setCircle(newCircle);
            
            // Clean up on unmount
            return () => {
                clearInterval(animationInterval);
                if (newCircle) newCircle.setMap(null);
            };
        }
    }, [isLoaded, map, markerPosition]);
    
    // Map options for custom styling
    const mapOptions = {
        disableDefaultUI: false,
        zoomControl: true,
        styles: [
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#e9e9e9" }, { lightness: 17 }]
            },
            {
                featureType: "landscape",
                elementType: "geometry",
                stylers: [{ color: "#f5f5f5" }, { lightness: 20 }]
            },
            {
                featureType: "road.highway",
                elementType: "geometry.fill",
                stylers: [{ color: "#ffffff" }, { lightness: 17 }]
            },
            {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [{ color: "#ffffff" }, { lightness: 29 }, { weight: 0.2 }]
            },
            {
                featureType: "road.arterial",
                elementType: "geometry",
                stylers: [{ color: "#ffffff" }, { lightness: 18 }]
            },
            {
                featureType: "poi",
                elementType: "geometry",
                stylers: [{ color: "#f5f5f5" }, { lightness: 21 }]
            }
        ]
    };
    
    // Callback when map loads
    const onMapLoad = React.useCallback(mapInstance => {
        setMap(mapInstance);
    }, []);

    return (
        <div style={containerStyle}>
            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={markerPosition}
                    zoom={16}
                    onClick={onMapClick}
                    onLoad={onMapLoad}
                    options={mapOptions}
                >
                    <Marker 
                        position={markerPosition} 
                        icon={svgMarker}
                        animation={window.google?.maps?.Animation?.DROP}
                        title="Delivery Location"
                    />
                </GoogleMap>
            ) : (
                <div className="flex justify-center items-center h-64">
                    <div className="w-16 h-16 border-4 border-t-4 border-green-600 rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
});

export default LocationRender;