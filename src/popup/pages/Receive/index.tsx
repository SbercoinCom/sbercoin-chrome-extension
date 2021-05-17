import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Typography, withStyles, WithStyles } from '@material-ui/core';
import QRCode from 'qrcode.react';

import styles from './styles';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

@inject('store')
@observer
class Receive extends Component<WithStyles & IProps, {}> {
  public render() {
    const { classes } = this.props;
    const { loggedInAccountName, info/*, sberBalanceUSD, networkBalAnnotation */ } = this.props.store.sessionStore;

    if (!loggedInAccountName || !info) {
      return null;
    }

    return info && (
      <div className={classes.root}>
        <NavBar hasBackButton title={chrome.i18n.getMessage('popup_pages_receive_receive')} />
        <div className={classes.contentContainer}>
          <Typography className={classes.accountName}>{loggedInAccountName}</Typography>
          <Typography className={classes.accountAddress}>{info.addrStr}</Typography>
          <div className={classes.amountContainer}>
            <Typography className={classes.tokenAmount}>{info.coinBalance}</Typography>
            <Typography className={classes.token}>SBER</Typography>
          </div>
          { /*<Typography className={classes.currencyValue}>{`${sberBalanceUSD} ${networkBalAnnotation}`}</Typography> */ }
          <div className={classes.qrCodeContainer}>
            <QRCode value={info!.addrStr} />
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Receive);
