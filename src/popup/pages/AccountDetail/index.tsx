import React, { Component, SFC } from 'react';
import { Paper, Tabs, Tab, List, ListItem, Typography, Button, withStyles, WithStyles } from '@material-ui/core';
import { KeyboardArrowRight } from '@material-ui/icons';
import { inject, observer } from 'mobx-react';
import cx from 'classnames';
import { isUndefined } from 'lodash';

import styles from './styles';
import NavBar from '../../components/NavBar';
import Transaction from '../../../models/Transaction';
import AccountInfo from '../../components/AccountInfo';
import AppStore from '../../stores/AppStore';
import QRCToken from '../../../models/QRCToken';
import { shortenTxid } from '../../../utils';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

@inject('store')
@observer
class AccountDetail extends Component<WithStyles & IProps, {}> {

  private messagesEnd?: HTMLElement | null;

  public componentDidMount() {
    const { store: { accountDetailStore } } = this.props;
    accountDetailStore.init();

    if (accountDetailStore.shouldScrollToBottom === true) {
      this.scrollToBottom();
    }
  }

  public componentWillUnmount() {
    this.props.store.accountDetailStore.deinit();
  }

  public scrollToBottom() {
    this.messagesEnd!.scrollIntoView({ behavior: 'smooth' });
    this.props.store.accountDetailStore.shouldScrollToBottom = false;
  }

  public render() {
    const { classes, store: { accountDetailStore } } = this.props;
    const { activeTabIdx } = accountDetailStore;

    return (
      <div className={classes.root}>
        <div className={classes.contentContainer}>
          <Paper className={classes.accountDetailPaper} elevation={2}>
            <NavBar hasBackButton isDarkTheme title={chrome.i18n.getMessage('popup_pages_accountDetail_accountDetail')} />
            <AccountInfo />
          </Paper>
          <Paper className={classes.tabsPaper} elevation={1}>
            <Tabs
              fullWidth
              indicatorColor="primary"
              textColor="primary"
              value={activeTabIdx}
              onChange={(_, value) => accountDetailStore.activeTabIdx = value}
            >
              <Tab label={chrome.i18n.getMessage('popup_pages_accountDetail_transactions')} className={classes.tab} />
              <Tab label={chrome.i18n.getMessage('popup_pages_accountDetail_tokens')} className={classes.tab} />
            </Tabs>
          </Paper>
          <List className={classes.list}>
            {activeTabIdx === 0 ? <TransactionList {...this.props} /> : <TokenList {...this.props} />}
            <div ref={(el) => { this.messagesEnd = el; }}></div>
          </List>
        </div>
      </div>
    );
  }
}

const TransactionList: SFC<any> = observer(({ classes, store: { accountDetailStore } }: any) => (
  <div>
    {accountDetailStore.transactions.map(({ id, pending, confirmations, timestamp, amount }: Transaction) => (
      <ListItem divider key={id} className={classes.listItem} onClick={() => accountDetailStore.onTransactionClick(id)}>
        <div className={classes.txInfoContainer}>
          {pending ? (
            <Typography className={cx(classes.txState, 'pending')}>{chrome.i18n.getMessage('popup_pages_accountDetail_pending')}</Typography>
          ) : (
            <Typography className={classes.txState}>{chrome.i18n.getMessage('popup_pages_accountDetail_confirmations', `${confirmations}`)}</Typography>
          )}
          <Typography className={classes.txId}>{`txid: ${shortenTxid(id)}`}</Typography>
          <Typography className={classes.txTime}>{timestamp || '01-01-2018 00:00'}</Typography>
        </div>
        <AmountInfo classes={classes} amount={amount} token="SBER" />
        <div>
          <KeyboardArrowRight className={classes.arrowRight} />
        </div>
      </ListItem>
    ))}
    <div className={cx(classes.bottomButtonWrap, 'center')}>
      {accountDetailStore.hasMore && (
        <Button
          className={classes.bottomButton}
          id="loadingButton"
          color="primary"
          size="small"
          onClick={accountDetailStore.fetchMoreTxs}
          >
          {chrome.i18n.getMessage('popup_pages_accountDetail_loadMore')}
        </Button>
      )}
    </div>
  </div>
));

const TokenList: SFC<any> = observer(({ classes,
  store: { accountDetailStore, accountDetailStore: { tokens } } }: any) => (
  <div>
    {tokens && tokens.map(({ name, symbol, balance, address }: QRCToken) => (
      <ListItem divider key={symbol} className={classes.listItem}
        onClick = {() => accountDetailStore.editTokenMode && accountDetailStore.removeToken(address)}
      >
        {accountDetailStore.editTokenMode &&
          <Button
            className={classes.tokenDeleteButton}
            id="removeTokenButton"
          >
          <img src="images/ic_delete.svg"/>
          </Button>
        }
        <div className={classes.tokenInfoContainer}>
          <Typography className={classes.tokenName}>{name}</Typography>
        </div>
        <AmountInfo classes={classes} amount={balance === undefined || balance < 1
          ? balance : Math.trunc(balance)} token={symbol} convertedValue={0} />
      </ListItem>
    ))}
    <div className={classes.bottomButtonWrap}>
      <Button
        className={classes.bottomButton}
        id="editTokenButton"
        color="primary"
        size="small"
        onClick={() => accountDetailStore.editTokenMode = !accountDetailStore.editTokenMode }
        >
        {accountDetailStore.editTokenMode ? chrome.i18n.getMessage('popup_pages_accountDetail_done') : chrome.i18n.getMessage('popup_pages_accountDetail_edit')}
      </Button>
      <Button
        className={classes.bottomButton}
        id="addTokenButton"
        color="primary"
        size="small"
        onClick={() => accountDetailStore.routeToAddToken()}
        >
        {chrome.i18n.getMessage('popup_pages_accountDetail_addToken')}
      </Button>
    </div>
  </div>
));

const AmountInfo: SFC<any> = ({ classes, amount, token }: any) => (
  <div>
    <div className={classes.tokenContainer}>
      <Typography className={classes.tokenAmount}>{isUndefined(amount) ? '...' : amount}</Typography>
      <div className={classes.tokenTypeContainer}>
        <Typography className={classes.tokenType}>{token}</Typography>
      </div>
    </div>
    {/* convertedValue && (
      <div className={classes.conversionContainer}>
        <Typography className={classes.tokenType}>{`= ${convertedValue} SBER`}</Typography>
      </div>
    ) */}
  </div>
);

export default withStyles(styles)(AccountDetail);
