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
        [`${prData.author}-commentsSentimentScore`]: prData.commentsSentimentScore,
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
                title="Sentiment received in PR comments"
                data={[
                    {
                        lines: userIds
                            .map((userId, i) => ({
                                label: `${userId}`,
                                color: colors[i % colors.length],
                                dataKey: `${userId}-commentsSentimentScore`,
                            })),
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
    userIds: state.userIds || ['bvaughn','gaearon','acdlite','sebmarkbage'],
})

const styles = theme => ({
    link: {
        color: theme.palette.link,
    },
})
export default connect(mapStateToProps)(withStyles(styles)(Sentiment))
