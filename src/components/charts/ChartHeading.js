import { Fragment } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { H } from '../shared/StyledTags'

const ChartHeading = ({ className, items = [], text = '', type = '' } = {}) => {
    const prepend = (i) => {
        const maxIndex = items.length - 1

        return [
            i === 0
            && (() => ''),
            i === maxIndex
            && (() => ' and '),
            i > 0
            && (() => ', '),
        ].find(Boolean)()
    }

    const useStyles = makeStyles(() => ({
        root: props => ({
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

    const LineItem = ({ color, label}) => {
        const classes = useStyles({ color });
        return (
            <span
                className={classes.root}
            >
                {label}
            </span>
        )
    }

    const Item = ({ color, label}) => (
        <span
            style={{ color }}
        >
            {label}
        </span>
    )

    const mathTypeMap = {
        average: 'Average',
        trimmedAverage: 'Trimmed Average',
        sum: 'Total',
        count: 'Total',
        multiple: '',
        teamDistribution: '',
    }

    const uniqueLinesMaths = [
        ...new Set(items.map(x => x.groupMath)),
    ]

    const singleMathType = items.length > 0
        && type === 'line'
        && uniqueLinesMaths.length < 2
            ? uniqueLinesMaths[0] || 'average'
            : 'multiple'

    return (
        <H level={3} className={className}>
            {`${text} `}
            {`${mathTypeMap[singleMathType]} `}
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
