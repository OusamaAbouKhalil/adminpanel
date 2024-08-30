import React from "react";

const ScheduleTable = ({ schedule, onChange }) => {
  if (!schedule || typeof schedule !== "object") return null;

  const handleChange = (day, field, value) => {
    onChange(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  return (
    <table className="min-w-full bg-white border border-gray-200">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Day</th>
          <th className="py-2 px-4 border-b">Open Time</th>
          <th className="py-2 px-4 border-b">Close Time</th>
        </tr>
      </thead>
      <tbody>
        {daysOfWeek.map(day => (
          <tr key={day}>
            <td className="py-2 px-4 border-b">{day}</td>
            <td className="py-2 px-4 border-b">
              <input
                type="time"
                value={schedule[day]?.open || ""}
                onChange={(e) => handleChange(day, 'open', e.target.value)}
                className="border border-gray-300 rounded-lg p-1"
              />
            </td>
            <td className="py-2 px-4 border-b">
              <input
                type="time"
                value={schedule[day]?.close || ""}
                onChange={(e) => handleChange(day, 'close', e.target.value)}
                className="border border-gray-300 rounded-lg p-1"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ScheduleTable;
