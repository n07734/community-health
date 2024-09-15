
import { connect } from 'react-redux'
import { EventInfo, PullRequest } from '@/types/FormattedData'
import { FetchInfo } from '@/types/State'
import { LineInfo, TableData } from '@/types/Graphs'

import { useShowNames } from '@/state/ShowNamesProvider'
import Line from '@/components/charts/Line'
import Paper from '@/components/shared/Paper'
import ChartDescription from '@/components/shared/ChartDescription'
import GraphsWrap from '@/components/shared/GraphsWrap'
import { colors } from '@/components/colors'


type SentimentProps = {
    chunkyData: TableData[][]
    pullRequests: PullRequest[]
    releases: EventInfo[]
    userIds: string[]
}
const Sentiment = ({
    chunkyData = [],
    pullRequests = [],
    releases = [],
    userIds = [],
}:SentimentProps) => {
    const { showNames } = useShowNames()

    const lines = userIds
        .map((userId, i) => {
            const label = showNames
                ? userId
                : `Spartacus${Array(i).fill(' ').join('')}`

            const lines:LineInfo[] = [
                {
                    label: `To ${label}`,
                    color: colors[i % colors.length],
                    filterForKey: true,
                    dataKey: `${userId}-commentsSentimentScore`,
                    data: pullRequests,
                },
                {
                    label: `From ${label}`,
                    color: colors[i % colors.length],
                    filterForKey: true,
                    dataKey: `${userId}-commentAuthorSentimentScore`,
                    data: pullRequests,
                },
            ]
            return lines
        })
        .flat()

    return pullRequests.length > 0 && (<>
        <Paper>
            <ChartDescription
                title="Sentiment analysis*"
            >
                <div>
                    <p>*Adding this is an experiment to see if it can provide useful insights.</p>
                    <p>Uses npm package <a className="text-primary" href="https://github.com/thisandagain/sentiment">sentiment</a> which uses AFINN-165 word list and Emoji ranking to perform sentiment analysis.</p>
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
                                    data: pullRequests,
                                },
                                {
                                    label: 'From team',
                                    color: colors[2],
                                    dataKey: 'commentAuthorSentimentScore',
                                    data: pullRequests,
                                },
                            ],
                            xAxis: 'left',
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

export default connect(mapStateToProps)(Sentiment)
