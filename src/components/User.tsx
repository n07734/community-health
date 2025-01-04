
import { EventInfo, PullRequest } from '@/types/FormattedData'
import { Lines, ColumnKeys } from '@/types/Graphs'
import { AllowedColors } from '@/types/Components'

import { useTheme } from '@/components/ThemeProvider'
import { graphColors } from '@/components/colors'

import { Button } from '@/components/ui/button'
import Paper from './shared/Paper'
import Line from './charts/Line'
import StatBars from './charts/StatBars'

import { chunkData } from './charts/lineHelpers'
import { useSubPage } from '@/state/SubPageProvider'
import usersAverageData from '@/format/usersAverageData'
import { colors } from '@/components/colors'
import { useDataStore } from '@/state/fetch'

const userGraphs = (
    pullRequests:PullRequest[] = [],
    releases:EventInfo[] = [],
    userName:string,
    colorA: AllowedColors,
    colorB: AllowedColors,
) => {
    const peerPrData:PullRequest[] = []
    const userPrData:PullRequest[] = []

    pullRequests
        .forEach((item) => {
            const {
                author,
            } = item

            if (author === userName) {
                userPrData.push(item)
            } else {
                peerPrData.push(item)
            }
        })

    const chunkyData = chunkData(userPrData)

    return [
        {
            markers: releases,
            showLegends: true,
            title: 'Sentiments in PR',
            data: [{
                lines: [
                    {
                        label: `${userName} received`,
                        color: colors[2],
                        dataKey: 'commentSentimentScore',
                        data: userPrData,
                    },
                    {
                        label: `${userName} given`,
                        color: colors[1],
                        dataKey: 'commentAuthorSentimentScore',
                        data: userPrData,
                    },
                    {
                        label: 'Peer received',
                        color: colors[4],
                        dataKey: 'commentSentimentScore',
                        data: peerPrData,
                    },
                    {
                        label: 'Peer given',
                        color: colors[5],
                        dataKey: 'commentAuthorSentimentScore',
                        data: peerPrData,
                    },
                ],
                xAxis: 'left',
            }] as Lines[],
            tableKeys:['commentSentimentScore', 'commentAuthorSentimentScore'] as ColumnKeys[],
            tableData: chunkyData,
        },
        {
            markers: releases,
            data: [{
                lines: [
                    {
                        label: 'User PR size',
                        color: colorA,
                        dataKey: 'prSize',
                        data: userPrData,
                    },
                    {
                        label: 'Peer PR size',
                        color: colorB,
                        dataKey: 'prSize',
                        data: peerPrData,
                    },
                ],
                xAxis: 'left',
            }] as Lines[],
            tableKeys:['prSize'] as ColumnKeys[],
            tableData: chunkyData,
        },
        {
            markers: releases,
            data: [{
                lines: [
                    {
                        label: 'User PR age',
                        color: colorA,
                        dataKey: 'age',
                        data: userPrData,
                    },
                    {
                        label: 'Peer PR age',
                        color: colorB,
                        dataKey: 'age',
                        data: peerPrData,
                    },
                ],
                xAxis: 'left',
            }] as Lines[],
            tableKeys:['age'] as ColumnKeys[],
            tableData: chunkyData,
        },
    ]
}

const UserView = () => {
    const pullRequests = useDataStore(state => state.pullRequests)
    const releases = useDataStore(state => state.releases)
    const usersData = useDataStore(state => state.usersData)

    const { userPage: user, clearUserPage } = useSubPage()
    const { theme } = useTheme()
    const colorA = graphColors[theme].secondary
    const colorB = graphColors[theme].primary

    const graphs = userGraphs(pullRequests, releases, user, colorA, colorB)
    const [userData, averagedData, userCount] = usersAverageData(usersData, user)

    const usersName = userData.name || user

    return (
        <Paper>
            <Button
                className="w-full mb-4"
                color="secondary"
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                    e.preventDefault()
                    clearUserPage()
                    window && window.scrollTo(0, 0)
                }} >
                Back to main view
            </Button>

            <p className="w-full text-center">A collection metrics showing {usersName}'s data and average data from the top {userCount} peers</p>
            <StatBars player1={userData} player2={averagedData} />
            {
                graphs.length
                    && graphs
                        .map((lineInfo, i) =>
                            <Line key={`${i}-${user}`} {...lineInfo} />,
                        )
            }

            <Button
                className="w-full mb-4"
                color="secondary"
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                    e.preventDefault()
                    clearUserPage()
                    window && window.scrollTo(0, 0)
                }} >
                Back to main view
            </Button>
        </Paper>
    )
}

export default UserView