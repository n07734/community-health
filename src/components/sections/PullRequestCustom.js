import React, { useState } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'

import Paper from '../shared/Paper'
import ChartDescription from '../shared/ChartDescription'
import { P } from '../shared/StyledTags'
import Button from '../shared/Button'
import Line from '../charts/Line'
import GraphUi from '../charts/GraphUi'
import ItemsTable from './ItemsTable'

const formatGraphData = (pullRequests = [], prTransformer) => (data = {}) => {
    const {
        left = [],
        right = [],
    } = data

    const [customLeft = [], customRight = [], legends = []] = prTransformer
        ? prTransformer(left, right, pullRequests)
        : []

    const leftLines = {
        lines: customLeft.length > 0
            ? customLeft
            : left.map(x => ({...x, data: pullRequests})),
        xAxis: 'left',
    }

    const rightLines = {
        lines: customRight.length > 0
            ? customRight
            : right.map(x => ({...x, data: pullRequests})),
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

const getTableKeys = (graphInfo = {}) => {
    const activeKeys = [
        ...(graphInfo.left || []),
        ...(graphInfo.right || []),
    ]
        .map(x => x.dataKey)

    const keys = activeKeys.length > 0
        ? [...activeKeys, 'author']
        : ['comments', 'approvals', 'age', 'prSize', 'author']

    return keys
}

let id = 1
const getGraphId = () => ++id

const PullRequestCustom = ({
    chunkyData = [],
    pullRequests = [],
    prTransformer,
    releases = [],
    classes = {},
} = {}) => {
    const defaultState = [{
        graphId: 1,
        left: [
            {
                label: 'Comments',
                color: '#E82573',
                dataKey: 'comments',
            },
        ],
        right: []
    }]
    const [graphs, setGraph] = useState(defaultState)

    const makeGraphData = formatGraphData(pullRequests, prTransformer)

    return pullRequests.length > 0 && (
        <Paper className={classes.block}>
            <ChartDescription
                title="Pull Requests: build your own graphs"
            >
                {
                    releases.length > 1 && <div>
                        <P>Vertical lines are releases: Green is a Major release, solid purple is Minor and dotted purple is Patch or Alpha</P>
                    </div>
                }
            </ChartDescription>
            {
                graphs
                    .map((graphInfo, i) => {
                        // TODO: fix legend toggle for custom graphs
                        const [legends =[], data = []] = makeGraphData(graphInfo)
                        return <div className={classes.addedGraph} key={i}>
                            <GraphUi
                                graphInfo={graphInfo}
                                setGraph={setGraph}
                                graphs={graphs}
                            />
                            <Line
                                blockHeading={true}
                                markers={releases}
                                legends={legends}
                                showLegends={legends.length > 0}
                                data={data}
                            />
                            {
                                (graphInfo.left.length > 0 || graphInfo.right.length > 0) && <ItemsTable
                                    dataKeys={getTableKeys(graphInfo)}
                                    data={chunkyData}
                                />
                            }
                        </div>
                    })
            }
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

const mapStateToProps = (state) => ({
    releases: state.releases,
})

const styles = theme => ({
    addedGraph: {
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top left',
        backgroundSize: '100% 20px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    buttons: {
        display: 'flex',
        flexWrap: 'nowrap',
        justifyContent: 'center',
    },
    block: {
        display: 'block',
    },
})

export default connect(mapStateToProps)(withStyles(styles)(PullRequestCustom))
