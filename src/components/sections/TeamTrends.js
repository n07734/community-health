import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'

import { P } from '../shared/StyledTags'
import Paper from '../shared/Paper'
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
            <P>*Received comments may be higher than given as those contributions can come from users not in this list</P>
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
    hiddenNames: state.hiddenNames,
})

export default connect(mapStateToProps)(withStyles(styles)(TeamTrends))
