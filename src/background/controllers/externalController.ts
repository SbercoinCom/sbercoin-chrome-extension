import QryptoController from '.';
import IController from './iController';

const INIT_VALUES = {
  getPriceInterval: undefined,
  sberPriceUSD: 0,
};

export default class ExternalController extends IController {
  private static GET_PRICE_INTERVAL_MS: number = 60000;

  private getPriceInterval?: number = INIT_VALUES.getPriceInterval;
  private sberPriceUSD: number = INIT_VALUES.sberPriceUSD;

  constructor(main: QryptoController) {
    super('external', main);
    this.initFinished();
  }

  public calculateSbercoinToUSD = (balance: number): number => {
    return this.sberPriceUSD ? Number((this.sberPriceUSD * balance).toFixed(2)) : 0;
  }

  /*
  * Starts polling for periodic info updates.
  */
  public startPolling = async () => {
    await this.getSbercoinPrice();
    if (!this.getPriceInterval) {
      this.getPriceInterval = window.setInterval(() => {
        this.getSbercoinPrice();
      }, ExternalController.GET_PRICE_INTERVAL_MS);
    }
  }

  /*
  * Stops polling for the periodic info updates.
  */
  public stopPolling = () => {
    if (this.getPriceInterval) {
      clearInterval(this.getPriceInterval);
      this.getPriceInterval = undefined;
    }
  }

  /*
  * Gets the current Sbercoin market price.
  */
  private getSbercoinPrice = async () => {
    /*try {
      const jsonObj = await axios.get('https://api.coinmarketcap.com/v2/ticker/1684/');
      this.sberPriceUSD = jsonObj.data.data.quotes.USD.price;

      if (this.main.account.loggedInAccount
        && this.main.account.loggedInAccount.wallet
        && this.main.account.loggedInAccount.wallet.info
      ) {
        const sberUSD = this.calculateSbercoinToUSD(this.main.account.loggedInAccount.wallet.info.balance);
        this.main.account.loggedInAccount.wallet.sberUSD = sberUSD;

        chrome.runtime.sendMessage({
          type: MESSAGE_TYPE.GET_SBER_USD_RETURN,
          sberUSD,
        });
      }
    } catch (err) {
      console.log(err);
    }
    */
   return 0;
  }
}
