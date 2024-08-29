
import { connect } from 'react-redux'
import { withStyles, useTheme } from '@mui/styles'
import { Theme } from '@mui/material/styles'

import { useShowNames } from '../../state/ShowNamesProvider'
import Line from '../charts/Line'
import Paper from '../shared/Paper'
import ChartDescription from '../shared/ChartDescription'
import GraphsWrap from '../shared/GraphsWrap'
import { P } from '../shared/StyledTags'
import { EventInfo, PullRequest } from '../../types/FormattedData'
import { FetchInfo } from '../../types/State'

type SentimentProps = {
    chunkyData: PullRequest[][]
    pullRequests: PullRequest[]
    releases: EventInfo[]
    userIds: string[]
    classes: Record<string, string>
}
const Sentiment = ({
    chunkyData = [],
    pullRequests = [],
    releases = [],
    userIds = [],
    classes = {},
}:SentimentProps) => {
    const theme:Theme = useTheme();
    const colors = theme.palette.colorList

    const { showNames } = useShowNames()

    const lines = userIds
        .map((userId, i) => {
            const label = showNames
                ? userId
                : `Spartacus${Array(i).fill(' ').join('')}`

            return ([
                {
                    label: `To ${label}`,
                    color: colors[i % colors.length],
                    filterForKey: true,
                    dataKey: `${userId}-commentsSentimentScore`,
                },
                {
                    label: `From ${label}`,
                    color: colors[i % colors.length],
                    filterForKey: true,
                    dataKey: `${userId}-commentAuthorSentimentScore`,
                },
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
                    <P>Uses npm package <a className={classes.link} href="https://github.com/thisandagain/sentiment">sentiment</a> which uses AFINN-165 word list and Emoji ranking to perform sentiment analysis.</P>
                </div>
            </ChartDescription>
            <GraphsWrap>
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
                    tableKeys={['commentSentimentScore', 'commentAuthorSentimentScore', 'author']}
                    tableData={chunkyData}
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
                            tableKeys={['commentSentimentScore', 'commentAuthorSentimentScore', 'author']}
                            tableData={chunkyData}
                        />
                    </>
                }
            </GraphsWrap>
        </Paper>
    </>)
}

type State = {
    releases: EventInfo[]
    fetches: FetchInfo
}
const mapStateToProps = (state:State) => ({
    releases: state.releases,
    userIds: state.fetches.userIds,
})

const styles = (theme:Theme) => ({
    link: {
        color: theme.palette.link,
    },
})
export default connect(mapStateToProps)(withStyles(styles)(Sentiment))
