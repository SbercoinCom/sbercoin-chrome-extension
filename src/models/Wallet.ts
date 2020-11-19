import { action } from 'mobx';
import { Wallet as SbercoinWallet, Insight, WalletRPCProvider } from 'sberjs-wallet';
import deepEqual from 'deep-equal';

import { ISigner } from '../types';
import { ISendTxOptions } from 'sberjs-wallet/lib/tx';
import { RPC_METHOD, NETWORK_NAMES } from '../constants';

export default class Wallet implements ISigner {
  public qjsWallet?: SbercoinWallet;
  public rpcProvider?: WalletRPCProvider;
  public info?: Insight.IGetInfo;
  public sberUSD?: number;
  public maxSbercoinSend?: number;

  constructor(qjsWallet: SbercoinWallet) {
    this.qjsWallet = qjsWallet;
    this.rpcProvider = new WalletRPCProvider(this.qjsWallet);
  }

  @action
  public updateInfo = async () => {
    if (!this.qjsWallet) {
      console.error('Cannot updateInfo without qjsWallet instance.');
    }

    /**
     * We add a timeout promise to handle if qjsWallet hangs when executing getInfo.
     * (This happens if the insight api is down)
     */
    let timedOut = false;
    const timeoutPromise = new Promise((_, reject) => {
      const wait = setTimeout(() => {
        clearTimeout(wait);
        timedOut = true;
        reject(Error('wallet.getInfo failed, insight api may be down'));
      }, 30000);
    });

    const getInfoPromise = this.qjsWallet!.getInfo();
    const promises = [timeoutPromise, getInfoPromise];
    let newInfo: any;
    try {
      newInfo = await Promise.race(promises);

      // if they are not equal, then the balance has changed
      if (!timedOut && !deepEqual(this.info, newInfo)) {
        this.info = newInfo;
        return true;
      }
    } catch (e) {
      throw(Error(e));
    }

    return false;
  }

  // @param amount: (unit - whole SBER)
  public send = async (to: string, amount: number, options: ISendTxOptions): Promise<Insight.ISendRawTxResult> => {
    if (!this.qjsWallet) {
      throw Error(chrome.i18n.getMessage('error_cannotSendWithoutWallet'));
    }

    // convert amount units from whole SBER => GREPH SBERCOIN.COM
    return await this.qjsWallet!.send(to, amount * 1e7, { feeRate: options.feeRate });
  }

  public sendTransaction = async (args: any[]): Promise<any> => {
    if (!this.rpcProvider) {
      throw Error(chrome.i18n.getMessage('error_cannotSignTxWithoutRPC'));
    }
    if (args.length < 2) {
      throw Error(chrome.i18n.getMessage('error_requiresFirstTwoArguments'));
    }

    try {
      return await this.rpcProvider!.rawCall(RPC_METHOD.SEND_TO_CONTRACT, args);
    } catch (err) {
      throw err;
    }
  }

  public calcMaxSbercoinSend = async (networkName: string) => {
    if (!this.qjsWallet || !this.info) {
      throw Error(chrome.i18n.getMessage('error_cannotCalculateMaxSendAmount'));
    }
    this.maxSbercoinSend = await this.qjsWallet.sendEstimateMaxValue(this.maxSbercoinSendToAddress(networkName));
    return this.maxSbercoinSend;
  }

  /**
   * We just need to pass a valid sendTo address belonging to that network for the
   * sberjs-wallet library to calculate the maxSbercoinSend amount.  It does not matter what
   * the specific address is, as that does not affect the value of the
   * maxSbercoinSend amount
   */
  private maxSbercoinSendToAddress = (networkName: string) => {
    return networkName === NETWORK_NAMES.MAINNET ?
      'SN8HYBmMxVyf7MQaDvBNtneBN8np5dZwoW' : 'sLJsx41F8Uv1KFF3RbrZfdLnyWQzvPdeF9';
  }
}
