let fromAddress;
let request;
let tokenTransfer;
let apiURL = 'https://explorer.sbercoin.com/api'

const updateFields = () => {
  const { args } = request;
  const to = args[0];
  const amount = args[2] || 0;
  const gasLimit = args[3] || 200000;
  const gasPrice = args[4] ? Number(args[4] / 1e7) : 0.0000001;
  const maxTxFee = Math.round(gasLimit * gasPrice * 1000) / 1000;

  document.getElementById('from-field').innerText = fromAddress;
  document.getElementById('to-field').innerText = to;
  document.getElementById('amount-field').innerText = amount;
  //document.getElementById('gas-limit-field').innerText = gasLimit;
  //document.getElementById('gas-price-field').innerText = gasPrice.toFixed(7);
  document.getElementById('max-tx-fee-field').innerText = maxTxFee;
  //document.getElementById('raw-tx-field').innerText = JSON.stringify(request);

  let functionName = request.args[1].substr(0,8);
  tokenTransfer = functionName === 'a9059cbb';
  if (tokenTransfer) {
    let tokenAmount = parseInt(request.args[1].substr(-64), 16);
    document.getElementById('amount-token-field').innerText = tokenAmount;
    document.getElementById('token-amount-block').style.display = "block";
    document.getElementById('amount-block').style.display = "none";
    fetch(apiURL + '/contract/' + to)
      .then(res => {
        return res.json();
      })
      .then(res => {
        document.getElementById('token-symbol').innerText = res.qrc20.symbol;
      });
  }
  //////////

};

const extractReqParams = () => {
  const urlParams = window.location.search.substr(1).split('&');
  urlParams.forEach((param) => {
    const keyValue = param.split('=');
    if (keyValue.length !== 2) {
      return;
    }

    const key = keyValue[0];
    if (key === 'req') {
      request = JSON.parse(decodeURIComponent(keyValue[1]));
      delete request.account; // Remove the account obj from the raw request
    } else if (key === 'from') {
      fromAddress = keyValue[1];
    }
  });

  updateFields();
};

const confirmTransaction = () => {
  const { id, args } = request;
  //switch (request.method) {
    //case 'sendtocontract':
      chrome.runtime.sendMessage({
        type: 'EXTERNAL_SEND_TO_CONTRACT', // MESSAGE_TYPE.EXTERNAL_SEND_TO_CONTRACT
        id,
        args,
      });
      //break;
  //}
  

  window.close();
};

const cancelTransaction = () => {
  window.close();
};

window.onload = () => {
  localizeHtmlPage();
  extractReqParams();
  document.getElementById('button-confirm').addEventListener('click', confirmTransaction);
  document.getElementById('button-cancel').addEventListener('click', cancelTransaction);
}

function localizeHtmlPage()
{
    //Localize by replacing __MSG_***__ meta tags
    var objects = document.getElementsByTagName('html');
    for (var j = 0; j < objects.length; j++)
    {
        var obj = objects[j];

        var valStrH = obj.innerHTML.toString();
        var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function(match, v1)
        {
            return v1 ? chrome.i18n.getMessage(v1) : "";
        });

        if(valNewH != valStrH)
        {
            obj.innerHTML = valNewH;
        }
    }
}