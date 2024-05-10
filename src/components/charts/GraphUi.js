import { useState } from 'react'
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

const defaultGroupMaths = [
    'average',
    'trimmedAverage',
    'sum',
    'median',
]

const lineOptions = [
    {
        label: 'Comments',
        dataKey: 'comments',
        groupMaths: [
            ...defaultGroupMaths,
            'percentWith',
            'teamDistribution',
        ],
    },
    {
        label: 'Code comments',
        dataKey: 'codeComments',
        groupMaths: [
            ...defaultGroupMaths,
            'percentWith',
        ],
    },
    {
        label: 'Review comments',
        dataKey: 'generalComments',
        groupMaths: [
            ...defaultGroupMaths,
            'percentWith',
        ],
    },
    {
        label: 'Approvals',
        dataKey: 'approvals',
        groupMaths: [
            ...defaultGroupMaths,
            'percentWith',
            'teamDistribution',
        ],
    },
    {
        label: 'Additions',
        dataKey: 'additions',
        groupMaths: defaultGroupMaths,
    },
    {
        label: 'Deletions',
        dataKey: 'deletions',
        groupMaths: defaultGroupMaths,
    },
    {
        label: 'PR size (additions + deletions)',
        dataKey: 'prSize',
        groupMaths: defaultGroupMaths,
    },
    {
        label: 'Codebase change (additions - deletions)',
        dataKey: 'growth',
        groupMaths: ['growth'],
    },
    {
        label: 'PR count',
        dataKey: 'author',
        groupMaths: ['count', 'averagePerDev'],
    },
    {
        label: 'PR Age(days)',
        dataKey: 'age',
        groupMaths: defaultGroupMaths,
    },
    {
        label: 'Sentiment',
        dataKey: 'commentSentimentTotalScore',
        groupMaths: defaultGroupMaths,
    },
    {
        label: 'Sentiment to team',
        dataKey: 'commentSentimentScore',
        groupMaths: defaultGroupMaths,
    },
    {
        label: 'Sentiment from team',
        dataKey: 'commentAuthorSentimentScore',
        groupMaths: defaultGroupMaths,
    },
    {
        label: 'Bug count',
        dataKey: 'isBug',
        groupMaths: ['count'],
    },
    {
        label: 'Feature count',
        dataKey: 'isFeature',
        groupMaths: ['count'],
    },
]

const mathWords = {
    average: 'Average',
    trimmedAverage: 'Trimmed Average',
    sum: 'Total',
    count: 'Total',
    median: 'Median',
    teamDistribution: "Team's % spread of",
    percentWith: '% of PRs with',
    growth: '',
    averagePerDev: 'Average per Dev',
}

const addedLine = (removeLine, classes) => ({
    color = '',
    label = '',
    dataKey = '',
    groupMath = 'average',
} = {}, i) => <div key={i}>
        <P className={`${classes.savedLine} ${classes[color]}`}>{label}</P>
        <RemoveCircleIcon
            className={`${classes.remove} ${classes[color]}`}
            onClick={event => {
                event.preventDefault()
                removeLine(dataKey, groupMath)
            }}
        />
    </div>

const getActiveLines = (graphInfo = {}) => [
    ...(graphInfo.left || []),
    ...(graphInfo.right || []),
]

const getRemainingLines = (graphInfo = {}) => {
    const activeLines = getActiveLines(graphInfo)

    const remainingLines = []
    lineOptions
        .forEach(({ label = '', dataKey = '', groupMaths = [] } = {}) => {
            const activeDataKeys = activeLines
                .filter(activeLine => activeLine?.dataKey === dataKey)

            const remainingGroupMaths = groupMaths
                .filter(groupMath => (
                    activeDataKeys
                        .every(activeLine => activeLine?.groupMath !== groupMath)
                ))

            if (remainingGroupMaths.length > 0) {
                remainingLines.push({
                    label,
                    dataKey,
                    groupMaths: remainingGroupMaths,
                })
            }
        })

    return remainingLines
}


// TODO: do you need two get lines?
const getNextDataKeyLine = (graphInfo = {}) => {
    const activeLines = getActiveLines(graphInfo)
    const activeDataKeys = activeLines
        .map(activeLine => activeLine?.dataKey)

    const nextLine = lineOptions
        .find(({ dataKey = '' } = {}) => !activeDataKeys.includes(dataKey))

    return nextLine
}

const getNextLine = (formInfo = {}, graphItem = {}) => {
    const remainingLines = getRemainingLines(graphItem)
    const addedDataKey = formInfo.dataKey
    const addedIndex = remainingLines.findIndex(line => line.dataKey === addedDataKey)

    return  remainingLines[addedIndex + 1] || remainingLines[0] || lineOptions[0]
}

const menuItemTextMap = {
    average: () => 'Average',
    trimmedAverage: () => 'Trimmed Average',
    sum: () => 'Total',
    median: () => 'Median',
    growth: () => 'Growth',
    percentWith: ({ label = ''} = {}) => `% of PRs with ${label}`,
    teamDistribution: ({ label = ''} = {}) => `Team's % spread of ${label}`,
    count: () => 'Total',
    averagePerDev: ({ label = ''} = {}) => `Average ${label} per DEV`,
}

const GraphUi = ({
    graphInfo = {},
    setGraph = () => {},
    graphs = [],
    classes = {},
}) =>  {

    const nextDataKeyLine = getNextDataKeyLine(graphInfo)
    const [formInfo, setFormInfo] = useState({
        label: nextDataKeyLine?.label || 'Comments',
        dataKey: nextDataKeyLine?.dataKey || 'comments',
        color: graphs.length > 1
            ? colors[0]
            : colors[1],
        lineSide: 'left',
        groupMath: nextDataKeyLine?.groupMaths?.[0],
    })

    const setValue = (newValue = {}) => {
        setFormInfo({
            ...formInfo,
            ...newValue,
        })
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        const {
            lineSide,
            label,
            groupMath,
        } = formInfo
        const lines = graphInfo[lineSide] || []
        lines.push({
            ...formInfo,
            label: `${mathWords[groupMath]} ${label}`,
            groupMath,
            ...(
                /teamDistribution|percentWith/.test(groupMath)
                    && { yMax: 100 }
            ),
        })

        const graphItem = {
            ...graphInfo,
            [lineSide]: lines,
        }

        const updatedGraphs = graphs
            .map(x => graphItem.graphId === x.graphId
                ? graphItem
                : x,
            )

        setGraph(updatedGraphs)

        const nextLine = getNextLine(formInfo, graphItem)

        const chosenColorIndex = colors
            .findIndex(x => x === formInfo.color)

        setFormInfo({
            label: nextLine.label,
            dataKey: nextLine.dataKey,
            color: colors[(chosenColorIndex + 1) % colors.length],
            lineSide: 'left',
            groupMath: nextLine?.groupMaths[0],
        })
    }

    const removeLine = (side) => (dataKey, groupMath) => {
        const lines = graphInfo[side] || []
        const updatedLines = lines
            .filter(x => !(x.dataKey === dataKey && x.groupMath === groupMath))

        const graphItem = {
            ...graphInfo,
            [side]: updatedLines,
        }

        const updatedGraphs = graphs
            .map(x => graphItem.graphId === x.graphId
                ? graphItem
                : x,
            )
        setGraph(updatedGraphs)

        const [firstline = {}] = getRemainingLines(graphItem)
        setFormInfo({
            label: firstline.label,
            dataKey: firstline.dataKey,
            color: colors[0],
            lineSide: 'left',
            groupMath: firstline.groupMaths[0],
        })
    }

    const remainingLines = getRemainingLines(graphInfo)
    const selectedLine = remainingLines.find(x => x.dataKey === formInfo.dataKey)
    const lineMaths = (selectedLine?.groupMaths || [])
        .filter(x => !/growth/.test(x))
    return <div className={classes.graphForm}>
        {
            remainingLines.length > 0 && <form className={classes.graphLine} onSubmit={handleSubmit}>
                <Select
                    onChange={(e) => {
                        const value = e.target.value
                        const line = remainingLines.find(x => x.dataKey === value)
                        setValue({
                            dataKey: value,
                            groupMath: line.groupMath || line.groupMaths[0],
                            label: line.label,
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
                    lineMaths.length > 0 && <Select
                            onChange={(e) => setValue({ groupMath: e.target.value })}
                            value={formInfo.groupMath}
                            inputProps={{ 'aria-label': 'Choose a line calculation' }}
                        >
                        {
                            lineMaths
                                .map((value) => <MenuItem key={`${formInfo.dataKey}${value}`} value={value} >
                                    {
                                        menuItemTextMap[value](formInfo)
                                    }
                                </MenuItem>)
                        }
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
                            .map((color) => <MenuItem key={color} value={color} >
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
            margin: '0',
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
