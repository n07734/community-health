import { useState } from 'react'
import { connect } from 'react-redux'
import { withStyles, useTheme, CSSProperties } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import { EventInfo, Issue, PullRequest } from '../../types/FormattedData'
import { Graph, GraphLine } from '../../types/Graphs'

import Paper from '../shared/Paper'
import ChartDescription from '../shared/ChartDescription'
import { P, UL, LI } from '../shared/StyledTags'
import Button from '../shared/Button'
import GraphsWrap from '../shared/GraphsWrap'
import Line from '../charts/Line'
import GraphUi from '../charts/GraphUi'

const formatGraphData = (
    pullRequests:PullRequest[] = [],
    prTransformer:Function = ():any[] => [],
    issues:Issue[] = []
) => (data:Graph) => {
    const getData = (lineInfo: GraphLine) => {
        const dataKey = lineInfo.dataKey
        const useIssues = ['isBug', 'isFeature'].includes(dataKey)

        return useIssues
            ? issues.filter(({ isBug = false}) =>  (isBug && dataKey === 'isBug') || (!isBug && dataKey === 'isFeature'))
            : pullRequests
    }
    const {
        left = [],
        right = [],
    } = data

    const [customLeft = [], customRight = [], legends = []] = prTransformer(left, right, pullRequests) || []

    const leftLines = {
        lines: customLeft.length > 0
            ? customLeft
            : left.map(x => ({...x, data: getData(x)})),
        xAxis: 'left',
    }

    const rightLines = {
        lines: customRight.length > 0
            ? customRight
            : right.map(x => ({...x, data: getData(x)})),
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

    return [
        legends,
        formData,
    ]
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

    return keys
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
    chunkyData: any[],
    pullRequests: PullRequest[],
    prTransformer?: Function,
    issues?: Issue[],
    releases?: EventInfo[],
    classes: any,
    tableOpenedByDefault: boolean,
}
const CustomGraphs = ({
    chunkyData = [],
    pullRequests = [],
    prTransformer = () => {},
    issues = [],
    releases = [],
    classes = {},
    tableOpenedByDefault = false,
}: CustomGraphsProps) => {
    const theme: Theme = useTheme()
    const colorA = theme.palette.primary.main
    const colorB = theme.palette.secondary.main

    const defaultState:Graph[] = [{
        graphId: 1,
        left: [
            {
                label: '*Trimmed Average PR Age (days)',
                color: colorA,
                dataKey: 'age',
                groupMath: 'trimmedAverage',
            },
        ],
        right: [
            {
                label: '*Trimmed Average PR Size',
                color: colorB,
                dataKey: 'prSize',
                groupMath: 'trimmedAverage',
            },
        ],
    }]
    const [graphs, setGraph] = useState(defaultState)
    const showingTrimmed = hasTrimmedMaths(graphs)

    const makeGraphData = formatGraphData(pullRequests, prTransformer, issues)

    return pullRequests.length > 0 && (
        <Paper>
            <ChartDescription
                title="Build your own graphs"
                expandText='guidance'
            >
                <P>You can build multiple graphs with data you want to see to help you find insights and track trends.</P>
                <P>Questions worth asking (with team context):</P>
                <UL>
                    <LI>What metrics do you want to look and and compare against?</LI>
                    <LI>Any insights or things you would like to try to impact these metrics?</LI>
                    <LI>This graph initially had PR age and size as they are often impactful metrics, what do you think about the trends of these metrics?</LI>
                </UL>
            </ChartDescription>
            <GraphsWrap>
                {
                    graphs
                        .map((graphInfo, i) => {
                            // TODO: fix legend toggle for custom graphs
                            const [legends =[], data = []] = makeGraphData(graphInfo)
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
                                    markers={releases}
                                    legends={legends}
                                    showLegends={legends.length > 0}
                                    data={data}
                                    tableKeys={getTableKeys(graphInfo)}
                                    tableData={chunkyData}
                                    tableOpenedByDefault={i === 0 && tableOpenedByDefault}
                                />
                        })
                }
                {
                    showingTrimmed && <P>
                        *Trimmed average is the average after the top and bottom 5% is trimmed.
                    </P>
                }

            </GraphsWrap>
            <div className={classes.buttons}>
                {
                    graphs.length > 1
                        && <Button
                            value="Remove above graph"
                            color="secondary"
                            onClick={(event) => {
                                event.preventDefault()
                                setGraph(graphs.slice(0, -1))
                            }}
                        />
                }
                <Button
                    value={"Add another custom graph"}
                    color="primary"
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
                />
            </div>
        </Paper>
    )
}

type State = {
    issues: Issue[]
}
const mapStateToProps = (state:State) => ({
    issues: state.issues,
})

type TagStyles = {
    [key: string]: CSSProperties
}
const styles = (): TagStyles => ({
    buttons: {
        display: 'flex',
        flexWrap: 'nowrap',
        flexBasis: '100%',
        justifyContent: 'center',
    },
})

export default connect(mapStateToProps)(withStyles(styles)(CustomGraphs))
