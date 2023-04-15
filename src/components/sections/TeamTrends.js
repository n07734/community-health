import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'

import { P } from '../shared/StyledTags'
import Paper from '../shared/Paper'
import GraphsWrap from '../shared/GraphsWrap'
import ChartDescription from '../shared/ChartDescription'
import Bar from '../charts/Bar'
import Chord from '../charts/Chord'
import { sortByKeys } from '../../utils'

const TeamTrends = ({
    usersData = [],
    userIds = [],
    hiddenNames = false,
    classes,
} = {}) => {
    const maxAuthors = userIds.length || 7
    const sortedUsers = usersData
        .sort(sortByKeys(['commentsByUser, approvalsByUser']))

    const barData = sortedUsers
        .map((x,i) => ({
            ...x,
            // Needs white space padding to keep the bars
            author: hiddenNames ? `${Array(i).fill(' ').join('')}Spartacus` : x.author,
        }))

    return usersData.length > 0 && (
        <Paper>
            <ChartDescription
                title="Contribution distribution"
            />
            <GraphsWrap>
                <div className={classes.groupedCharts}>
                    <P>These chord charts show how contributions are given and received, the dominant colours indicate the higher contributions</P>
                    <Chord
                        data={sortedUsers}
                        preSorted={true}
                        hideNames={hiddenNames}
                        dataKey="commentsByUser"
                        title="Comment contributions"
                    />
                    <Chord
                        data={sortedUsers}
                        preSorted={true}
                        hideNames={hiddenNames}
                        dataKey="approvalsByUser"
                        title="Approval contributions"
                    />
                </div>
                <div className={classes.barsWrap}>
                    <div className={classes.barWrap}>
                        <Bar
                            data={barData}
                            indexBy="author"
                            titlePrefix="Comments"
                            sortBy="commentsGiven"
                            max={maxAuthors}
                            bars={[
                                {
                                    dataKey: 'commentsGiven',
                                    color: '#1f77b4',
                                    label: 'given',
                                },
                                {
                                    dataKey: 'commentsReceived',
                                    color: '#e82573',
                                    label: '*received',
                                },
                            ]}
                        />
                        <P>*Received comments may be higher than given as those contributions can come from users not in this list</P>
                    </div>

                    <Bar
                        data={barData}
                        indexBy="author"
                        titlePrefix="PRs"
                        sortBy="uniquePRsApproved"
                        max={maxAuthors}
                        bars={[
                            {
                                dataKey: 'uniquePRsApproved',
                                color: '#1f77b4',
                                label: 'approved',
                            },
                            {
                                dataKey: 'totalPRs',
                                color: '#e82573',
                                label: 'opened',
                            },
                        ]}
                    />
                </div>
            </GraphsWrap>
        </Paper>
    )
}

const styles = theme => ({
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
        }
    },
    bars: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 0 1rem 0',
        '& > div': {
            width: '100%',
        }
    },
})

const mapStateToProps = (state) => ({
    usersData: state.usersData,
    userIds: state.fetches.userIds,
    hiddenNames: state.hiddenNames,
})

export default connect(mapStateToProps)(withStyles(styles)(TeamTrends))
