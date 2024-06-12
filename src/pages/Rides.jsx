import React from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Resize, Sort, ContextMenu, Filter, Page, ExcelExport, PdfExport, Edit, Inject } from '@syncfusion/ej2-react-grids';

import { ordersData, contextMenuItems, ordersGrid } from '../data/dummy';
import { useStateContext } from '../contexts/ContextProvider';
import { Header } from '../components';

export default function Rides() {
  const {rides} = useStateContext();
  return (
    <div className='m-2 md:m-10 p-2 bg-white rounded-3xl'>
      <Header category='Page' title='Rides'/>
      <GridComponent
      id='gridcomp'
      dataSource={rides}
      allowPaging
      allowSorting
      allowExcelExport
      allowPdfExport
      contextMenuItems={contextMenuItems}
      >
        <ColumnsDirective>
          {ordersGrid.map((item, index) =>(
            <ColumnDirective key={index}{...item}/>
          ))}
        </ColumnsDirective>
        <Inject services={[Resize, Sort, ContextMenu, Filter, Page, ExcelExport, Edit, PdfExport]} />
      </GridComponent>
    </div>
  )
}
