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
import { chunkData } from '../charts/lineHelpers'

const formatGraphData = (pullRequests = []) => (data = {}) => {
    const {
        left = [],
        right = [],
    } = data

    // TODO: transformer that dupes lines by x and adds data to lines

    const leftLines = {
        lines: left,
        xAxis: 'left',
        data: pullRequests,
    }

    const rightLines = {
        lines: right,
        xAxis: 'right',
        data: pullRequests,
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

    return formData
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
    pullRequests: rawPullRequests = [],
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

    const pullRequests = rawPullRequests
        .map((pr = {}) => ({
            ...pr,
            commentSentimentTotalScore: (pr.commentSentimentScore || 0) + (pr.commentAuthorSentimentScore || 0)
        }))

    const chunkyData = chunkData(pullRequests)

    const makeGraphData = formatGraphData(pullRequests)

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
                    .map((graphInfo, i) => <div className={classes.addedGraph} key={i}>
                        <GraphUi
                            graphInfo={graphInfo}
                            setGraph={setGraph}
                            graphs={graphs}
                        />
                        <Line
                            blockHeading={true}
                            markers={releases}
                            data={makeGraphData(graphInfo)}
                        />
                        {
                            (graphInfo.left.length > 0 || graphInfo.right.length > 0) && <ItemsTable
                                dataKeys={getTableKeys(graphInfo)}
                                data={chunkyData}
                            />
                        }
                    </div>)
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
                    value={"Make another graph"}
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
    pullRequests: state.pullRequests,
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
