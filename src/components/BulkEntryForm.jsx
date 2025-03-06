import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useCreateRestaurant } from "../lib/query/queries";
import { GeoPoint } from "firebase/firestore";
import { uploadImage } from "../lib/firebase/api";
import { useJsApiLoader } from "@react-google-maps/api";
import { Map } from "../components";

const SelectedTitles = ({ titles, onRemove }) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {titles.map(title => (
      <span
        key={title}
        className="bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center group"
      >
        {title}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(title);
          }}
          className="ml-2 opacity-0 group-hover:opacity-100 hover:text-red-200 transition-opacity"
        >
          ×
        </button>
      </span>
    ))}
  </div>
);

const BulkEntryForm = ({ isOpen, onClose }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const initialEntry = {
    rest_name: "",
    Category: [],
    sub_categories: [],
    title: [],
    main_description: "",
    phone_number: "",
    mapLink: "",
    time: "", // Added time field to match Add component
    location: new GeoPoint(33.26968841037753, 35.20611613326288),
    isClosed: false,
    bg_image: "",
    main_image: "",
    rating: 0,
    likes: []
  };

  const titles = [
    "Featured on SwiftBites",
    "Daily Recommendations!",
    "Now on SwiftBites",
    "Coming Soon",
    "In a hurry?",
    "Wallet Friendly",
    "Breakfast",
    "Fresh & Supermarkets",
    "National Brands",
  ];

  const [entries, setEntries] = useState([initialEntry]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState([{}]);
  const [imageFilesUrls, setImageFilesUrls] = useState([{}]);
  const { mutate: addRestaurant } = useCreateRestaurant();
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);

  const handleEntryChange = (index, field, value) => {
    setEntries(prev => {
      const newEntries = [...prev];
      switch (field) {
        case 'Category':
        case 'sub_categories':
          newEntries[index][field] = value.split('+').map(item => item.trim());
          break;
        case 'title':
          if (Array.isArray(value)) {
            newEntries[index].title = value;
          } else {
            if (!Array.isArray(newEntries[index].title)) {
              newEntries[index].title = [];
            }
            if (newEntries[index].title.includes(value)) {
              newEntries[index].title = newEntries[index].title.filter(t => t !== value);
            } else {
              newEntries[index].title.push(value);
            }
          }
          break;
        case 'isClosed':
          const newValue = !newEntries[index].isClosed;
          newEntries[index].isClosed = newValue;
          console.log(`Restaurant ${index} is now ${newValue ? 'Closed' : 'Open'}`);
          break;
        default:
          newEntries[index][field] = value;
      }
      return newEntries;
    });
  };

  const handleTitleSelect = (index, selectedTitle) => {
    console.log("Title clicked:", selectedTitle);

    setEntries(prev => {
      const newEntries = JSON.parse(JSON.stringify(prev)); // Deep copy

      // Initialize title array if needed
      if (!Array.isArray(newEntries[index].title)) {
        newEntries[index].title = [];
      }

      // Check if title is already selected
      const titleIndex = newEntries[index].title.indexOf(selectedTitle);

      if (titleIndex >= 0) {
        // Remove if already selected
        newEntries[index].title.splice(titleIndex, 1);
        console.log("Removed title:", selectedTitle);
      } else {
        // Add if not selected
        newEntries[index].title.push(selectedTitle);
        console.log("Added title:", selectedTitle);
      }

      console.log("Updated titles:", newEntries[index].title);
      return newEntries;
    });
  };

  const handleFileInputChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileURL = URL.createObjectURL(file);

    setImageFilesUrls(prev => {
      const newUrls = [...prev];
      if (!newUrls[index]) newUrls[index] = {};
      newUrls[index][e.target.name] = fileURL;
      return newUrls;
    });

    setImageFiles(prev => {
      const newFiles = [...prev];
      if (!newFiles[index]) newFiles[index] = {};
      newFiles[index][e.target.name] = file;
      return newFiles;
    });
  };

  const handleMapClick = (index, position) => {
    if (!position?.latLng) return;

    const lat = position.latLng.lat();
    const lng = position.latLng.lng();

    if (typeof lat !== 'number' || typeof lng !== 'number') return;

    setEntries(prev => {
      const newEntries = [...prev];
      try {
        newEntries[index].location = new GeoPoint(lat, lng);
        newEntries[index].mapLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      } catch (error) {
        toast.error('Invalid location coordinates');
      }
      return newEntries;
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setProgress(0);
      setProcessedCount(0);
      const totalEntries = entries.length;

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        let updatedEntry = { ...entry };
        const imageDir = "restaurants";

        if (imageFiles[i]?.main_image) {
          updatedEntry.main_image = await uploadImage(imageFiles[i].main_image, imageDir);
        } else {
          updatedEntry.main_image = "";
        }

        if (imageFiles[i]?.bg_image) {
          updatedEntry.bg_image = await uploadImage(imageFiles[i].bg_image, imageDir);
        } else {
          updatedEntry.bg_image = "";
        }

        await addRestaurant({
          formData: updatedEntry,
          menuData: {}
        });

        // Update progress after each restaurant
        const newProcessedCount = i + 1;
        setProcessedCount(newProcessedCount);
        setProgress(Math.round((newProcessedCount / totalEntries) * 100));
      }

      toast.success('Restaurants added successfully');

      // Reset the form
      setEntries([{ ...initialEntry }]);
      setImageFiles([{}]);
      setImageFilesUrls([{}]);
      setProgress(0);
      setProcessedCount(0);

    } catch (error) {
      console.error('Error adding restaurants:', error);
      toast.error('Failed to add restaurants');
    } finally {
      setIsSubmitting(false);
    }
  };
  const toggleIsClosed = (index, currentValue) => {
    return () => {
      setEntries(prev => {
        const newEntries = [...prev];
        newEntries[index].isClosed = !currentValue;

        return newEntries;
      });
    };
  };
  if (!isOpen) return null;

  const renderFormField = (entry, index, field) => {
    const commonClasses = "w-full p-2 border rounded";

    switch (field.type) {
      case 'text':
        if (field.name === 'Category' || field.name === 'sub_categories') {
          const displayValue = Array.isArray(entry[field.name])
            ? entry[field.name].join('+')
            : entry[field.name];

          return (
            <input
              type="text"
              value={displayValue}
              onChange={(e) => handleEntryChange(index, field.name, e.target.value)}
              placeholder="example1+example2+example3"
              className={commonClasses}
            />
          );
        } else {
          return (
            <input
              type="text"
              value={entry[field.name] || ""}
              onChange={(e) => handleEntryChange(index, field.name, e.target.value)}
              placeholder={field.name === 'time' ? '15-25 min' : ''}
              className={commonClasses}
            />
          );
        }
      case 'textarea':
        return (
          <textarea
            value={entry[field.name]}
            onChange={(e) => handleEntryChange(index, field.name, e.target.value)}
            className={commonClasses}
            rows="3"
          />
        );
      case 'file':
        return (
          <div>
            <input
              type="file"
              name={field.name}
              onChange={(e) => handleFileInputChange(index, e)}
              className={commonClasses}
              accept="image/*"
            />
            {imageFilesUrls[index]?.[field.name] && (
              <img
                src={imageFilesUrls[index][field.name]}
                alt={`${field.label} preview`}
                className="mt-2 h-20 w-20 object-cover rounded"
              />
            )}
          </div>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleIsClosed(index, entry[field.name])}
              className={`px-4 py-2 rounded-md focus:outline-none ${entry[field.name]
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white"
                }`}
            >
              {entry[field.name] ? "Closed" : "Open"}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={() => onClose()}>
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">Bulk Add Restaurants</h2>

        {entries.map((entry, index) => (
          <div key={index} className="border p-4 mb-4 rounded">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Restaurant #{index + 1}</h3>
              {entries.length > 1 && (
                <button
                  onClick={() => setEntries(prev => prev.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'rest_name', label: 'Restaurant Name', type: 'text' },
                { name: 'time', label: 'Time', type: 'text' },
                { name: 'Category', label: 'Categories (Seperated by +)', type: 'text' },
                { name: 'sub_categories', label: 'Sub Categories (Seperated by +)', type: 'text' },
                { name: 'isClosed', label: 'Restaurant Status', type: 'checkbox' },
                { name: 'main_image', label: 'Main Image', type: 'file' },
                { name: 'bg_image', label: 'Background Image', type: 'file' }
              ].map((field) => (
                <div key={field.name} className={field.colSpan ? 'col-span-2' : ''}>
                  <label className="block mb-2">{field.label}</label>
                  {renderFormField(entry, index, field)}
                </div>
              ))}

              <div className="col-span-2">
                <label className="block mb-2">Location</label>
                <div className="w-full h-[300px] rounded-lg overflow-hidden">
                  <Map
                    markerPosition={{
                      lat: entry.location.latitude,
                      lng: entry.location.longitude
                    }}
                    onMapClick={(position) => handleMapClick(index, position)}
                    isLoaded={isLoaded}
                  />
                </div>
                <input
                  type="text"
                  value={entry.mapLink || ""}
                  readOnly
                  className="mt-2 w-full p-2 bg-gray-100 border rounded"
                />
              </div>

              <div className="col-span-2">
                <label className="block mb-2">Titles (click to select)</label>
                <div className="bg-gray-200 p-3 rounded-xl">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {titles.map((title) => (
                      <div
                        key={title}
                        onClick={() => handleTitleSelect(index, title)}
                        className={`cursor-pointer p-3 rounded transition-all ${Array.isArray(entry.title) && entry.title.includes(title)
                          ? "bg-green-500 text-white font-medium"
                          : "bg-white hover:bg-gray-100"
                          }`}
                      >
                        {title}
                      </div>
                    ))}
                  </div>
                </div>

                {Array.isArray(entry.title) && entry.title.length > 0 && (
                  <div className="mt-3 bg-gray-100 p-3 rounded">
                    <p className="text-sm text-gray-600 mb-1">Selected titles:</p>
                    <SelectedTitles
                      titles={entry.title}
                      onRemove={(title) => handleTitleSelect(index, title)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setEntries(prev => [...prev, initialEntry])}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Another Restaurant
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isSubmitting ? 'Submitting...' : 'Submit All'}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>

        {isSubmitting && (
          <div className="mt-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                Creating restaurants: {processedCount} of {entries.length}
              </span>
              <span className="text-sm font-medium text-blue-600">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkEntryForm;