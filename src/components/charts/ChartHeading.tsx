import { Fragment } from 'react'
import { BarInfo, GroupMath, LineInfo } from '../../types/Graphs'

const ChartHeading = ({
    className = '',
    items = [],
    text = '',
    type,
}: { className?: string,
    items?: LineInfo[] | BarInfo[],
    text?: string,
    type?: 'line',
}) => {
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

    const LineItem = ({ color, label }: LineInfo | BarInfo) => {
        return (
            <span
                style={{
                    color,
                    borderBottomColor: color,
                }}
                className="saved-line"
            >
                {label}
            </span>
        )
    }

    const Item = ({ color, label }: LineInfo | BarInfo) => (
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
        ...new Set(
            items
                .filter(x => 'groupMath' in x)
                .map(x => 'groupMath' in x && x.groupMath),
        ),
    ] as GroupMath[]

    const singleMathType = (items.length > 0
        && type === 'line'
        && uniqueLinesMaths.length < 2
        ? uniqueLinesMaths[0] || 'average'
        : '')
        || '' as GroupMath | ''

    return (
        <h4 className={className}>
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
        </h4>
    )
}

export default ChartHeading
