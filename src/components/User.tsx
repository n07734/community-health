
import { connect } from 'react-redux'
import { withStyles, useTheme, CSSProperties } from '@mui/styles'
import { Theme } from '@mui/material/styles'

import { P } from './shared/StyledTags'
import Button from './shared/Button'
import Paper from './shared/Paper'
import Line from './charts/Line'
import StatBars from './charts/StatBars'
import { chunkData } from './charts/lineHelpers'
import { useSubPage } from '../state/SubPageProvider'
import usersAverageData from '../format/usersAverageData'
import { EventInfo, PullRequest } from '../types/FormattedData'
import { UserData } from '../types/State'

const userGraphs = (
    pullRequests:PullRequest[] = [],
    releases:EventInfo[] = [],
    userName:string,
    theme:Theme
) => {
    const peerPrData:PullRequest[] = []
    const userPrData:PullRequest[] = []
    const reposSet = new Set<string>()
    const colorA = theme.palette.secondary.main
    const colorB = theme.palette.primary.main
    const colorList = theme.palette.colorList

    pullRequests
        .forEach((item) => {
            const {
                author,
                repo,
            } = item
            reposSet.add(repo)
            item[`repo-${repo}`] = 1

            if (author === userName) {
                userPrData.push(item)
            } else {
                peerPrData.push(item)
            }
        })

    const repoLines = []
    const repos = Array.from(reposSet)
    repos
        .forEach((repo, i) => {
            repoLines.push({
                label: repo,
                color: colorList[i % colorList.length],
                groupMath: 'count',
                filterForKey: true,
                dataKey: `repo-${repo}`,
                data: userPrData,
            })
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
                        color: colorList[2],
                        dataKey: 'commentSentimentScore',
                        data: userPrData,
                    },
                    {
                        label: `${userName} given`,
                        color: colorList[1],
                        dataKey: 'commentAuthorSentimentScore',
                        data: userPrData,
                    },
                    {
                        label: 'Peer received',
                        color: colorList[4],
                        dataKey: 'commentSentimentScore',
                        data: peerPrData,
                    },
                    {
                        label: 'Peer given',
                        color: colorList[5],
                        dataKey: 'commentAuthorSentimentScore',
                        data: peerPrData,
                    },
                ],
                xAxis: 'left',
            }],
            tableKeys:['commentSentimentScore', 'commentAuthorSentimentScore'],
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
            }],
            tableKeys:['prSize'],
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
            }],
            tableKeys:['age'],
            tableData: chunkyData,
        },
        {
            dataKeys:['repo', 'author'],
            data: chunkyData,
        },
    ]
}

type UserViewProps = {
    pullRequests: PullRequest[]
    releases: EventInfo[]
    usersData: UserData[]
    classes: Record<string, string>
}
const UserView = ({
    pullRequests = [],
    releases = [],
    usersData = [],
    classes,
}:UserViewProps) => {
    const theme:Theme = useTheme();
    const { userPage: user, clearUserPage } = useSubPage()

    const graphs = userGraphs(pullRequests, releases, user, theme)
    const [userData, averagedData] = usersAverageData(usersData, user)

    const usersName = userData.name || user

    return (
        <Paper>
            <Button
                className={classes.fill}
                value="Back to main view"
                color="secondary"
                onClick={(e) => {
                    e.preventDefault()
                    clearUserPage()
                    window && window.scrollTo(0, 0)
                }} />

            <P className={classes.copy}>A collection metrics showing {usersName}'s data and average data from the top {averagedData.userCount} peers</P>
            <StatBars player1={userData} player2={averagedData} />
            {
                graphs.length
                    && graphs
                        .map((lineInfo, i) =>
                            <Line key={`${i}-${user}`} {...lineInfo} />,
                        )
            }

            <Button
                className={classes.fill}
                value="Back to main view"
                color="secondary"
                onClick={(e) => {
                    e.preventDefault()
                    clearUserPage()
                    window && window.scrollTo(0, 0)
                }} />
        </Paper>
    )
}

type State = {
    pullRequests: PullRequest[]
    releases: EventInfo[]
    usersData: UserData[]

}
const mapStateToProps = (state:State) => ({
    pullRequests: state.pullRequests,
    releases: state.releases,
    usersData: state.usersData,
})

type TagStyles = {
    [key: string]: CSSProperties
}
const styles = (theme:Theme):TagStyles => ({
    fill: {
        width: '100%',
    },
    copy: {
        width: '100%',
        textAlign: 'center',
    },
    topButton: {
        marginLeft: theme.mySpacing.y.large,
    },
})

export default connect(mapStateToProps)(withStyles(styles)(UserView))