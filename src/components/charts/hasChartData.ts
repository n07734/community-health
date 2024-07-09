const hasChartData = (dataArray: any[]) => (keys: string[]) => keys
    .some(key => dataArray
        .some(dataItem => dataItem[key]),
    )

export default hasChartData
