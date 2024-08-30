import React, { useState } from 'react';

const ScheduleTable = ({ schedule, onChange }) => {
  const handleTimeChange = (day, index, type, value) => {
    const updatedSchedule = { ...schedule };
    updatedSchedule[day][index][type] = value;
    onChange(updatedSchedule);
  };

  const handleAddTimeSlot = (day) => {
    const updatedSchedule = { ...schedule };
    if (!updatedSchedule[day]) {
      updatedSchedule[day] = [];
    }
    updatedSchedule[day].push({ openingTime: '', closingTime: '' });
    onChange(updatedSchedule);
  };

  const handleRemoveTimeSlot = (day, index) => {
    const updatedSchedule = { ...schedule };
    updatedSchedule[day].splice(index, 1);
    if (updatedSchedule[day].length === 0) {
      delete updatedSchedule[day];
    }
    onChange(updatedSchedule);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Schedule</h2>
      {Object.keys(schedule).map((day) => (
        <div key={day} className="mb-4">
          <h3 className="font-semibold text-gray-700">{day}</h3>
          {schedule[day].map((slot, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="time"
                value={slot.openingTime}
                onChange={(e) => handleTimeChange(day, index, 'openingTime', e.target.value)}
                className="border border-gray-300 rounded-lg p-2 mr-2"
              />
              <input
                type="time"
                value={slot.closingTime}
                onChange={(e) => handleTimeChange(day, index, 'closingTime', e.target.value)}
                className="border border-gray-300 rounded-lg p-2 mr-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveTimeSlot(day, index)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-lg"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddTimeSlot(day)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded-lg"
          >
            Add Time Slot
          </button>
        </div>
      ))}
    </div>
  );
};

export default ScheduleTable;
