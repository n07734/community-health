import { connect } from 'react-redux'
import { EventInfo, Issue, PullRequest } from '@/types/FormattedData'
import { ColumnKeys, TableData, Graph, GraphLine, Lines } from '@/types/Graphs'

import Paper from '@/components/shared/Paper'
import ChartDescription from '@/components/shared/ChartDescription'
import { Button } from '@/components/ui/button'

import GraphsWrap from '@/components/shared/GraphsWrap'
import Line from '@/components/charts/Line'
import GraphUi from '@/components/charts/GraphUi'
import { AnyForLib, FetchInfo, SavedEvent, UsersInfo } from '@/types/State'
import { formatMarkers } from '@/format/releaseData'
import { storeCartConfig } from '@/state/actions'

const formatGraphData = (
    pullRequests:PullRequest[] = [],
    issues:Issue[] = [],
) => (data:Graph) => {
    const getData = (lineInfo: GraphLine) => {
        const dataKey = lineInfo.dataKey
        const useIssues = ['isBug', 'isFeature'].includes(dataKey)

        const items = useIssues
            ? issues.filter(({ isBug = false}) =>  (isBug && dataKey === 'isBug') || (!isBug && dataKey === 'isFeature'))
            : pullRequests

        return items
    }
    const {
        left = [],
        right = [],
    } = data


    const leftLines = {
        lines: left.map(x => ({...x, data: getData(x)})),
        xAxis: 'left',
    }

    const rightLines = {
        lines: right.map(x => ({...x, data: getData(x)})),
        xAxis: 'right',
    }

    const formData = [
        ...(
            left.length > 0
                ? [leftLines]
                : []
        ),
        ...(
            right.length > 0
                ? [rightLines]
                : []
        ),
    ]

    return formData as Lines[]
}

const getTableKeys = (graphInfo:Graph) => {
    const activeKeys = [
        ...(graphInfo?.left || []),
        ...(graphInfo?.right || []),
    ]
        .map(x => x.dataKey)

    const keys = activeKeys.length > 0
        ? [...activeKeys, 'author']
        : ['comments', 'approvals', 'age', 'prSize', 'author']

    return keys as ColumnKeys[]
}

let id = 1
const getGraphId = () => ++id

const getAllMaths = (graphs:Graph[] = []) => {
    const allMaths: string[] = []
    graphs
        .forEach(({ left = [], right = [] }) => {
            left
                .forEach(x => x?.groupMath && allMaths.push(x.groupMath))

            right
                .forEach(x => x?.groupMath && allMaths.push(x.groupMath))
        })

    return allMaths
}

const hasTrimmedMaths = (graphs:Graph[] = []) => {
    const allMaths = getAllMaths(graphs)
    const hasTrimmed = allMaths.includes('trimmedAverage')

    return hasTrimmed
}

type CustomGraphsProps = {
    chunkyData: TableData[][]
    pullRequests: PullRequest[]
    issues?: Issue[]
    releases?: EventInfo[]
    events: SavedEvent[]
    usersInfo: UsersInfo
    tableOpenedByDefault?: boolean
    graphs: Graph[]
    setGraph: (arg0: Graph[]) => void
}
const CustomGraphs = ({
    chunkyData = [],
    pullRequests = [],
    issues = [],
    releases = [],
    events = [],
    usersInfo = {},
    tableOpenedByDefault = false,
    graphs = [],
    setGraph,
}: CustomGraphsProps) => {
    const markers = formatMarkers({ events, releases, usersInfo })

    const showingTrimmed = hasTrimmedMaths(graphs)

    const makeGraphData = formatGraphData(pullRequests, issues)

    return pullRequests.length > 0 && (
        <Paper>
            <ChartDescription
                title="Your graphs"
                expandText='guidance'
            >
                <p>You can build multiple graphs with data you want to see to help you find insights and track trends.</p>
                <p>Questions worth asking (with team context):</p>
                <ul>
                    <li>What metrics do you want to look and and compare against?</li>
                    <li>Any insights or things you would like to try to impact these metrics?</li>
                    <li>This graph initially had PR age and size as they are often impactful metrics, what do you think about the trends of these metrics?</li>
                </ul>
            </ChartDescription>
            <GraphsWrap>
                {
                    graphs
                        .map((graphInfo, i) => {
                            // TODO: fix legend toggle for custom graphs
                            const data = makeGraphData(graphInfo)
                            return graphInfo?.left?.length < 1 && graphInfo?.right?.length < 1
                                ? <GraphUi
                                    key={i}
                                    graphInfo={graphInfo}
                                    setGraph={setGraph}
                                    graphs={graphs}
                                />
                                : <Line
                                    key={i}
                                    graphInfo={graphInfo}
                                    setGraph={setGraph}
                                    graphs={graphs}
                                    blockHeading={true}
                                    markers={markers}
                                    showLegends={false}
                                    data={data}
                                    tableKeys={getTableKeys(graphInfo)}
                                    tableData={chunkyData}
                                    tableOpenedByDefault={i === 0 && tableOpenedByDefault}
                                />
                        })
                }
                {
                    showingTrimmed && <p>
                        *Trimmed average is the average after the top and bottom 5% is trimmed.
                    </p>
                }

            </GraphsWrap>
            <div className="flex flex-nowrap basis-full justify-center gap-x-3 mb-08">
                {
                    graphs.length > 1
                        && <Button
                            variant="secondary"
                            onClick={(event) => {
                                event.preventDefault()
                                setGraph(graphs.slice(0, -1))
                            }}
                        >
                            Remove above graph
                        </Button>
                }
                <Button
                    onClick={(event) => {
                        event.preventDefault()
                        setGraph([
                            ...graphs,
                            {
                                graphId: getGraphId(),
                                left: [],
                                right: [],
                            },
                        ])
                    }}
                >
                    Add another custom graph
                </Button>
            </div>
        </Paper>
    )
}

type State = {
    issues: Issue[]
    releases: EventInfo[]
    fetches: FetchInfo
    chartConfig: Graph[]
}
const mapStateToProps = (state:State) => ({
    issues: state.issues,
    releases: state.releases,
    graphs: state.chartConfig,
    events: state.fetches.events,
    usersInfo: state.fetches.usersInfo,
})

const mapDispatchToProps = (dispatch: AnyForLib) => ({
    setGraph: (chartConfig: Graph[]) => dispatch(storeCartConfig(chartConfig)),
})

export default connect(mapStateToProps, mapDispatchToProps)(CustomGraphs)
