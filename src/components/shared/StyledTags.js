
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
    p: theme.copy.body,
    h1: theme.copy.h1,
    h2: theme.copy.h2,
    h3: theme.copy.h3,
    h4: theme.copy.h4,
    link: {
        color: theme.palette.link,
    },
    list: theme.copy.list,
    listItem: theme.copy.listItem,
})

const A = withStyles(styles)(({
    className = '',
    href ='',
    classes,
    children,
} = {}) => <a href={href} className={`${classes.link} ${className}`}>
    {children}
</a>)

const P = withStyles(styles)(({
    className = '',
    classes = {},
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
    className = '',
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
    A,
    P,
    UL,
    OL,
    LI,
    H,
}

