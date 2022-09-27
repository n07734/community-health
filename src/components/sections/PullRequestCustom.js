import React, { useState } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import {
    Select,
    MenuItem,
    RadioGroup,
    Radio,
    FormLabel,
} from '@material-ui/core'
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import { equals } from 'ramda'


import Paper from '../shared/Paper'
import ChartDescription from '../shared/ChartDescription'
import { P } from '../shared/StyledTags'
import Button from '../shared/Button'
import colors from '../colors'
import Line from '../charts/Line'
import ItemsTable from './ItemsTable'
import { chunkData } from '../charts/lineHelpers'

const lineOptions = [
    {
        label: 'PR comments',
        dataKey: 'comments',
    },
    {
        label: 'PR approvals',
        dataKey: 'approvals',
    },
    {
        label: 'PR additions',
        dataKey: 'additions'
    },
    {
        label: 'PR deletions',
        dataKey: 'deletions'
    },
    {
        label: 'PR size',
        dataKey: 'prSize',
    },
    {
        label: 'PR age(days)',
        dataKey: 'age',
    },
    {
        label: 'PR sentiment to team',
        dataKey: 'commentSentimentScore',
    },
    {
        label: 'PR sentiment from team',
        dataKey: 'commentAuthorSentimentScore',
    },
]

const formatGraphData = (pullRequests = []) => (data = {}) => {
    const {
        left = [],
        right = [],
    } = data

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

const mathWords = {
    average: 'Average',
    sum: 'Total',
}

const getColor = (formInfo = {}) => {
    const usedColors = [
        ...(formInfo.left || []),
        ...(formInfo.right || []),
    ]
        .map(x => x.color)

    const [ color ] = colors
        .filter(x => !usedColors.includes(x))

    return color
}

const getTableKeys = (graphInfo = {}) => {
    const activeKeys = [
        ...(graphInfo.left || []),
        ...(graphInfo.right || []),
    ]
        .map(x => x.dataKey)

    return activeKeys.length > 0
        ? [...activeKeys, 'author']
        : ['comments', 'approvals', 'age', 'prSize', 'author']
}

const addedLine = (removeLine, classes) => ({
    color = '',
    label = '',
    dataKey = '',
    groupMath = 'average',
} = {}, i) => <div key={i}>
        <P className={`${classes.savedLine} ${classes[color]}`}>{mathWords[groupMath]} {label} </P>
        <RemoveCircleIcon
            className={`${classes.remove} ${classes[color]}`}
            onClick={event => {
                event.preventDefault()
                removeLine(dataKey)
            }}
        />
    </div>

const getRemainingLines = (graphInfo = {}) => {
    const activeLines = [
        ...(graphInfo.left || []),
        ...(graphInfo.right || []),
    ]

    const remainingLines = lineOptions
        .filter(({ dataKey = '' } = {}) => activeLines.every(x => x.dataKey !== dataKey))

    return remainingLines
}

const GraphUi = ({
    graphInfo = {},
    setGraph = () => {},
    graphs = [],
    classes = {},
}) =>  {
    const remainingLines = getRemainingLines(graphInfo)

    const [formInfo, setFormInfo] = useState({
        label: remainingLines[0]?.label || 'Comments',
        dataKey: remainingLines[0]?.dataKey || 'comments',
        color: getColor(graphInfo),
        lineSide: 'left',
        groupMath: 'average',
    })

    const setValue = (newValue = {}) => {
        setFormInfo({
            ...formInfo,
            ...newValue,
        })
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        const side = formInfo.lineSide
        const lines = graphInfo[side] || []
        lines.push(formInfo)

        const graphItem = {
            ...graphInfo,
            [side]: lines,
        }

        const updatedGraphs = graphs
            .map(x => graphItem.graphId === x.graphId
                ? graphItem
                : x
            )

        setGraph(updatedGraphs)

        const [firstline = {}] = getRemainingLines(graphItem)

        setFormInfo({
            label: firstline.label,
            dataKey: firstline.dataKey,
            color: getColor(graphItem),
            lineSide: 'left',
            groupMath: 'average',
        })
    }

    const removeLine = (side) => (dataKey) => {
        const lines = graphInfo[side] || []
        const updatedLines = lines
            .filter(x => x.dataKey !== dataKey)

        const graphItem = {
            ...graphInfo,
            [side]: updatedLines,
        }

        const updatedGraphs = graphs
            .map(x => graphItem.graphId === x.graphId
                ? graphItem
                : x
            )
        setGraph(updatedGraphs)

        const [firstline = {}] = getRemainingLines(graphItem)
        setFormInfo({
            label: firstline.label,
            dataKey: firstline.dataKey,
            color: getColor(graphItem),
            lineSide: 'left',
            groupMath: 'average',
        })
    }

    return <div className={classes.graphForm}>
        {
            remainingLines.length > 0 && <form className={classes.graphLine} onSubmit={handleSubmit}>
                <Select
                    onChange={(e) => {
                        const value = e.target.value
                        const { label } = remainingLines.find(x => x.dataKey === value)
                        setValue({
                            dataKey: value,
                            label
                        })

                    }}
                    value={formInfo.dataKey}
                    inputProps={{ 'aria-label': 'choose a line' }}
                >
                    {
                        remainingLines
                            .map(({label, dataKey} = {}) => <MenuItem key={dataKey} value={dataKey} >
                                {label}
                            </MenuItem>)
                    }
                </Select>
                <Select
                    onChange={(e) => setValue({ color: e.target.value })}
                    value={formInfo.color}
                    inputProps={{ 'aria-label': 'Choose a color' }}
                >
                    {
                        colors
                            .map((color, i) => <MenuItem key={color} value={color} >
                                <div style={{
                                    backgroundColor: color,
                                    width: '70px',
                                    height: '10px',
                                    marginTop: '5px',
                                }}></div>
                            </MenuItem>)
                    }
                </Select>
                <RadioGroup
                    value={formInfo.lineSide}
                    onChange={(e) => setValue({ lineSide: e.target.value })}
                    row name="side"
                >
                    <FormLabel>Axis: Left<Radio name="side" value="left" /></FormLabel>
                    <FormLabel>Right<Radio name="side" value="right" /></FormLabel>
                </RadioGroup>
                <RadioGroup
                    value={formInfo.groupMath}
                    onChange={(e) => setValue({ groupMath: e.target.value })}
                    row
                    name="lineMaths"
                >
                    <FormLabel>Line maths: Average<Radio name="lineMaths" value="average" /></FormLabel>
                    <FormLabel>Total<Radio name="lineMaths" value="sum" /></FormLabel>
                </RadioGroup>
                <Button value={"Add to graph"} color="primary" type='submit'/>
            </form>
        }
        <div className={classes.customLines}>
            <div>
            {
                (graphInfo.left || [])
                    .map(addedLine(removeLine('left'), classes))
            }
            </div>
            <div>
            {
                (graphInfo.right || [])
                    .map(addedLine(removeLine('right'), classes))
            }
            </div>
        </div>
    </div>
}

let id = 1
const getGraphId = () => ++id

const PullRequestCustom = ({
    pullRequests = [],
    releases = [],
    classes = {},
} = {}) => {
    const defaultState = [{
        graphId: 1,
        left: [
            {
                label: 'Comments',
                color: '#1F77B4',
                dataKey: 'comments',
            },
            // {
            //     label: 'Approvals',
            //     color: '#E82573',
            //     dataKey: 'approvals',
            // },
        ],
        right: [
            // {
            //     label: 'PR Size',
            //     color: '#4ECC7A',
            //     groupMath: 'sum',
            //     dataKey: 'prSize',
            // }
        ]
    }]
    const [graphs, setGraph] = useState(defaultState)

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
                            classes={classes}
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
        </Paper>
    )
}

const mapStateToProps = (state) => ({
    pullRequests: state.pullRequests,
    releases: state.releases,
})

const colorClasses = {}
colors
    .forEach((color) => {
        colorClasses[color] = {color: color, borderColor: color}
    })

const styles = theme => ({
    graphLine: {
        display: 'flex',
        flexWrap: 'wrap',
        borderRadius: '15px',
        paddingTop:' 0.5em',
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(0deg, rgba(102,102,102,0) 80%, rgba(102,102,102,1) 100%)',
        '& p': {
            margin: '0'
        },
        '& > *': {
            marginRight: '20px',
            marginBottom: '15px',
        },
    },
    graphForm: {
        width: '100%',
        maxWidth: '1200px',
    },
    remove: {
        fontSize: '22px',
        marginLeft: '5px',
        marginBottom: '-5px',
    },
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
    fill: {
        flexBasis: '100%',
    },
    savedLine: {
        fontSize: '1.3em',
        borderBottom: `solid 2px`,
        display: 'inline-block',
        lineHeight: '2rem',
        position: 'relative',
        '&:before': {
            lineHeight: '0',
            content: '"•"',
            position: 'absolute',
            bottom: '-1px',
            left: '-3px',
        },
        '&:after': {
            lineHeight: '0',
            content: '"•"',
            position: 'absolute',
            bottom: '-1px',
            right: '-3px',
        },
    },
    customLines: {
        width: '100%',
        display: 'flex',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
        '& > div': {
            columnGap: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            maxWidth: '50%',
            justifyContent: 'flex-start',
        },
        '& > div:nth-child(2)': {
            justifyContent: 'flex-end',
            textAlign: 'right',
        },
    },
    block: {
        display: 'block',
    },
    ...colorClasses,
})

export default connect(mapStateToProps)(withStyles(styles)(PullRequestCustom))
