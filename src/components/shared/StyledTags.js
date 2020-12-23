import React from 'react'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
    p: theme.copy.body,
    h1: theme.copy.h1,
    h2: theme.copy.h2,
    h3: {
        ...theme.copy.h3,
        '@media (max-width: 768px)': {
            fontSize: '1.8rem'
        },
        '@media (max-width: 668px)': {
            fontSize: '1.3rem'
        }, 
    },
    h4: theme.copy.h4,
    list: theme.copy.list,
    listItem: theme.copy.listItem,
})

const P = withStyles(styles)(({
    className,
    classes,
    children,
} = {}) => <p className={`${classes.p} ${className}`}>
    {children}
</p>)

const UL = withStyles(styles)(({
    classes,
    children,
} = {}) => <ul className={classes.list}>
    {children}
</ul>)

const OL = withStyles(styles)(({
    classes,
    children,
} = {}) => <ol className={classes.list}>
    {children}
</ol>)

const LI = withStyles(styles)(({
    classes,
    children,
} = {}) => <li className={classes.listItem}>
    {children}
</li>)

const H = withStyles(styles)(({
    level = 1,
    styleAs,
    className,
    classes,
    ...props
} = {}) => {
    const hClassName = `h${styleAs || level}`
    const Tag = `h${level}`

    return (
        <Tag
            className={`${classes[hClassName]} ${className}`}
            {...props}

        />
    )
})


export {
    P,
    UL,
    OL,
    LI,
    H,
}

