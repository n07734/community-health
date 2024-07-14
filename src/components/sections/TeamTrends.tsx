
import { connect } from 'react-redux'
import { withStyles, useTheme, CSSProperties } from '@mui/styles'
import { EventInfo, PullRequest } from '../../types/FormattedData'
import { UsersInfo, UserData } from '../../types/State'
import { Theme } from '@mui/material/styles'

import { useShowNames } from '../../state/ShowNamesProvider'
import { P, UL, LI } from '../shared/StyledTags'
import Paper from '../shared/Paper'
import GraphsWrap from '../shared/GraphsWrap'
import ChartDescription from '../shared/ChartDescription'
import Bar from '../charts/Bar'
import Chord from '../charts/Chord'
import Line from '../charts/Line'
import Pie from '../charts/Pie'
import { splitByAuthor, rainbowData } from '../charts/lineHelpers'
import { sortByKeys } from '../../utils'

type TeamTrendsProps = {
    pullRequests: PullRequest[]
    releases?: EventInfo[]
    chunkyData: any[]
    usersData?: UserData[]
    allRepos?: any
    userIds?: string[]
    usersInfo?: UsersInfo
    classes: Record<string, string>
}
const TeamTrends = ({
    pullRequests = [],
    releases = [],
    chunkyData = [],
    usersData = [],
    allRepos = {},
    userIds = [],
    usersInfo = {},
    classes,
}: TeamTrendsProps) => {
    const theme:Theme = useTheme();
    const colorA = theme.palette.secondary.main
    const colorB = theme.palette.primary.main

    const { showNames } = useShowNames()

    const maxAuthors = userIds.length || 15
    const sortedUsers = usersData
        .sort(sortByKeys(['commentsByUser, approvalsByUser']))

    const barData = sortedUsers
        .map((x,i) => ({
            ...x,
            // Needs white space padding to keep the bars
            author: showNames ? x.author : `${Array(i).fill(' ').join('')}Spartacus`,
            name: showNames ? usersInfo[x.author]?.name || x.author : `${Array(i).fill(' ').join('')}Spartacus`,
        }))

    const chordDataWithName:UserData[] = sortedUsers
        .map((x) => ({
            ...x,
            name: usersInfo[x.author]?.name || x.author,
        }))

    const repoPie = rainbowData('repo', allRepos)
    const byAuthorData = splitByAuthor({ pullRequests, showNames, usersInfo })

    const withApprovalsByUserLength = chordDataWithName.filter(x => x.approvalsGiven > 0).length
    const withCommentsByUserLength = chordDataWithName.filter(x => x.commentsGiven > 0).length
    return usersData.length > 0 && (
        <Paper>
            <ChartDescription
                title="Contributions"
                expandText='guidance'
            >
                <P>Questions worth asking (with team context):</P>
                <UL>
                    <LI>Is there a bus factor risk?</LI>
                    <LI>Are there any data points that stand out?</LI>
                    <LI>How do the given and received metrics look?</LI>
                    <LI>How well spread are the collaboration metrics?</LI>
                    <LI>Any insights or things you would like to try to impact these metrics?</LI>
                </UL>
            </ChartDescription>
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

                {
                    (withCommentsByUserLength > 0 || withApprovalsByUserLength > 0) &&
                        <div className={classes.groupedCharts}>
                            {
                                withCommentsByUserLength > 0 &&
                                    <Chord
                                        data={chordDataWithName}
                                        preSorted={true}
                                        dataKey="commentsByUser"
                                        title="Comment contributions"
                                    />
                            }
                            {
                                withApprovalsByUserLength > 0 &&
                                    <Chord
                                        data={chordDataWithName}
                                        preSorted={true}
                                        dataKey="approvalsByUser"
                                        title="Approval contributions"
                                    />
                            }
                        </div>
                }
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

type TagStyles = {
    [key: string]: CSSProperties
}
const styles = ():TagStyles => ({
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

type State = {
    usersData: UserData[]
    fetches: {
        userIds: string[]
        usersInfo: UsersInfo
    }
}
const mapStateToProps = (state:State) => ({
    usersData: state.usersData,
    userIds: state.fetches.userIds,
    usersInfo: state.fetches.usersInfo,
})

export default connect(mapStateToProps)(withStyles(styles)(TeamTrends))
