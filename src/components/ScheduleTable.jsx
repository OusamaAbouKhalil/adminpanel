import React from 'react';

const ScheduleTable = ({ schedule, onChange }) => {
  // Check if schedule is undefined or not an object, default to an empty object
  const safeSchedule = schedule || {};

  const handleTimeChange = (day, index, value) => {
    const newSchedule = { ...safeSchedule };
    if (!newSchedule[day]) newSchedule[day] = [];
    newSchedule[day][index] = value;
    onChange(newSchedule);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Schedule</h2>
      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
        <div key={day} className="mb-2">
          <h3 className="text-lg font-semibold">{day}</h3>
          <input
            type="text"
            placeholder="Opening Time"
            value={(safeSchedule[day] && safeSchedule[day][0]) || ''}
            onChange={(e) => handleTimeChange(day, 0, e.target.value)}
            className="border border-gray-300 rounded-lg p-2 mr-2"
          />
          <input
            type="text"
            placeholder="Closing Time"
            value={(safeSchedule[day] && safeSchedule[day][1]) || ''}
            onChange={(e) => handleTimeChange(day, 1, e.target.value)}
            className="border border-gray-300 rounded-lg p-2"
          />
        </div>
      ))}
    </div>
  );
};

export default ScheduleTable;
