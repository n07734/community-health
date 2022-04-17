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
    classes,
} = {}) => {
    return (
        <Paper>
            <ChartDescription
                title="Contribution distribution"
            >
                <div>
                    <P>Note: The Users in the graphs are people who have opened PRs to the repo. This can mean that the received metrics can be higher than given as people who have not opened PRs could have contributed.</P>
                </div>
            </ChartDescription>

            {
                usersData.length > 0
                    && (
                        <>
                            <div className={classes.groupedCharts}>
                                <Chord data={usersData} dataKey="commentsByUser" title="Comment contributions" />
                                <Chord data={usersData} dataKey="approvalsByUser" title="Approval contributions" />
                            </div>
                            <Bar
                                data={usersData}
                                indexBy="author"
                                titlePrefix="Comments"
                                sortBy="commentsGiven"
                                max={7}
                                bars={[
                                    {
                                        dataKey: 'commentsGiven',
                                        color: '#1f77b4',
                                        label: 'given',
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
                                titlePrefix="PRs,"
                                sortBy="uniquePRsApproved"
                                max={7}
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
                        </>
                    )
            }
        </Paper>
    )
}

const styles = theme => ({
    groupedCharts: theme.palette.groupedCharts,
})

const mapStateToProps = (state) => ({
    usersData: state.usersData,
})

export default connect(mapStateToProps)(withStyles(styles)(TeamTrends))
