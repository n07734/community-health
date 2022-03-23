import React, { useState } from 'react'
import Collapse from '@material-ui/core/Collapse'
import { withStyles } from '@material-ui/core/styles'

import { H, P } from './StyledTags'


const ChartDescription = ({
    title,
    intro,
    children,
    expandText = 'See more',
    className,
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
                        className={classes.link}
                        href="#desc"
                        onClick={(e) => {
                            e.preventDefault()
                            setCount(!toggle)
                        }}>
                        {
                            toggle
                                ? 'See less'
                                : expandText
                        }
                    </a>
                }
            </P>
            <Collapse className="wrapper" in={toggle}>
                {children}
            </Collapse>
        </div>
    )
}

const styles = theme => ({
    root: {
        flexGrow: 1,
        marginBottom: '1rem',
    },
    link: {
        color: theme.palette.link,
    },
})

export default withStyles(styles)(ChartDescription)
