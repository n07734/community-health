import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'

import { P } from '../shared/StyledTags'
import Paper from '../shared/Paper'
import ChartDescription from '../shared/ChartDescription'
import Bar from '../charts/Bar'
import Chord from '../charts/Chord'

const TeamTrends = ({
    usersData = [],
    userIds = [],
    classes,
} = {}) => {
    const maxAuthors = userIds.length || 7
    return (
        <Paper>
            <ChartDescription
                title="Contribution distribution"
            />

            {
                usersData.length > 0
                    && (
                        <>
                            <div className={classes.groupedCharts}>
                                <P>These chord charts show how contributions are given and received, the dominant colours indicate the higher contributions</P>
                                <Chord data={usersData} dataKey="commentsByUser" title="Comment contributions" />
                                <Chord data={usersData} dataKey="approvalsByUser" title="Approval contributions" />
                            </div>
                            <Bar
                                data={usersData}
                                indexBy="author"
                                titlePrefix="Comments"
                                sortBy="commentsGiven"
                                max={maxAuthors}
                                bars={[
                                    {
                                        dataKey: 'commentsGiven',
                                        color: '#1f77b4',
                                        label: 'given*',
                                    },
                                    {
                                        dataKey: 'commentsReceived',
                                        color: '#e82573',
                                        label: 'received',
                                    },
                                ]}
                            />
                            <Bar
                                data={usersData}
                                indexBy="author"
                                titlePrefix="PRs"
                                sortBy="uniquePRsApproved"
                                max={maxAuthors}
                                bars={[
                                    {
                                        dataKey: 'uniquePRsApproved',
                                        color: '#1f77b4',
                                        label: 'approved*',
                                    },
                                    {
                                        dataKey: 'totalPRs',
                                        color: '#e82573',
                                        label: 'opened',
                                    },
                                ]}
                            />
                            <P>*Given comments and approvals are taken from the PRs in the dataset, i.e. not all comments/approvals that user has many given over the same time period.</P>
                        </>
                    )
            }
        </Paper>
    )
}

const styles = theme => ({
    groupedCharts: {
        ...theme.palette.groupedCharts,
        '& p': {
            flexBasis: '100%',
            textAlign: 'center',
        },
    },
})

const mapStateToProps = (state) => ({
    usersData: state.usersData,
    userIds: state.fetches.userIds,
})

export default connect(mapStateToProps)(withStyles(styles)(TeamTrends))
