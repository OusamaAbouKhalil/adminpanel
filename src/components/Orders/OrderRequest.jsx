import React, { useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = { height: "200px", width: "100%" };

const OrderRequest = ({ order, onAccept, onReject }) => {
  const center = {
    lat: parseFloat(order?.user_location._lat),
    lng: parseFloat(order?.user_location._long),
  };
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
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

if (!order) {
  return <div className="text-center p-4">No pending requests currently</div>;
}

return (
  <div className="p-4 border rounded shadow max-w-screen-xl w-full">
    <h1 className="text-xl font-bold mb-4">Order Request</h1>
    <table className="w-full text-left border-collapse">
      <thead>
        <tr>
          <th className="px-4 py-2 border">Detail</th>
          <th className="px-4 py-2 border">Information</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="px-4 py-2 border font-semibold">Recipient Name:</td>
          <td className="px-4 py-2 border">{order.recipient_name}</td>
        </tr>

        <tr>
          <td className="px-4 py-2 border font-semibold">Total:</td>
          <td className="px-4 py-2 border">${order.total + order.delivery_fee}</td>
        </tr>
        <tr>
          <td className="px-4 py-2 border font-semibold">Cost in Credits:</td>
          <td className="px-4 py-2 border">{order.costInCredits}</td>
        </tr>
        <tr>
          <td className="px-4 py-2 border font-semibold">Delivery Fee:</td>
          <td className="px-4 py-2 border">${order.delivery_fee}</td>
        </tr>
        <tr>
          <td className="px-4 py-2 border font-semibold">Floor Number:</td>
          <td className="px-4 py-2 border">{order.floor_num}</td>
        </tr>
        <tr>
          <td className="px-4 py-2 border font-semibold">Payment Method:</td>
          <td className="px-4 py-2 border">{order.payment_method}</td>
        </tr>
        <tr>
          <td className="px-4 py-2 border font-semibold">Unit Number:</td>
          <td className="px-4 py-2 border">{order.unit_num}</td>
        </tr>
        <tr>
          <td className="px-4 py-2 border font-semibold">User Address:</td>
          <td className="px-4 py-2 border">{order.user_address}</td>
        </tr>
        <tr>
          <td className="px-4 py-2 border font-semibold">Map:</td>
          <td className="px-4 py-2 border">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 font-semibold"
            >
              View on Google Maps
            </a>
          </td>
        </tr>
      </tbody>
    </table>

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

    <div className="my-4">
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

    <div className="flex space-x-4 mt-4">
      <button
        onClick={onAccept}
        className="bg-green-500 text-white rounded-lg px-4 py-2"
      >
        Accept
      </button>
      <button
        onClick={onReject}
        className="bg-red-500 text-white rounded-lg px-4 py-2"
      >
        Reject
      </button>
    </div>
  </div>
);

};

export default OrderRequest;
