import { Insight } from 'sberjs-wallet';
import { map, /*find, partition, sumBy, includes,*/ round } from 'lodash';
import moment from 'moment';

import QryptoController from '.';
import IController from './iController';
import { MESSAGE_TYPE } from '../../constants';
import Transaction from '../../models/Transaction';

export default class TransactionController extends IController {
  private static GET_TX_INTERVAL_MS: number = 60000;

  public transactions: Transaction[] = [];
  public pageNum: number = 0;
  public pagesTotal?: number;
  public get hasMore(): boolean {
    return !!this.pagesTotal && (this.pagesTotal > this.pageNum + 1);
  }

  private getTransactionsInterval?: number = undefined;

  constructor(main: QryptoController) {
    super('transaction', main);

    chrome.runtime.onMessage.addListener(this.handleMessage);
    this.initFinished();
  }

  /*
  * Fetches the first page of transactions.
  */
  public fetchFirst = async () => {
    this.transactions = await this.fetchTransactions(0);
    this.sendTransactionsMessage();
  }

  /*
  * Fetches the more transactions based on pageNum.
  */
  public fetchMore = async () => {
    this.pageNum = this.pageNum + 1;
    const txs = await this.fetchTransactions(this.pageNum);
    this.transactions = this.transactions.concat(txs);
    this.sendTransactionsMessage();
  }

  /*
  * Stops polling for the periodic info updates.
  */
  public stopPolling = () => {
    if (this.getTransactionsInterval) {
      clearInterval(this.getTransactionsInterval);
      this.getTransactionsInterval = undefined;
      this.pageNum = 0;
    }
  }

  // TODO: if a new transaction comes in, the transactions on a page will shift(ie if 1 page has 10 transactions,
  // transaction number 10 shifts to page2), and the bottom most transaction would disappear from the list.
  // Need to add some additional logic to keep the bottom most transaction displaying.
  private refreshTransactions = async () => {
    let refreshedItems: Transaction[] = [];
    for (let i = 0; i <= this.pageNum; i++) {
      refreshedItems = refreshedItems.concat(await this.fetchTransactions(i));
    }
    this.transactions = refreshedItems;
    this.sendTransactionsMessage();
  }

  /*
  * Starts polling for periodic info updates.
  */
  private startPolling = async () => {
    this.fetchFirst();
    if (!this.getTransactionsInterval) {
      this.getTransactionsInterval = window.setInterval(() => {
        this.refreshTransactions();
      }, TransactionController.GET_TX_INTERVAL_MS);
    }
  }

  /*
  * Fetches the transactions of the current wallet instance.
  * @param pageNum The page of transactions to fetch.
  * @return The Transactions array.
  */
  private fetchTransactions = async (pageNum: number = 0): Promise<Transaction[]> => {
    if (!this.main.account.loggedInAccount
      || !this.main.account.loggedInAccount.wallet
      || !this.main.account.loggedInAccount.wallet.qjsWallet
    ) {
      console.error(chrome.i18n.getMessage('error_cannotGetTransactions'));
      return [];
    }

    const wallet = this.main.account.loggedInAccount.wallet.qjsWallet;
    const { totalCount, transactions } =  await wallet.getTransactions(pageNum);
    this.pagesTotal = totalCount;

    return map(transactions, (tx: Insight.IRawTransactionBasicInfo) => {
      const {
        id,
        confirmations,
        timestamp,
        amount
      } = tx;

      /*const sender = find(inputs, {addr: wallet.address});
      const outs = map(outputs, ({ value, scriptPubKey: { addresses } }) => {
        return { value, addresses };
      });
      const [mine, other] = partition(outs, ({ addresses }) => includes(addresses, wallet.address));
      const amount = sumBy(sender ? other : mine, ({ value }) => parseFloat(value));
      */
      return new Transaction({
        id: id,
        timestamp: moment(new Date(timestamp * 1000)).format('MM-DD-YYYY, HH:mm'),
        confirmations,
        amount: round(amount/1e7, 7),
      });
    });
  }

  /*
  * Sends the message after fetching transactions.
  */
  private sendTransactionsMessage = () => {
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPE.GET_TXS_RETURN,
      transactions: this.transactions,
      hasMore: this.hasMore,
    });
  }

  private handleMessage = (request: any) => {
    try {
      switch (request.type) {
        case MESSAGE_TYPE.START_TX_POLLING:
          this.startPolling();
          break;
        case MESSAGE_TYPE.STOP_TX_POLLING:
          this.stopPolling();
          break;
        case MESSAGE_TYPE.GET_MORE_TXS:
          this.fetchMore();
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(err);
      this.main.displayErrorOnPopup(err);
    }
  }
}
