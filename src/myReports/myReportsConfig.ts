type OneOf = {
    localData: object
    externalURL?: string
} | {
    localData?: object
    externalURL: string
}
type Report = OneOf & {
    name: string
    fileName: string
}
const myPreFetchedReports: Report[] = [
    // {
    //     name: 'REPORT_NAME',
    //     fileName: 'REPORT_FILE_NAME',
    //     localData: await import('./REPORT_FILE_NAME.json'), // Use this if the report is from a local file
    //     externalURL: 'https://THING.github.io/PATH/', // Or use this if you host the report file via a website eg GitHub pages
    // },
]

try {
    // If user adds myReport1 to this dir they will see the report when running the app
    // const myReport: Report = {
    //     name: 'Report 1',
    //     fileName: 'bluesky-social-social-app',
    //     localData: await import('./bluesky-social-social-app.json'),
    // }
    // myPreFetchedReports.push(myReport)
} catch (error) {
    // Expected as they may not have added a myReport1.json file
}

export {
    myPreFetchedReports,
}
