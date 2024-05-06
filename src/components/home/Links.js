
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles';
import TwitterIcon from '@material-ui/icons/Twitter';
import GitHubIcon from '@material-ui/icons/GitHub';
import Brightness3 from '@material-ui/icons/Brightness3';
import WbSunny from '@material-ui/icons/WbSunny';

import { toggleTheme } from '../../state/actions'

const Links = ({ classes, themeType, themeToggle }) => {
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
                    themeToggle()
                }}
                className={themeType}
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

const mapStateToProps = (state) => ({
    themeType: state.themeType,
})

const mapDispatchToProps = dispatch => ({
    themeToggle: (x) => dispatch(toggleTheme(x)),
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Links))
