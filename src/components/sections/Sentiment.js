import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'

import Line from '../charts/Line'
import Paper from '../shared/Paper'
import { colors } from '../colors'
import ChartDescription from '../shared/ChartDescription'
import { P } from '../shared/StyledTags'
import ItemsTable from './ItemsTable'

const Sentiment = ({
    chunkyData = [],
    pullRequests = [],
    releases = [],
    userIds = [],
    hiddenNames = false,
    classes = {},
} = {}) => {
    const lines = userIds
        .map((userId, i) => {
            const label = hiddenNames
                ? `Spartacus${Array(i).fill(' ').join('')}`
                : userId

            return ([
                {
                    label: `To ${label}`,
                    color: colors[i % colors.length],
                    filterForKey: `${userId}-commentsSentimentScore`,
                },
                {
                    label: `From ${label}`,
                    color: colors[i % colors.length],
                    filterForKey: `${userId}-commentAuthorSentimentScore`,
                }
            ])
        })
            .flat()

    return pullRequests.length > 0 && (<>
        <Paper>
            <ChartDescription
                title="Sentiment analysis*"
            >
                <div>
                    <P>*Adding this is an experiment to see if it can provide useful insights.</P>
                    <P>Uses npm package <a className={classes.link} href="https://github.com/thisandagain/sentiment" alt="sentiment github package">sentiment</a> which uses AFINN-165 word list and Emoji ranking to perform sentiment analysis.</P>
                </div>
            </ChartDescription>
            <Line
                markers={releases}
                showLegends={true}
                title="Sentiment in PRs between team and reviewers"
                data={[
                    {
                        lines: [
                            {
                                label: 'To team',
                                color: colors[0],
                                dataKey: 'commentSentimentScore',
                            },
                            {
                                label: 'From team',
                                color: colors[2],
                                dataKey: 'commentAuthorSentimentScore',
                            },
                        ],
                        xAxis: 'left',
                        data: pullRequests,
                    },
                ]}
            />
            <ItemsTable
                dataKeys={['commentSentimentScore', 'commentAuthorSentimentScore', 'author']}
                data={chunkyData}
            />

            {
                userIds.length > 0 && <>
                    <Line
                        showLegends={true}
                        title="Sentiment in PRs between authors and reviewers"
                        data={[
                            {
                                lines,
                                xAxis: 'left',
                                data: pullRequests,
                            },
                        ]}
                    />
                    <ItemsTable
                        dataKeys={['commentSentimentScore', 'commentAuthorSentimentScore', 'author']}
                        data={chunkyData}
                    />
                </>
            }
        </Paper>
    </>)
}

const mapStateToProps = (state) => ({
    releases: state.releases,
    userIds: state.fetches.userIds,
    hiddenNames: state.hiddenNames,
})

const styles = theme => ({
    link: {
        color: theme.palette.link,
    },
})
export default connect(mapStateToProps)(withStyles(styles)(Sentiment))
