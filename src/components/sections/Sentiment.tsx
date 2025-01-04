
import { useShallow } from 'zustand/react/shallow'
import { PullRequest } from '@/types/FormattedData'
import { LineInfo, TableData } from '@/types/Graphs'

import { useShowNames } from '@/state/ShowNamesProvider'
import Line from '@/components/charts/Line'
import Paper from '@/components/shared/Paper'
import ChartDescription from '@/components/shared/ChartDescription'
import GraphsWrap from '@/components/shared/GraphsWrap'
import { colors } from '@/components/colors'
import { formatMarkers } from '@/format/releaseData'
import { useDataStore, useFetchStore } from '@/state/fetch'

type SentimentProps = {
    chunkyData: TableData[][]
    pullRequests: PullRequest[]
}
const Sentiment = ({
    chunkyData = [],
    pullRequests = [],
}:SentimentProps) => {
    const releases = useDataStore(useShallow(useShallow(state => state.releases)))
    const {
        userIds = [],
        usersInfo = {},
        events = [],
    } = useFetchStore(useShallow((state) => state))

    const { showNames } = useShowNames()

    const markers = formatMarkers({ events, releases, usersInfo })

    const prsByAuthor: Record<string, PullRequest[]> = {}
    pullRequests
        .forEach((pr) => {
            const author = pr.author
            if (!prsByAuthor[author]) {
                prsByAuthor[author] = []
            }
            prsByAuthor[author].push(pr)
        })

    const lines = userIds
        .map((userId, i) => {
            const label = showNames
                ? userId
                : `Spartacus${Array(i).fill(' ').join('')}`

            const lines:LineInfo[] = [
                {
                    label: `To ${label}`,
                    color: colors[i % colors.length],
                    dataKey: 'commentSentimentScore',
                    data: prsByAuthor[userId],
                },
                {
                    label: `From ${label}`,
                    color: colors[i % colors.length],
                    dataKey: 'commentAuthorSentimentScore',
                    data: prsByAuthor[userId],
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
                    markers={markers}
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

export default Sentiment
