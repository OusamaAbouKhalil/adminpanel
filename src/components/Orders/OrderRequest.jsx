import React, { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = { height: "200px", width: "100%" };

const OrderRequest = ({ order, onAccept }) => {
  const [map, setMap] = useState(null);

  const center = {
    lat: parseFloat(order?.user_location._lat),
    lng: parseFloat(order?.user_location._long)
  };
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyDM7PY2pGPq_ZlOBqH0Dhq3np8nNmXbVf0"
  });

  const onLoad = useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);
  }, [center]);


  if (!order) {
    return <div className="text-center p-4">No pending requests currently</div>;
  }

  return (
    <div className="p-4 border rounded shadow w-1/2">
      <h2 className="text-lg font-bold">Order Request</h2>
      <p>Description: {order.description}</p>
      <p>Recipient: {order.recipient_name}</p>
      <p>Total: ${order.total}</p>
      <div style={containerStyle}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={6}
            onLoad={onLoad}
          >
            <Marker position={center} />
          </GoogleMap>
        ) : <div>Loading...</div>}
      </div>
      <button onClick={onAccept} style={{ backgroundColor: 'lightgreen', color: 'white', borderRadius: '12%', padding: '8px' }}>
        Accept
      </button>
    </div>
  );
};

export default OrderRequest;
