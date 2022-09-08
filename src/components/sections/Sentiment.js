import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { useTheme } from '@material-ui/core/styles';
import { splitAt } from 'ramda'

import Line from '../charts/Line'
import Paper from '../shared/Paper'
import colors from '../colors'
import ChartDescription from '../shared/ChartDescription'
import { P } from '../shared/StyledTags'
import PrTable from './PrTable'

import { chunkData } from '../charts/lineHelpers'


const Sentiment = ({
    pullRequests = [],
    userIds = [],
    classes = {}
} = {}) => {
    const theme = useTheme();

    const sentPRData = pullRequests.map(prData => ({
        ...prData,
        [`${prData.author}-commentsSentimentScore`]: prData.commentSentimentScore,
        [`${prData.author}-commentAuthorSentimentScore`]: prData.commentAuthorSentimentScore,
    }))

    const chunkyData = chunkData(sentPRData)

    const lines = userIds
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
        ]))
        .flat()

    const [leftLines, rightLines] = lines.length > 10
        ? splitAt(Math.ceil(lines.length/2),lines)
        :[lines, []]

    const showLegends = userIds.length > 10
        ? false
        : true

    const legends = showLegends
        ? [
            {
                data: leftLines,
                anchor: 'top-left',
                direction: 'column',
                justify: false,
                translateX: 10,
                translateY: 10,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 1,
                symbolSize: 12,
                symbolShape: 'square',
                symbolBorderColor: 'rgba(0, 0, 0, .9)',
                toggleSerie: true,
                itemTextColor: theme.palette.text.primary,
            },
            {
                data: rightLines,
                anchor: 'top-right',
                direction: 'column',
                justify: false,
                translateX: -10,
                translateY: 10,
                itemsSpacing: 0,
                itemDirection: 'right-to-left',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 1,
                symbolSize: 12,
                symbolShape: 'square',
                symbolBorderColor: 'rgba(0, 0, 0, .9)',
                toggleSerie: true,
                itemTextColor: theme.palette.text.primary,
            }
        ]
        : []

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
            <PrTable
                dataKeys={['commentSentimentScore', 'commentAuthorSentimentScore']}
                data={chunkyData}
            />

            <Line
                showLegends={showLegends}
                legends={legends}
                title="Sentiment in PRs between authors and reviewers"
                data={[
                    {
                        lines,
                        xAxis: 'left',
                        data: sentPRData,
                    },
                ]}
            />
            <PrTable
                dataKeys={['commentSentimentScore', 'commentAuthorSentimentScore']}
                data={chunkyData}
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
