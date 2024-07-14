
import { withStyles, CSSProperties } from '@mui/styles'
import { Theme } from '@mui/material/styles'

type TagArgs = {
    level?: 1 | 2 | 3 | 4;
    styleAs?: 1 | 2 | 3 | 4;
    className?: string;
    href?: string;
    children?: React.ReactNode;
    classes: Record<string, string>;
    style?: CSSProperties;
}

type TagStyles = {
    [key: string]: CSSProperties
}
const styles = (theme: Theme): TagStyles => ({
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
    classes = {},
    children,
}: TagArgs) => <a href={href} className={`${classes.link} ${className}`}>
    {children}
</a>)

const P = withStyles(styles)(({
    className = '',
    classes = {},
    children,
}: TagArgs) => <p className={`${classes.p} ${className}`}>
    {children}
</p>)

const UL = withStyles(styles)(({
    classes = {},
    children,
}: TagArgs) => <ul className={classes.list}>
    {children}
</ul>)

const OL = withStyles(styles)(({
    classes = {},
    children,
}: TagArgs) => <ol className={classes.list}>
    {children}
</ol>)

const LI = withStyles(styles)(({
    classes = {},
    children,
}: TagArgs) => <li className={classes.listItem}>
    {children}
</li>)

const H = withStyles(styles)(({
    level = 1,
    styleAs,
    className = '',
    classes = {},
    ...props
}: TagArgs) => {
    const hClassName = `h${styleAs || level}`
    const Tag = `h${level}` as React.ElementType

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

