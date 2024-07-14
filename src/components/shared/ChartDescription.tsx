import { useState } from 'react'
import Collapse from '@mui/material/Collapse'
import { withStyles, CSSProperties } from '@mui/styles'
import { Theme } from '@mui/material/styles'

import { H, P } from './StyledTags'

type ExpandLinkProps = {
    classes: Record<string, string>
    setCount: (toggle: boolean) => void
    toggle: boolean
    expandText: string
}
const ExpandLink = ({
    classes,
    setCount,
    toggle,
    expandText,
}: ExpandLinkProps) =>  <a
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

type ChartDescriptionProps = {
    title?: string | React.ReactNode
    intro?: string
    children?: React.ReactNode
    expandText?: string
    className?: string
    classes: Record<string, string>
}
const ChartDescription = ({
    title,
    intro,
    children,
    expandText = 'info',
    className = '',
    classes,
}: ChartDescriptionProps) => {
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

type TagStyles = {
    [key: string]: CSSProperties
}
const styles = (theme: Theme): TagStyles => ({
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
