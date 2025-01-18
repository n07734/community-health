import fs from 'fs'

import {
    ErrorUI,
    FetchInfo,
} from '../src/types/State'

import {
    preFetchedSRank24,
    preFetchedRepos,
    preFetchedTeams,
    preFetchedOrgs,
    preFetchedUsers,
} from '../src/preFetchedInfo'

import { EventInfo, Issue, PullRequest } from '../src/types/FormattedData'
import { fetchGitHubData, getReportData } from '../src/state/actions'
import { chartConfigDefault, getReportType } from '../src/state/fetch'


const reportsSet = new Set<string>([]);

([
    ...preFetchedSRank24,
    ...preFetchedRepos,
    ...preFetchedTeams,
    ...preFetchedOrgs,
    ...preFetchedUsers,
])
    .forEach((report) => {
        reportsSet.add(report.fileName)
    })

const cliArgs = process.argv.slice(2)

const updateReport = async (report) => {
    try {
        type Report = {
            fetches: FetchInfo,
            filteredPRs: PullRequest[],
            pullRequests: PullRequest[],
            filteredReviewedPRs?: PullRequest[],
            reviewedPullRequests?: PullRequest[],
            issues: Issue[],
            filteredIssues: Issue[],
            releases: EventInfo[],
            filteredReleases?: EventInfo[],
        }
        const {
            fetches: fetchesFromReport,
        } = report as Report

        const reportType = fetchesFromReport.reportType || getReportType(fetchesFromReport)

        const fetches: FetchInfo = {
            ...fetchesFromReport,
            token: cliArgs[0],
            sortDirection: 'ASC',
            amountOfData: 'all',
            reportType,
        }

        console.log('reportType', reportType)
        console.log('fetches', fetches)

        const {
            newReportData,
            newFetchInfo,
        } = await fetchGitHubData(fetches, report)

        const updatedData = {
            fetches: {
                ...fetches,
                ...newFetchInfo,
            },
            ...newReportData,
            chartConfig: report?.chartConfig || chartConfigDefault,
        }

        const reportData = getReportData(report.preFetchedName)(updatedData)
        fs.writeFileSync(`${report.preFetchedName}.json`, JSON.stringify(reportData, null, 2))
    } catch (err) {
        const error = err as ErrorUI
        console.log('error', error)
        throw error
    }
}

const allReports =  async () => {
    const reports = [...reportsSet]
    console.log('reports', reports)
    return await Promise.all([
        [
            // 'shadcn',
            'ViteCore',
        ]
            .map(async (fileName) => {
                try {
                    const reportJson = fs.readFileSync(`../data/${fileName}.json`, 'utf8')
                    const report = JSON.parse(reportJson)
                    console.log('fileName: report', fileName)
                    await updateReport(report)
                } catch (err) {
                    console.log('fileName: err', fileName, err)
                }
            }),
    ])
}

allReports()

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception thrown:', error);
    // Application specific logging, throwing an error, or other logic here
});