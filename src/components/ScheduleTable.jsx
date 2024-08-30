import React from "react";

const ScheduleTable = ({ schedule, onChange }) => {
  // Ensure schedule is an object with valid days
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  if (!schedule || typeof schedule !== "object") {
    
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
              <td className="py-2 px-4 border-b">No data</td>
              <td className="py-2 px-4 border-b">No data</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

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
                onChange={(e) => onChange(day, 'open', e.target.value)}
                className="border border-gray-300 rounded-lg p-1"
              />
            </td>
            <td className="py-2 px-4 border-b">
              <input
                type="time"
                value={schedule[day]?.close || ""}
                onChange={(e) => onChange(day, 'close', e.target.value)}
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
