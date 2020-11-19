import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Typography, Button, withStyles, WithStyles, Divider } from '@material-ui/core';
import { inject, observer } from 'mobx-react';

import styles from './styles';
import NavBar from '../../components/NavBar';
import Logo from '../../components/Logo';
import BorderTextField from '../../components/BorderTextField';
import AppStore from '../../stores/AppStore';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

@inject('store')
@observer
class CreateWallet extends Component<WithStyles & IProps, {}> {
  public static propTypes = {
    classes: PropTypes.object.isRequired,
  };

  public componentWillUnmount() {
    this.props.store.createWalletStore.reset();
  }

  public render() {
    const { classes, store: { createWalletStore } } = this.props;

    return (
      <div className={classes.root}>
        <NavBar hasBackButton={createWalletStore.showBackButton} hasNetworkSelector title="" />
        <div className={classes.contentContainer}>
          <Logo />
          <div className={classes.fieldContainer}>
            <BorderTextField
              classNames={classes.walletNameField}
              placeholder={chrome.i18n.getMessage('popup_pages_importWallet_walletName')}
              error={createWalletStore.walletNameTaken}
              errorText={createWalletStore.walletNameError}
              onChange={this.onWalletNameChange}
              onEnterPress={this.handleEnterPress}
            />
          </div>
          <Button
            className={classes.loginButton}
            fullWidth
            variant="contained"
            color="primary"
            disabled={createWalletStore.error}
            onClick={createWalletStore.routeToSaveMnemonic}
          >
            {chrome.i18n.getMessage('popup_pages_createWallet_createWallet')}
          </Button>
          <div className={classes.selectionDividerContainer}>
            <Divider className={classes.selectionDivider} />
            <Typography className={classes.selectionDividerText}>{chrome.i18n.getMessage('popup_pages_accountLogin_or')}</Typography>
            <Divider className={classes.selectionDivider} />
          </div>
          <Button
            className={classes.importButton}
            fullWidth
            disableRipple
            color="primary"
            onClick={createWalletStore.routeToImportWallet}
          >
            {chrome.i18n.getMessage('popup_pages_createWallet_importWallet')}
          </Button>
        </div>
      </div>
    );
  }

  private onWalletNameChange = (event: any) => {
    const { createWalletStore, saveMnemonicStore } = this.props.store;
    createWalletStore.walletName = event.target.value;
    saveMnemonicStore.walletName = event.target.value;
  }

  private handleEnterPress = () => {
    const { createWalletStore } = this.props.store;
    if (!!createWalletStore.walletName) {
      createWalletStore.routeToSaveMnemonic();
    }
  }
}

export default withStyles(styles)(CreateWallet);
