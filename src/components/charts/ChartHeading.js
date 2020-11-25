import React, { Fragment } from 'react'

import { H } from '../shared/StyledTags'

const ChartHeading = ({ className, items = [], text = '' } = {}) => {
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

    return (
        <H level={3} className={className}>
            {text}
            {
                items
                    .map((item, i) => <Fragment key={i}>{prepend(i)}<span style={{ color: item.color }}>{item.label}</span></Fragment>)
            }
        </H>
    )
}

export default ChartHeading
