
import { withStyles } from '@mui/styles';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import Brightness3 from '@mui/icons-material/Brightness3';
import WbSunny from '@mui/icons-material/WbSunny';

import { useThemeMode } from '../../state/ThemeModeProvider'

const Links = ({ classes }) => {
    const { themeMode, toggleThemeMode } = useThemeMode()
    return (
        <div className={classes.wrapper} >
            <a alt="My Twitter page" className={classes.link} href="https://twitter.com/chris_07734">
                <TwitterIcon className={classes.icon} />
            </a>
            <a alt="Github repo page" className={classes.link} href="https://github.com/n07734/community-health">
                <GitHubIcon className={classes.icon} />
            </a>
            <a
                href="#theme"
                alt="Change theme"
                onClick={(e) => {
                    e.preventDefault()
                    toggleThemeMode()
                }}
                className={themeMode}
            >
                <WbSunny className={`${classes.icon} sun`} />
                <Brightness3 className={`${classes.icon} moon`} />
            </a>
        </div>
    );
};

const styles = theme => ({
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
