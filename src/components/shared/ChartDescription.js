import React, { useState } from 'react'
import Collapse from '@material-ui/core/Collapse'
import { withStyles } from '@material-ui/core/styles'

import { H, P } from './StyledTags'


const ChartDescription = ({
    title,
    intro,
    children,
    expandText = 'info',
    className = '',
    classes,
} = {}) => {
    const [toggle, setCount] = useState(false)

    return (
        <div className={`${classes.root} ${className}`}>
            {
               title && typeof title === 'string'
                    ? <H level={2} >{title}</H>
                    : title
            }
            <P>
                {intro} {
                    children && <a
                        className={intro ? classes.link : classes.linkMargin}
                        href="#desc"
                        onClick={(e) => {
                            e.preventDefault()
                            setCount(!toggle)
                        }}>
                        {
                            toggle
                                ? 'hide'
                                : expandText
                        }
                    </a>
                }
            </P>
            <Collapse className={`wrapper ${classes.wrapperFlex}`} in={toggle}>
                {children}
            </Collapse>
        </div>
    )
}

const styles = theme => ({
    root: {
        flexGrow: 1,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'baseline',
    },
    link: {
        color: theme.palette.link,
    },
    linkMargin: {
        color: theme.palette.link,
        marginLeft: '0.5rem',
    },
    wrapperFlex: {
        flexBasis: '100%'
    }
})

export default withStyles(styles)(ChartDescription)
