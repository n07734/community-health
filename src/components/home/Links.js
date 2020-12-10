import React from 'react'
import { withStyles } from '@material-ui/core/styles';

import TwitterIcon from '@material-ui/icons/Twitter';
import GitHubIcon from '@material-ui/icons/GitHub';

const Links = ({ classes }) => {
    return (
        <div className={classes.wrapper} >
            <a alt="My Twitter page" className={classes.link} href="https://twitter.com/chris_07734">
                <TwitterIcon className={classes.icon} />
            </a>
            <a alt="Github repo page" className={classes.link} href="https://github.com/n07734/community-health">
                <GitHubIcon className={classes.icon} />
            </a>
        </div>
    );
};

const styles = theme => ({
    wrapper: {
        position: 'absolute',
        top: theme.mySpacing.x.small,
        right: theme.mySpacing.y.small,
        '& a:first-of-type': {
            marginRight: theme.mySpacing.x.small
        },
        '& a:hover $icon': {
            color: theme.palette.iconHover
        },
    },
    icon: {
        color: theme.palette.text.primary,
    }
})

export default withStyles(styles)(Links)

