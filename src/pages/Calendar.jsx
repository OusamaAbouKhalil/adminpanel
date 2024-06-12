import React from 'react'
import { ScheduleComponent, ViewDirective, ViewsDirective, Day, Week, WorkWeek, Month, Agenda, Inject, Resize, DragAndDrop, actionComplete } from '@syncfusion/ej2-react-schedule'

import db from '../utils/firebaseconfig';
import { ref, set, remove } from 'firebase/database';
import { useStateContext } from '../contexts/ContextProvider'
import { Header } from '../components'

function Calender() {
  const { scheduleDates } = useStateContext();

  const actionComplete = (args) => {
    if (args.requestType === "eventChanged") {
      // Update the event in the database
      const updatedEvent = args.changedRecords[0];
      // Format StartTime and EndTime
      updatedEvent.StartTime = updatedEvent.StartTime.toISOString();
      updatedEvent.EndTime = updatedEvent.EndTime.toISOString();
      // Set default value for Location if not provided
      if (!updatedEvent.Location) {
        updatedEvent.Location = "No Location";
      }
      // Check for undefined values and remove them
      Object.keys(updatedEvent).forEach((key) => {
        if (updatedEvent[key] === undefined) {
          delete updatedEvent[key];
        }
      });
      const eventRef = ref(db, `scheduleData/${updatedEvent.Id}`);
      set(eventRef, updatedEvent)
        .then(() => {
          console.log('Event updated successfully');
        })
        .catch((error) => {
          console.error('Error updating event:', error);
        });
    } else if (args.requestType === "eventCreated") {
      // Create a new event in the database
      const newEvent = args.addedRecords[0];
      // Format StartTime and EndTime
      newEvent.StartTime = newEvent.StartTime.toISOString();
      newEvent.EndTime = newEvent.EndTime.toISOString();
      // Set default value for Location if not provided
      if (!newEvent.Location) {
        newEvent.Location = "No Location";
      }
      // Check for undefined values and remove them
      Object.keys(newEvent).forEach((key) => {
        if (newEvent[key] === undefined) {
          delete newEvent[key];
        }
      });
      const eventRef = ref(db, `scheduleData/${newEvent.Id}`);
      set(eventRef, newEvent)
        .then(() => {
          console.log('Event created successfully');
        })
        .catch((error) => {
          console.error('Error creating event:', error);
        });
    }
    else if (args.requestType === "eventRemoved") {
      const removeEvent = args.deletedRecords[0];
      const eventRef = ref(db, `scheduleData/${removeEvent.Id}`);
      remove(eventRef);
    }
  }




  return (
    <div className='m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl'>
      <Header category="App" title="Calendar" />
      <ScheduleComponent
        height="650px"
        eventSettings={{ dataSource: scheduleDates }}
        actionComplete={actionComplete}
        selectedDate={Date.now()}
      >
        <Inject services={[Day, Week, WorkWeek, Month, Agenda, Resize, DragAndDrop]} />
      </ScheduleComponent>
    </div>
  )
}

export default Calender
