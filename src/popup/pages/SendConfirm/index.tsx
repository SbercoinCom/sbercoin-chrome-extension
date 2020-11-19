import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Typography, withStyles, Button, WithStyles } from '@material-ui/core';
import cx from 'classnames';

import styles from './styles';
import { SEND_STATE } from '../../../constants';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

@inject('store')
@observer
class SendConfirm extends Component<WithStyles & IProps, {}> {

  public render() {
    const { classes, store: { sendStore } } = this.props;
    const { senderAddress, receiverAddress, amount, token, transactionSpeed, gasLimit,
    gasPrice, maxTxFee, sendState, errorMessage } = sendStore;
    const { SENDING, SENT } = SEND_STATE;

    return (
      <div className={classes.root}>
        <NavBar hasBackButton title={chrome.i18n.getMessage('popup_pages_sendConfirm_confirm')} />
        <div className={classes.contentContainer}>
          <div className={classes.inputContainer}>
            <div className={classes.addressFieldsContainer}>
              <AddressField fieldName={chrome.i18n.getMessage('popup_pages_sendConfirm_from')} address={senderAddress} {...this.props} />
              <AddressField fieldName={chrome.i18n.getMessage('popup_pages_send_to')} address={receiverAddress} {...this.props} />
            </div>
            <CostField fieldName={chrome.i18n.getMessage('popup_pages_send_amount')} amount={amount} unit={token!.symbol} {...this.props} />
            {this.props.store.sendStore.token && this.props.store.sendStore.token.symbol === 'SBER' ? (
              <CostField fieldName={chrome.i18n.getMessage('popup_pages_send_txSpeed')} amount={transactionSpeed} unit={''} {...this.props} />
            ) : (
              <div>
                <CostField fieldName={chrome.i18n.getMessage('popup_pages_send_gasLimit')} amount={gasLimit} unit={'GAS'} {...this.props} />
                <CostField fieldName={chrome.i18n.getMessage('popup_pages_send_gasPrice')} amount={gasPrice} unit={'GREPH/GAS'} {...this.props} />
                <CostField fieldName={chrome.i18n.getMessage('popup_pages_sendConfirm_maxTxFee')} amount={maxTxFee} unit={'SBER'} {...this.props} />
              </div>
            )}
          </div>
          {errorMessage && <Typography className={classes.errorMessage}>{errorMessage}</Typography>}
          <Button
            className={classes.sendButton}
            fullWidth
            disabled={[SENDING, SENT].includes(sendState)}
            variant="contained"
            color="primary"
            onClick={sendStore.send}
          >
            {chrome.i18n.getMessage('popup_pages_sendConfirm_'.concat(sendState.toString()))}
          </Button>
        </div>
      </div>
    );
  }
}

const AddressField = ({ classes, fieldName, address }: any) => (
  <div className={cx(classes.fieldContainer, 'marginSmall')}>
    <Typography className={cx(classes.fieldLabel, 'address')}>{fieldName}</Typography>
    <Typography className={classes.addressValue}>{address}</Typography>
  </div>
);

const CostField = ({ classes, fieldName, amount, unit }: any) => (
  <div className={cx(classes.fieldContainer, 'row', 'marginBig')}>
    <div className={classes.labelContainer}>
      <Typography className={cx(classes.fieldLabel, 'cost')}>{fieldName}</Typography>
    </div>
    <div className={classes.amountContainer}>
      <Typography className={classes.fieldValue}>{amount}</Typography>
    </div>
    <div className={classes.unitContainer}>
      <Typography className={classes.fieldUnit}>{unit}</Typography>
    </div>
  </div>
);

export default withStyles(styles)(SendConfirm);
