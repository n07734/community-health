
import { withStyles } from '@mui/styles'
import { CSSProperties } from 'react';

type StylesDictionary = {
    [key: string]: CSSProperties
    [key: `@media (min-width: ${number}px)`]: {
         [key: string]: CSSProperties
    }
}

const styles = () => ({
    root: {
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        gap: 0,
        alignItems: 'center',
        '@media (min-width: 2400px)': {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: '0 20px',
            justifyContent: 'center',
        },
    } as StylesDictionary,
})

type GraphsWrapProps = {
    classes: Record<string, string>
    children: React.ReactNode
}
const GraphsWrap = ({ classes = {}, children }: GraphsWrapProps) => (
    <div
        className={classes.root}
    >
        {children}
    </div>
)

export default withStyles(styles)(GraphsWrap)