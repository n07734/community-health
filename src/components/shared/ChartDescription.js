import { useState } from 'react'
import Collapse from '@material-ui/core/Collapse'
import { withStyles } from '@material-ui/core/styles'

import { H, P } from './StyledTags'


const ExpandLink = ({
    classes,
    setCount,
    toggle,
    expandText,
}) =>  <a
    className={classes.link}
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
        <div className={`${classes.root} ${className} ${!intro ? '' : classes.rootRows}`}>
            {
               title && typeof title === 'string'
                    ? <H className={classes.heading} level={2} >
                        {title}
                        {
                            children
                                && <ExpandLink
                                    classes={classes}
                                    toggle={toggle}
                                    setCount={setCount}
                                    expandText={expandText}
                                />
                        }
                    </H>
                    : title
            }
            <P>
                {intro} {
                    intro
                        && children
                        && <ExpandLink
                            classes={classes}
                            toggle={toggle}
                            setCount={setCount}
                            expandText={expandText}
                        />
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
        width: '100%',
        flexGrow: 1,
        display: 'flex',
        flexWrap: 'wrap',
    },
    rootRows: {
        '& > *': {
            flexBasis: '100%',
        },
    },
    link: {
        color: theme.palette.link,
    },
    linkMargin: {
        color: theme.palette.link,
        marginLeft: '0.5rem',
    },
    heading: {
        '& a': {
            fontSize: '1rem',
            marginLeft: '0.5rem',
        },
    },
    wrapperFlex: {
        flexBasis: '100%',
    },
})

export default withStyles(styles)(ChartDescription)
