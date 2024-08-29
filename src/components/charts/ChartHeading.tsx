import { Fragment } from 'react'
import { makeStyles } from '@mui/styles'
import { GroupMath } from '../../types/Graphs'

import { H } from '../shared/StyledTags'
import { AllowedColors } from '../../types/Components'

type Item = {
    label: string
    groupMath?: string
    color: AllowedColors
}
const ChartHeading = ({ className = '', items = [], text = '', type }: { className?: string, items?: Item[] , text?: string, type?: 'line' }) => {
    const prepend = (i: number) => {
        const maxIndex = items.length - 1

        const valueMap = {
            'zero': '',
            'max': ' and ',
            'more': ', ',
        }

        const valueKey = [
            i === 0
            && 'zero',
            i === maxIndex
            && 'max',
            i > 0
            && 'more',
        ].find(Boolean) as 'zero' | 'max' | 'more'

        return valueMap[valueKey]
    }

    const useStyles = makeStyles(() => ({
        root: (props: { color: string }) => ({
            color: props.color,
            borderBottom: `solid 2px ${props.color}`,
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
        }),
    }))

    const LineItem = ({ color, label }: Item) => {
        const classes = useStyles({ color });
        return (
            <span
                className={classes.root}
            >
                {label}
            </span>
        )
    }

    const Item = ({ color, label }: Item) => (
        <span
            style={{ color }}
        >
            {label}
        </span>
    )

    type MathTypeMap = {
        [key in GroupMath]:string
    }
    const mathTypeMap:MathTypeMap = {
        average: 'Average',
        trimmedAverage: 'Trimmed Average',
        sum: 'Total',
        count: 'Total',
        teamDistribution: '',
        median: '',
        percentWith: '',
        growth: '',
        averagePerDev: '',
    }

    const uniqueLinesMaths = [
        ...new Set(items.map(x => x.groupMath)),
    ] as GroupMath[]

    const singleMathType = (items.length > 0
        && type === 'line'
        && uniqueLinesMaths.length < 2
        ? uniqueLinesMaths[0] || 'average'
        : '')
        || '' as GroupMath | ''

    return (
        <H level={3} className={className}>
            {`${text} `}
            {singleMathType && `${mathTypeMap[singleMathType]} `}
            {
                items
                    .map((item, i) => <Fragment key={i}>
                        {prepend(i)}
                        {
                            type === 'line'
                                ? <LineItem {...item} />
                                : <Item {...item} />
                        }
                    </Fragment>)
            }
        </H>
    )
}

export default ChartHeading
