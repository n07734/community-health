import React from 'react'
import { withStyles } from '@material-ui/core/styles'

import { P, UL, LI } from '../shared/StyledTags'
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
                intro="This section shows the team's contribution dynamics"
            >
                <div>
                    <P>Again, these are general questions meant to help teams look for useful data and promote healthy discussions around team contributions. Team context is needed to have a clear understanding of the data.</P>
                    <UL>
                        <LI>Is there a healthy distribution of contributions across the team? Does not need to be even but should not be dependent on just a few people.</LI>
                        <LI>What would happen if the top one or two contributors left or went on holiday?</LI>
                        <LI>Are there enough people in team approving PRs? Only one or two people are doing this it can be a bottleneck.</LI>
                        <LI>What are the outliers and why?</LI>
                    </UL>
                    <P>Note: The Users in the graphs are people who have opened PRs to the repo. This can mean that the received metrics can be higher than given as people who have not opened PRs could have contributed.</P>
                </div>
            </ChartDescription>

            {
                usersData.length > 0
                    && (
                        <>
                            <Bar
                                data={usersData}
                                indexBy="author"
                                bars={[
                                    {
                                        dataKey: 'commentsGiven',
                                        color: '#1f77b4',
                                        label: 'Comments given',
                                    },
                                    {
                                        dataKey: 'commentsReceived',
                                        color: '#e82573',
                                        label: 'Comments received',
                                    },
                                ]}
                            />
                            <Bar
                                data={usersData}
                                indexBy="author"
                                bars={[
                                    {
                                        dataKey: 'uniquePRsApproved',
                                        color: '#1f77b4',
                                        label: 'Approved PRs',
                                    },
                                    {
                                        dataKey: 'totalPRs',
                                        color: '#e82573',
                                        label: 'Opened PRs',
                                    },
                                ]}
                            />
                        <Bar
                            data={usersData}
                            indexBy="author"
                            bars={[
                                {
                                    dataKey: 'prSize',
                                    color: '#e82573',
                                    label: 'Average PR size (additions + deletions)',
                                },
                            ]}
                        />
                            <div className={classes.groupedCharts}>
                                <Chord data={usersData} dataKey="commentsByUser" title="Comments given" />
                                <Chord data={usersData} dataKey="approvalsByUser" title="Approvals given" />
                            </div>
                        </>
                    )
            }
        </Paper>
    )
}


const styles = theme => ({
    groupedCharts: theme.palette.groupedCharts,
})

export default withStyles(styles)(TeamTrends)