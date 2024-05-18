
import { connect } from 'react-redux'
import { withStyles, useTheme } from '@material-ui/core/styles'

import { P } from '../shared/StyledTags'
import Paper from '../shared/Paper'
import GraphsWrap from '../shared/GraphsWrap'
import ChartDescription from '../shared/ChartDescription'
import Bar from '../charts/Bar'
import Chord from '../charts/Chord'
import Line from '../charts/Line'
import Pie from '../charts/Pie'
import { splitByAuthor, rainbowData } from '../charts/lineHelpers'
import { sortByKeys } from '../../utils'

const TeamTrends = ({
    pullRequests = [],
    releases = [],
    chunkyData = [],
    usersData = [],
    allRepos = {},
    userIds = [],
    usersInfo = {},
    hiddenNames = false,
    classes,
} = {}) => {
    const theme = useTheme();
    const colorA = theme.palette.secondary.main
    const colorB = theme.palette.primary.main

    const maxAuthors = userIds.length || 15
    const sortedUsers = usersData
        .sort(sortByKeys(['commentsByUser, approvalsByUser']))

    const barData = sortedUsers
        .map((x,i) => ({
            ...x,
            // Needs white space padding to keep the bars
            author: hiddenNames ? `${Array(i).fill(' ').join('')}Spartacus` : x.author,
            name: hiddenNames ? `${Array(i).fill(' ').join('')}Spartacus` : usersInfo[x.author]?.name || x.author,
        }))

    const chordDataWithName = sortedUsers
        .map((x) => ({
            ...x,
            name: usersInfo[x.author]?.name || x.author,
        }))

    const repoPie = rainbowData('repo', allRepos)
    const byAuthorData = splitByAuthor(pullRequests, hiddenNames, usersInfo)

    return usersData.length > 0 && (
        <Paper>
            <ChartDescription
                title="Contributions"
            />
            <GraphsWrap>
                <div className={classes.barsWrap}>
                    <div className={classes.barWrap}>
                        <Bar
                            data={barData}
                            indexBy="name"
                            title="Comments"
                            combineTitles={true}
                            sortBy="commentsGiven"
                            max={maxAuthors}
                            bars={[
                                {
                                    dataKey: 'commentsGiven',
                                    color: colorA,
                                    label: 'given',
                                },
                                {
                                    dataKey: 'commentsReceived',
                                    color: colorB,
                                    label: '*received',
                                },
                            ]}
                        />
                        <P>*Received comments can also come from out of team so can be higher.</P>
                    </div>

                    <Bar
                        data={barData}
                        indexBy="name"
                        title="PRs"
                        combineTitles={true}
                        sortBy="uniquePRsApproved"
                        max={maxAuthors}
                        bars={[
                            {
                                dataKey: 'uniquePRsApproved',
                                color: colorA,
                                label: 'approved',
                            },
                            {
                                dataKey: 'totalPRs',
                                color: colorB,
                                label: 'opened',
                            },
                        ]}
                    />
                </div>
                <div className={classes.groupedCharts}>
                    <Chord
                        data={chordDataWithName}
                        preSorted={true}
                        hideNames={hiddenNames}
                        dataKey="commentsByUser"
                        title="Comment contributions"
                    />
                    <Chord
                        data={chordDataWithName}
                        preSorted={true}
                        hideNames={hiddenNames}
                        dataKey="approvalsByUser"
                        title="Approval contributions"
                    />
                </div>
                <P>These chord charts show how contributions are given and received, the dominant colour indicates more contribution</P>
                {
                    byAuthorData.length > 0 && byAuthorData?.[0]?.lines?.length < 21 &&
                        <Line
                            title="PRs by author"
                            markers={releases}
                            showLegends={true}
                            data={byAuthorData}
                            tableData={chunkyData}
                            tableKeys={['author', 'repo']}
                        />
                }
                {
                    repoPie.pieData.length > 0 &&
                        <Pie
                            data={repoPie.pieData}
                            title={repoPie.sectionTitle}
                        />
                }
            </GraphsWrap>
        </Paper>
    )
}

const styles = () => ({
    groupedCharts: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0 20px',
        '& p': {
            flexBasis: '100%',
            textAlign: 'center',
        },
    },
    barsWrap: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        '& > div': {
            width: '50%',
            '@media (max-width: 750px)': {
                width: '100%',
            },
        },
    },
    bars: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 0 1rem 0',
        '& > div': {
            width: '100%',
        },
    },
})

const mapStateToProps = (state) => ({
    usersData: state.usersData,
    userIds: state.fetches.userIds,
    usersInfo: state.fetches.usersInfo,
    hiddenNames: state.hiddenNames,
})

export default connect(mapStateToProps)(withStyles(styles)(TeamTrends))
