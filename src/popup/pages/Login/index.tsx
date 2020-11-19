import React, { Component, Fragment } from 'react';
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import { inject, observer } from 'mobx-react';

import styles from './styles';
import PasswordInput from '../../components/PasswordInput';
import Logo from '../../components/Logo';
import AppStore from '../../stores/AppStore';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

@inject('store')
@observer
class Login extends Component<WithStyles & IProps, {}> {
  public componentDidMount() {
    this.props.store.loginStore.init();
  }

  public render() {
    const { classes, store: { loginStore } } = this.props;
    const { hasAccounts, matchError, error } = loginStore;

    return (
      <div className={classes.root}>
        <Logo />
        <div className={classes.fieldContainer}>
          <PasswordInput
            classNames={classes.passwordField}
            autoFocus={true}
            placeholder={chrome.i18n.getMessage('popup_pages_login_password')}
            onChange={(e: any) => loginStore.password = e.target.value}
            onEnterPress={loginStore.login}
          />
          {!hasAccounts && (
            <Fragment>
              <PasswordInput
                classNames={classes.passwordField}
                placeholder={chrome.i18n.getMessage('popup_pages_login_confirmPassword')}
                error={!!matchError}
                errorText={matchError}
                onChange={(e: any) => loginStore.confirmPassword = e.target.value}
                onEnterPress={loginStore.login}
              />
              <Typography className={classes.masterPwNote}>
                {chrome.i18n.getMessage('popup_pages_login_infoServeMasterPassword')}
              </Typography>
            </Fragment>
          )}
        </div>
        <Button
          className={classes.loginButton}
          fullWidth
          variant="contained"
          color="primary"
          disabled={error}
          onClick={loginStore.login}
        >
          {chrome.i18n.getMessage('popup_pages_login_login')}
        </Button>
        <ErrorDialog {...this.props} />
      </div>
    );
  }
}

const ErrorDialog: React.SFC<any> = observer(({ store: { loginStore }}: any) => (
  <Dialog
    disableBackdropClick
    open={!!loginStore.invalidPassword}
    onClose={() => loginStore.invalidPassword = undefined}
  >
    <DialogTitle>{chrome.i18n.getMessage('popup_pages_login_invalidPassword')}</DialogTitle>
    <DialogContent>
      <DialogContentText>{chrome.i18n.getMessage('popup_pages_login_infoInvalidPassword')}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => loginStore.invalidPassword = undefined} color="primary">{chrome.i18n.getMessage('popup_pages_login_close')}</Button>
    </DialogActions>
  </Dialog>
));

export default withStyles(styles)(Login);
