const myPreFetchedReports = [
    // {
    //     name: 'REPORT_NAME',
    //     fileName: 'REPORT_FILE_NAME',
    //     localData: require('./REPORT_FILE_NAME.json'), // Use this if the report is from a local file
    //     externalURL: 'https://THING.github.io/PATH/', // Or use this if you host the report file via a website eg GitHub pages
    // },
]

try {
    // If user adds myReport1 to this dir they will see the report when running the app
    // const myReport = {
    //     name: 'Report 1',
    //     fileName: 'file',
    //     localData: await import('./file.json'),
    // }
    // myPreFetchedReports.push(myReport)
} catch (error) {
    // Expected as they may not have added a myReport1.json file
}

export {
    myPreFetchedReports,
}
