import React from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Page, Selection, Inject, Edit, Toolbar, Sort, Filter } from '@syncfusion/ej2-react-grids';

import { customersData, customersGrid } from '../data/dummy';
import { Header } from '../components';
import { useStateContext } from '../contexts/ContextProvider';

const Users = () => {
  const { users } = useStateContext();
  console.log(users);
  const editing = { allowEditing: true };

  const handleBan = (args) => {
    // Check if the clicked command is the "Ban" button
    if (args.commandColumn.field === 'ban') {
      console.log("ok")
      // Get the selected rows
      // const selectedRows = args.selectedRows;
  
      // // Update the selected rows' 'banned' property to true
      // const updatedUsers = users.map((user) => {
      //   if (selectedRows.some((row) => row.fullname === user.fullname)) {
      //     return { ...user, banned: true };
      //   }
      //   return user;
      // });
  
      // // Update the users context
      // setUsers(updatedUsers);
    }
  };
  


  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Page" title="Customers" />
      <GridComponent
        dataSource={users}
        enableHover={false}
        allowPaging
        pageSettings={{ pageCount: 5 }}
        editSettings={editing}
        allowSorting
      >
        <ColumnsDirective>
          {customersGrid.map((item, index) => <ColumnDirective key={index} {...item} />)}
        </ColumnsDirective>
        <Inject services={[Page, Selection, Toolbar, Edit, Sort, Filter]} />
      </GridComponent>
      

    </div>
  );
};

export default Users;
