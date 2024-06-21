
import { connect } from 'react-redux'
import { withStyles, useTheme } from '@mui/styles'

import { P } from './shared/StyledTags'
import Button from './shared/Button'
import Paper from './shared/Paper'
import Line from './charts/Line'
import StatBars from './charts/StatBars'
import { chunkData } from './charts/lineHelpers'
import { useSubPage } from '../state/SubPageProvider'
import usersAverageData from '../format/usersAverageData'

const userGraphs = (pullRequests = [], releases = [], userName, theme) => {
    const peerPrData = []
    const userPrData = []
    const repos = new Set()
    const colorA = theme.palette.secondary.main
    const colorB = theme.palette.primary.main
    const colorList = theme.palette.colorList

    pullRequests
        .forEach((item = {}) => {
            const {
                author,
                repo,
            } = item
            repos.add(repo)
            item[`repo-${repo}`] = 1

            if (author === userName) {
                userPrData.push(item)
            } else {
                peerPrData.push(item)
            }
        })

    const repoLines = []
    repos
        .forEach((repo, i) => {
            repoLines.push({
                label: repo,
                color: colorList[i % colorList.length],
                groupMath: 'count',
                filterForKey: `repo-${repo}`,
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

const UserView = ({
    pullRequests = [],
    releases = [],
    usersData = [],
    classes,
} = {}) => {
    const theme = useTheme();
    const { userPage: user, clearUserPage } = useSubPage()

    const graphs = userGraphs(pullRequests, releases, user, theme)
    const [userData, averagedData] = usersAverageData(usersData, user)

    const usersName = userData.name || user

    return (
        <Paper>
            <Button
                className={classes.fill}
                variant="outlined"
                size="small"
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
                variant="outlined"
                size="small"
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

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
    releases: state.releases,
    usersData: state.usersData,
})

const styles = theme => ({
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