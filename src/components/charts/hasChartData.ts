const hasChartData = <T>(dataArray: T[], keys: Array<keyof T>) => keys
    .some(key => dataArray
        .some(dataItem => dataItem[key]),
    )

export default hasChartData
