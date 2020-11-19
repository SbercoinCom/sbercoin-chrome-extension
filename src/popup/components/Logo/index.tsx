import React from 'react';
import { Typography, withStyles } from '@material-ui/core';
// const strings = require('../../localization/locales/en_US.json');

import styles from './styles';

const Logo: React.SFC<any> = ({ classes }: any) => (
  <div className={classes.logoContainer}>
    <img className={classes.logo} src={chrome.runtime.getURL('images/logo.png')} alt={'Logo'} />
    <Typography className={classes.logoText}>Sbercoin.com</Typography>
    <Typography className={classes.version}>{chrome.i18n.getMessage('popup_components_logo_application_version')} {chrome.runtime.getManifest().version}</Typography>
  </div>
);

export default withStyles(styles)(Logo);
