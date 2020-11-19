import React, { Component } from 'react';
import { Typography, TextField, Button, withStyles, WithStyles, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Select, MenuItem } from '@material-ui/core';
import { inject, observer } from 'mobx-react';

import styles from './styles';
import NavBar from '../../components/NavBar';
import BorderTextField from '../../components/BorderTextField';
import AppStore from '../../stores/AppStore';
import { IMPORT_TYPE } from '../../../constants';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

interface IState {
  importStore: any;
  walletStore: any;
}

@inject('store')
@observer
class ImportWallet extends Component<WithStyles & IProps, IState> {
  public componentWillUnmount() {
    this.props.store.importStore.reset();
  }

  public render() {
    const { classes, store: { importStore } }: any = this.props;

    return (
      <div className={classes.root}>
        <NavBar hasNetworkSelector title="" />
        <div className={classes.contentContainer}>
          <Typography className={classes.headerText}>{chrome.i18n.getMessage('popup_pages_createWallet_importWallet')}</Typography>
          <div className={classes.inputContainer}>
            <div className={classes.fieldContainer}>
              <TypeField {...this.props} />
              <TextField
                className={classes.mnemonicPrKeyTextField}
                autoFocus
                required
                multiline
                rows={5}
                type="text"
                placeholder={importStore.importType == IMPORT_TYPE.MNEMONIC ? chrome.i18n.getMessage('popup_pages_importWallet_infoEnterMnemonicHere') : chrome.i18n.getMessage('popup_pages_importWallet_infoEnterPrivateKeyHere')}
                onChange={(e) => importStore.mnemonicPrivateKey = e.target.value}
                InputProps={{
                  disableUnderline: true,
                  classes: { input: classes.mnemonicPrKeyFieldInput },
                }}
              />
              {!!importStore.mnemonicPrivateKey && importStore.privateKeyError && (
                <Typography className={classes.errorText}>{importStore.privateKeyError}</Typography>
              )}
                <BorderTextField
                  classNames={classes.borderTextFieldContainer}
                  placeholder={chrome.i18n.getMessage('popup_pages_importWallet_walletName')}
                  error={importStore.walletNameTaken}
                  errorText={importStore.walletNameError}
                  onChange={(e: any) => importStore.accountName = e.target.value}
                  onEnterPress={importStore.importMnemonicOrPrKey}
                />
            </div>
          </div>
          <div>
            <Button
              className={classes.importButton}
              fullWidth
              variant="contained"
              color="primary"
              onClick={importStore.importMnemonicOrPrKey}
              disabled={importStore.mnemonicPrKeyPageError}
            >
              {chrome.i18n.getMessage('popup_pages_importWallet_import')}
            </Button>
            <Button
              className={classes.cancelButton}
              fullWidth
              color="primary"
              onClick={importStore.cancelImport}
            >
              {chrome.i18n.getMessage('popup_pages_importWallet_cancel')}
            </Button>
          </div>
        </div>
        <ErrorDialog {...this.props} />
      </div>
    );
  }
}

const Heading = withStyles(styles, { withTheme: true })(({ classes, name }: any) => (
  <Typography className={classes.fieldHeading}>{name}</Typography>
));

const TypeField = observer(({ classes, store: { importStore } }: any) => (
  <div className={classes.fieldContainer}>
    <Heading name={chrome.i18n.getMessage('popup_pages_importWallet_selectType')} />
    <div className={classes.fieldContentContainer}>
      <Select
        className={classes.typeSelect}
        disableUnderline
        value={importStore.importType}
        onChange={(event) => importStore.changeImportType(event.target.value)}
      >
        <MenuItem value={IMPORT_TYPE.MNEMONIC}>
          <Typography className={classes.menuItemTypography}>{chrome.i18n.getMessage('popup_pages_importWallet_seedPhrase')}</Typography>
        </MenuItem>
        <MenuItem value={IMPORT_TYPE.PRIVATE_KEY}>
          <Typography className={classes.menuItemTypography}>{chrome.i18n.getMessage('popup_pages_importWallet_privateKey')}</Typography>
        </MenuItem>
      </Select>
    </div>
  </div>
));

const ErrorDialog: React.SFC<any> = observer(({ store: { importStore }}: any) => (
  <Dialog
    disableBackdropClick
    open={importStore.importMnemonicPrKeyFailed}
    onClose={() => importStore.importMnemonicPrKeyFailed = false}
  >
    <DialogTitle>{`Invalid ${importStore.importType}`}</DialogTitle>
    <DialogContent>
      <DialogContentText>{chrome.i18n.getMessage('popup_pages_importWallet_alreadyImported')}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => importStore.importMnemonicPrKeyFailed = false} color="primary">{chrome.i18n.getMessage('popup_pages_login_close')}</Button>
    </DialogActions>
  </Dialog>
));

export default withStyles(styles)(ImportWallet);