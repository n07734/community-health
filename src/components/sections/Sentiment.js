import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { useTheme } from '@material-ui/core/styles';
import { splitAt } from 'ramda'

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
    classes = {}
} = {}) => {
    const theme = useTheme();

    const lines = userIds
        .map((userId, i) => ([
            {
                label: `To ${userId}`,
                color: colors[i % colors.length],
                filterForKey: `${userId}-commentsSentimentScore`,
            },
            {
                label: `From ${userId}`,
                color: colors[i % colors.length],
                filterForKey: `${userId}-commentAuthorSentimentScore`,
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
                        showLegends={showLegends}
                        legends={legends}
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
})

const styles = theme => ({
    link: {
        color: theme.palette.link,
    },
})
export default connect(mapStateToProps)(withStyles(styles)(Sentiment))
