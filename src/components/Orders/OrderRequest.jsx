import React, { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = { height: "200px", width: "100%" };

const OrderRequest = ({ order, onAccept, onReject }) => {
  const center = {
    lat: parseFloat(order?.user_location._lat),
    lng: parseFloat(order?.user_location._long),
  };
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const onLoad = useCallback(
    function callback(map) {
      const bounds = new window.google.maps.LatLngBounds(center);
      map.fitBounds(bounds);
    },
    [center]
  );

  const mapUrl = `https://www.google.com/maps?q=${center.lat},${center.lng}`;

  if (!order) {
    return <div className="text-center p-4">No pending requests currently</div>;
  }

  return (
    <div className="p-4 border rounded shadow max-w-screen-xl w-full">
      <h1 className="text-xl font-bold">Order Request:</h1>
      <p>
        <strong>Recipient Name:</strong> {order.recipient_name}
      </p>
      {/* {console.log("hmmm",order.items)} */}
      {order.items &&
        order.items.map((item, index) => (
          <div key={index} className="my-2 p-2 border rounded">
            <p>
              <strong>Item Name:</strong> {item.item_name}
            </p>
            <p>
              <strong>Quantity:</strong> {item.quantity}
            </p>
            {/* <p>
              <strong>Combo:</strong> {item.combo.join(", ")}
            </p> */}
            <p>
              <strong>Size:</strong> {item.size}
            </p>
            <p>
              <strong>Price:</strong> ${item.total}
            </p>
          </div>
        ))}
      <p>
        {/* total = total + delivery fee */}
        <strong>Total:</strong> ${order.total + order.delivery_fee}
      </p>
      <p>
        <strong>Cost in Credits:</strong> {order.costInCredits}
      </p>
      <p>
        <strong>Delivery Fee:</strong> ${order.delivery_fee}
      </p>
      <p>
        <strong>Floor Number:</strong> {order.floor_num}
      </p>
      <p>
        <strong>Payment Method:</strong> {order.payment_method}
      </p>
      <p>
        <strong>Unit Number:</strong> {order.unit_num}
      </p>
      <p>
        <strong>User Address:</strong> {order.user_address}
      </p>
      <p>
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 font-semibold"
        >
          View on Google Maps
        </a>
      </p>
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
        ) : (
          <div>Loading...</div>
        )}
      </div>
      <button
        onClick={onAccept}
        style={{
          backgroundColor: "lightgreen",
          color: "white",
          borderRadius: "12%",
          padding: "8px",
          marginTop: "3px",
          marginRight: "10px",
        }}
      >
        Accept
      </button>
      <button
        onClick={onReject}
        style={{
          backgroundColor: "red",
          color: "white",
          borderRadius: "12%",
          padding: "8px",
          marginTop: "3px",
        }}
      >
        Reject
      </button>
    </div>
  );
};

export default OrderRequest;
