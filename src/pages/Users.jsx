import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from "firebase/database";
import UsersTable from '../components/UsersTable';

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const userRef = ref(getDatabase(), 'users');
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      const userList = [];

      if (data) {
        for (let id in data) {
          userList.push({ id, ...data[id] });
        }
      }

      setUsers(userList);
    });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <UsersTable users={users} />
    </div>
  );
};

export default Users;
