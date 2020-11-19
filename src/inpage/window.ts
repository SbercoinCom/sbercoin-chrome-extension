import { ISignExternalTxRequest } from '../types';

function showWindow(width: number, height: number, url: string = '', name: string = 'qrypto-window'): Window {
  const top = (screen.availHeight / 2) - (height / 2);
  const left = (screen.availWidth / 2) - (width / 2);
  const options = `
    height=${height},
    width=${width},
    screenX=${left},
    screenY=${top},
    toolbar=no,
    menubar=no,
    scrollbars=no,
    resizable=no,
    location=no,
    status=no
  `;
  return window.open(url, name, options)!;
}

export function showSignTxWindow(signTxReq: ISignExternalTxRequest) {
  const { url, request } = signTxReq;
  if (!url) {
    throw Error(chrome.i18n.getMessage('error_cannotResolveSignTx'));
  }
  if (!request) {
    throw Error(chrome.i18n.getMessage('error_noTxRequestFound'));
  }

  const { account } = request;
  if (!account) {
    throw Error(chrome.i18n.getMessage('error_noAccountFound'));
  }

  const reqStr = JSON.stringify(request);
  const params = `req=${reqStr}&from=${account.address}`;
  showWindow(350, 650, `${url}?${params}`, 'Confirm Transaction');
}
