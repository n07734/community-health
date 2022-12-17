import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import {
    Select,
    MenuItem,
    RadioGroup,
    Radio,
    FormLabel,
} from '@material-ui/core'
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

import { colors } from '../colors'
import { P } from '../shared/StyledTags'
import Button from '../shared/Button'

const lineOptions = [
    {
        label: 'All comments',
        dataKey: 'comments',
    },
    {
        label: 'Code comments',
        dataKey: 'codeComments',
    },
    {
        label: 'Review comments',
        dataKey: 'generalComments',
    },
    {
        label: 'Approvals',
        dataKey: 'approvals',
    },
    {
        label: 'Additions',
        dataKey: 'additions'
    },
    {
        label: 'Deletions',
        dataKey: 'deletions'
    },
    {
        label: 'PR size',
        dataKey: 'prSize',
    },
    {
        label: 'PR count',
        dataKey: 'author',
    },
    {
        label: 'Age(days)',
        dataKey: 'age',
    },
    {
        label: 'Sentiment',
        dataKey: 'commentSentimentTotalScore',
    },
    {
        label: 'Sentiment to team',
        dataKey: 'commentSentimentScore',
    },
    {
        label: 'Sentiment from team',
        dataKey: 'commentAuthorSentimentScore',
    },
    {
        label: 'Bug count',
        dataKey: 'isBug',
    },
    {
        label: 'Feature count',
        dataKey: 'isFeature',
    },
]

// TODO: set groupMath in form so don't have to do this way
const isACountBasedKey = (key) => ['author', 'isBug', 'isFeature'].includes(key)

const mathWords = {
    average: 'Average',
    sum: 'Total',
    median: 'Median',
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
        color: graphs.length > 1
            ? colors[0]
            : colors[1],
        lineSide: 'left',
        groupMath: remainingLines[0]?.groupMath || 'average',
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
        lines.push({
            ...formInfo,
            groupMath: isACountBasedKey(formInfo.dataKey)
                ? 'count'
                : formInfo.groupMath || 'average'
        })

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

        const chosenColorIndex = colors
            .findIndex(x => x === formInfo.color)

        setFormInfo({
            label: firstline.label,
            dataKey: firstline.dataKey,
            color: colors[(chosenColorIndex + 1) % colors.length],
            lineSide: 'left',
            groupMath: isACountBasedKey(firstline.dataKey)
                ? 'count'
                : firstline.groupMath || 'average',
        })
    }

    const removeLine = (side) => (dataKey) => {
        const lines = graphInfo[side] || []
        const updatedLines = lines
            .filter(x => x.dataKey !== dataKey)

        const removedLine = lines
            .find(x => x.dataKey === dataKey)

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
            color: removedLine.color,
            lineSide: 'left',
            groupMath: firstline.groupMath || 'average',
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
                            .map(({label, dataKey} = {}) => <MenuItem key={`${dataKey}${label}`} value={dataKey} >
                                {label}
                            </MenuItem>)
                    }
                </Select>
                {
                    !isACountBasedKey(formInfo.dataKey)
                        && <Select
                            onChange={(e) => setValue({ groupMath: e.target.value })}
                            value={formInfo.groupMath}
                            inputProps={{ 'aria-label': 'Choose a line calculation' }}
                        >
                            <MenuItem value="average">Average</MenuItem>
                            <MenuItem value="sum">Total</MenuItem>
                            <MenuItem value="median">Median</MenuItem>
                        </Select>
                }
                <RadioGroup
                    value={formInfo.lineSide}
                    onChange={(e) => setValue({ lineSide: e.target.value })}
                    row name="side"
                >
                    <FormLabel>Axis: Left<Radio name="side" value="left" /></FormLabel>
                    <FormLabel>Right<Radio name="side" value="right" /></FormLabel>
                </RadioGroup>
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
        backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0) 80%, ${theme.palette.shadow} 100%)`,
        '& p': {
            margin: '0'
        },
        '& > *': {
            marginRight: '20px',
            marginBottom: '15px',
        },
        '& .MuiFormLabel-root': {
            color: theme.palette.mainCopy.color,
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
            flexDirection: 'column',
        },
        '& > div:nth-child(2)': {
            justifyContent: 'flex-end',
            textAlign: 'right',
        },
    },
    ...colorClasses,
})

export default withStyles(styles)(GraphUi)
