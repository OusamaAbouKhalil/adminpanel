// import React from 'react'
// import { ChartComponent, SeriesCollectionDirective, SeriesDirective, Inject, Legend, Category, StackingColumnSeries, Tooltip } from '@syncfusion/ej2-react-charts'
// import { stackedChartData, stackedCustomSeries, stackedPrimaryXAxis, stackedPrimaryYAxis} from '../../data/dummy'
// const Stacked = ({ width, height}) => {
//   return (
//     <ChartComponent
//       id="charts"
//       primaryXAxis={stackedPrimaryXAxis}
//       primaryYAxis={stackedPrimaryYAxis}
//       width={width}
//       height={height}
//       chartArea={{ border: { width: 0 } }}
//       tooltip={{ enable: true }}
//       legendSettings={{ background: 'white' }}
//     >
//       <Inject services={[StackingColumnSeries, Category, Legend, Tooltip]} />
//       <SeriesCollectionDirective>
//         {stackedCustomSeries.map((item, index) => <SeriesDirective key={index} {...item} />)}
//       </SeriesCollectionDirective>
//     </ChartComponent>
//   )
// }

// export default Stacked
import React from 'react'

const Stacked = () => {
  return (
    <div>Stacked</div>
  )
}

export default Stacked