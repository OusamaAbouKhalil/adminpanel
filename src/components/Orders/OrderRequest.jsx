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

return (
  <div className="p-4 border rounded shadow max-w-screen-xl w-full">
    <h1 className="text-xl font-bold mb-4">Order Request</h1>
    <table className="w-full text-left border-collapse">
      <tbody>
        <tr>
          <td className="font-semibold">Recipient Name:</td>
          <td>{order.recipient_name}</td>
        </tr>
        {order.items &&
          order.items.map((item, index) => (
            <React.Fragment key={index}>
              <tr>
                <td className="font-semibold">Item Name:</td>
                <td>{item.item_name}</td>
              </tr>
              <tr>
                <td className="font-semibold">Quantity:</td>
                <td>{item.quantity}</td>
              </tr>
              <tr>
                <td className="font-semibold">Size:</td>
                <td>{item.size}</td>
              </tr>
              <tr>
                <td className="font-semibold">Price:</td>
                <td>${item.total}</td>
              </tr>
            </React.Fragment>
          ))}
        <tr>
          <td className="font-semibold">Total:</td>
          <td>${order.total + order.delivery_fee}</td>
        </tr>
        <tr>
          <td className="font-semibold">Cost in Credits:</td>
          <td>{order.costInCredits}</td>
        </tr>
        <tr>
          <td className="font-semibold">Delivery Fee:</td>
          <td>${order.delivery_fee}</td>
        </tr>
        <tr>
          <td className="font-semibold">Floor Number:</td>
          <td>{order.floor_num}</td>
        </tr>
        <tr>
          <td className="font-semibold">Payment Method:</td>
          <td>{order.payment_method}</td>
        </tr>
        <tr>
          <td className="font-semibold">Unit Number:</td>
          <td>{order.unit_num}</td>
        </tr>
        <tr>
          <td className="font-semibold">User Address:</td>
          <td>{order.user_address}</td>
        </tr>
        <tr>
          <td className="font-semibold">Map:</td>
          <td>
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
        className="bg-lightgreen text-white rounded-lg px-4 py-2"
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
