
import { withStyles, CSSProperties } from '@mui/styles';
import { Theme } from '@mui/material/styles'
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import Brightness3 from '@mui/icons-material/Brightness3';
import WbSunny from '@mui/icons-material/WbSunny';

import { useThemeMode } from '../../state/ThemeModeProvider'
import { useTheme } from "@/components/ThemeProvider"

const Links = ({ classes }: { classes: Record<string, string>}) => {
    const { themeMode, toggleThemeMode } = useThemeMode()
    const { toggleTheme } = useTheme()

    return (
        <div className={classes.wrapper} >
            <a className={classes.link} href="https://twitter.com/chris_07734">
                <TwitterIcon className={classes.icon} />
            </a>
            <a className={classes.link} href="https://github.com/n07734/community-health">
                <GitHubIcon className={classes.icon} />
            </a>
            <a
                href="#theme"
                onClick={(e) => {
                    e.preventDefault()
                    toggleThemeMode()
                    toggleTheme()
                }}
                className={themeMode}
            >
                <WbSunny className={`${classes.icon} sun`} />
                <Brightness3 className={`${classes.icon} moon`} />
            </a>
        </div>
    );
};

type TagStyles = {
    [key: string]: CSSProperties
}
const styles = (theme:Theme):TagStyles => ({
    wrapper: {
        position: 'absolute',
        zIndex: 1,
        top: theme.mySpacing.x.small,
        right: theme.mySpacing.x.small,
        '& > a': {
            marginLeft: theme.mySpacing.x.small,
        },
        '& a:hover $icon': {
            color: theme.palette.iconHover,
        },
        '& .dark .moon': {
            display: 'none',
        },
        '& .dark:hover .moon': {
            display: 'inline',
        },
        '& .dark:hover .sun': {
            display: 'none',
        },
        '& .light .sun': {
            display: 'none',
        },
        '& .light:hover .sun': {
            display: 'inline',
        },
        '& .light:hover .moon': {
            display: 'none',
        },
    },
    icon: {
        color: theme.palette.text.primary,
    },
})

export default withStyles(styles)(Links)
