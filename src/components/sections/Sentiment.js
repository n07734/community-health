import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'

import Line from '../charts/Line'
import Paper from '../shared/Paper'
import colors from '../colors'
import ChartDescription from '../shared/ChartDescription'
import { P } from '../shared/StyledTags'


const Sentiment = ({
    pullRequests = [],
    userIds = [],
    classes = {}
} = {}) => {
    const sentPRData = pullRequests.map(prData => ({
        ...prData,
        [`${prData.author}-commentsSentimentScore`]: prData.commentSentimentScore,
        [`${prData.author}-commentAuthorSentimentScore`]: prData.commentAuthorSentimentScore,
    }))

    return (<>
        <Paper>
            <ChartDescription
                title="Sentiment analysis*"
            >
                <div>
                    <P>*Adding this is an experiment to see if it can provide useful insights.</P>
                    <P>Uses npm package <a className={classes.link} href="https://github.com/thisandagain/sentiment" alt="sentiment github package">sentiment</a> which uses AFINN-165 word list and Emoji ranking to perform sentiment analysis.</P>
                    <P>Would like to look into AI sentiment analysis later down the line.</P>
                </div>
            </ChartDescription>
            <Line
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
                                color: colors[1],
                                dataKey: 'commentAuthorSentimentScore',
                            },
                        ],
                        xAxis: 'left',
                        data: sentPRData,
                    },
                ]}
            />
            <Line
                showLegends={true}
                title="Sentiment in PRs between authors and reviewers"
                data={[
                    {
                        lines: userIds
                            .map((userId, i) => ([
                                {
                                    label: `To ${userId}`,
                                    color: colors[i % colors.length],
                                    dataKey: `${userId}-commentsSentimentScore`,
                                },
                                {
                                    label: `From ${userId}`,
                                    color: colors[i % colors.length],
                                    dataKey: `${userId}-commentAuthorSentimentScore`,
                                }
                            ])).flat(),
                        xAxis: 'left',
                        data: sentPRData,
                    },
                ]}
            />
        </Paper>
    </>)
}

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
    userIds: state.fetches.userIds,
})

const styles = theme => ({
    link: {
        color: theme.palette.link,
    },
})
export default connect(mapStateToProps)(withStyles(styles)(Sentiment))
