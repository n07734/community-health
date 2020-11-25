const hasChartData = dataArray => keys => keys
    .some(key => dataArray
        .some(dataItem => dataItem[key])
    )

export default hasChartData
