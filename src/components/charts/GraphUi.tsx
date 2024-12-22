import { useState } from 'react'

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

import { CustomLineDataKey, Graph, GraphFormInfo, GraphLine, GraphOptions, GroupMath } from '@/types/Graphs';
import { colors } from '@/components/colors'
import { Button } from '@/components/ui/button'

const defaultGroupMaths:GroupMath[] = [
    'average',
    'trimmedAverage',
    'sum',
    'median',
]

const lineOptions:GraphOptions[] = [
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
    trimmedAverage: '*Trimmed Average',
    sum: 'Total',
    count: 'Total',
    median: 'Median',
    teamDistribution: "Team's % spread of",
    percentWith: '% of PRs with',
    growth: '',
    averagePerDev: 'Average per Dev',
}

// eslint-disable-next-line react/display-name
const addedLine = (removeLine:(a:CustomLineDataKey, b:GroupMath) => void) => ({
    color,
    label = '',
    dataKey,
    groupMath = 'average',
}: GraphLine, i: number) => <div key={`${i}`} style={{ color }} >
    <p className="saved-line text-xl">{label}</p>
    <svg
        className="w-[22px] h-[22px] fill-current inline-block"
        focusable="false"
        aria-hidden="true"
        viewBox="0 0 32 32"
        data-qa-id="RemoveCircleIcon"
        onClick={event => {
            event.preventDefault()
            removeLine(dataKey, groupMath)
        }}
    >
        <path d="M15.5 3.5c-7.18 0-13 5.82-13 13s5.82 13 13 13c7.18 0 13-5.82 13-13s-5.82-13-13-13zM22 16.875c0 0.553-0.448 1-1 1h-11c-0.553 0-1-0.447-1-1v-1c0-0.552 0.447-1 1-1h11c0.552 0 1 0.448 1 1v1z"></path>
    </svg>
</div>

const getActiveLines = (graphInfo:Graph) => [
    ...(graphInfo.left || []),
    ...(graphInfo.right || []),
]

const getRemainingLines = (graphInfo:Graph) => {
    const activeLines = getActiveLines(graphInfo)

    const remainingLines:GraphOptions[] = []
    lineOptions
        .forEach(({ label = '', dataKey, groupMaths = [] }:GraphOptions) => {
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
const getNextDataKeyLine = (graphInfo:Graph) => {
    const activeLines = getActiveLines(graphInfo)
    const activeDataKeys = activeLines
        .map(activeLine => activeLine?.dataKey)

    const nextLine = lineOptions
        .find(({ dataKey }) => !activeDataKeys.includes(dataKey))

    return nextLine
}

const getNextLine = (formInfo:GraphFormInfo, graphItem:Graph) => {
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

type GraphUiProps = {
    graphInfo: Graph,
    setGraph: (graphs: Graph[]) => void,
    graphs: Graph[],
}
const GraphUi = ({
    graphInfo,
    setGraph = () => {},
    graphs = [],
}: GraphUiProps) =>  {
    const nextDataKeyLine = getNextDataKeyLine(graphInfo)
    const [formInfo, setFormInfo] = useState({
        label: nextDataKeyLine?.label || 'Comments',
        dataKey: nextDataKeyLine?.dataKey || 'comments',
        color: graphs.length > 1
            ? colors[0]
            : colors[1],
        lineSide: 'left',
        groupMath: nextDataKeyLine?.groupMaths?.[0],
    } as GraphFormInfo)

    const setValue = (newValue = {}) => {
        setFormInfo({
            ...formInfo,
            ...newValue,
        })
    }

    const handleSubmit = (event: React.FormEvent<HTMLElement>) => {
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
            lineSide,
            groupMath: nextLine?.groupMaths[0],
        })
    }

    const removeLine = (side: 'left' | 'right') => (dataKey:CustomLineDataKey, groupMath:GroupMath) => {
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

        const [firstLine] = getRemainingLines(graphItem)
        setFormInfo({
            label: firstLine.label,
            dataKey: firstLine.dataKey,
            color: colors[0],
            lineSide: 'left',
            groupMath: firstLine.groupMaths[0],
        })
    }

    const remainingLines = getRemainingLines(graphInfo)
    const selectedLine = remainingLines.find(x => x.dataKey === formInfo.dataKey)
    const lineMaths = (selectedLine?.groupMaths || [])
        .filter(x => !/growth/.test(x))
    return <div className="w-full max-w-mw">
        {
            remainingLines.length > 0 && <form className="flex flex-wrap rounded-2xl justify-center paper pt-2 gap-4 mb-3" onSubmit={handleSubmit}>
                <Select
                    onValueChange={(value) => {
                        const line = remainingLines.find(x => x.dataKey === value) as GraphOptions
                        setValue({
                            dataKey: value,
                            groupMath: line.groupMaths[0],
                            label: line.label,
                        })

                    }}
                    value={selectedLine?.dataKey}
                >
                    <SelectTrigger className="w-auto">
                        <SelectValue>
                            {selectedLine?.label}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {
                                remainingLines
                                    .map(({label, dataKey}) => <SelectItem key={`${selectedLine?.dataKey}${dataKey}${label}`} value={dataKey} >
                                        {label}
                                    </SelectItem>)
                            }
                        </SelectGroup>
                    </SelectContent>
                </Select>
                {
                    lineMaths.length > 0 && <Select
                        onValueChange={(groupMath) => groupMath && setValue({ groupMath })}
                        value={formInfo.groupMath}
                    >
                        <SelectTrigger className="w-auto">
                            <SelectValue>
                                {menuItemTextMap[formInfo.groupMath](formInfo)}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {
                                    lineMaths
                                        .map((value) => <SelectItem key={`${formInfo.dataKey}${value}`} value={value} >
                                            {
                                                menuItemTextMap[value](formInfo)
                                            }
                                        </SelectItem>)
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                }
                <RadioGroup
                    defaultValue={formInfo.lineSide}
                    onValueChange={(lineSide) => lineSide && setValue({ lineSide })}
                >
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="left" id="r1" />
                            <Label htmlFor="r1">Axis: Left</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="right" id="r2" />
                            <Label htmlFor="r2">Right</Label>
                        </div>
                    </div>
                </RadioGroup>
                <Select
                    onValueChange={(color) => color && setValue({ color })}
                    value={formInfo.color}
                >
                    <SelectTrigger className="w-auto">
                        <SelectValue placeholder={(<div style={{
                            backgroundColor: formInfo.color,
                            width: '70px',
                            height: '10px',
                        }}></div>)} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {
                                colors
                                    .map((color) => <SelectItem key={color} value={color} >
                                        <div style={{
                                            backgroundColor: color,
                                            width: '70px',
                                            height: '10px',
                                        }}></div>
                                    </SelectItem>)
                            }
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Button color="primary" type='submit'>Add to graph</Button>
            </form>
        }
        <div className="custom-lines">
            <div>
                {
                    (graphInfo.left || [])
                        .map(addedLine(removeLine('left')))
                }
            </div>
            <div>
                {
                    (graphInfo.right || [])
                        .map(addedLine(removeLine('right')))
                }
            </div>
        </div>
    </div>
}

export default GraphUi
