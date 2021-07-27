import QRCToken from '../models/QRCToken';

const mainnetTokenList: QRCToken[] = [
   new QRCToken('Sber Ruble', 'SRUB', 6, 'c2eb7eb00a331bb54131284923ed246592bd2985'),
   new QRCToken('Donkey Token', 'DNK', 18, 'ba94770b78e6c2dde90c83521683a7b6a87c092a'),
   new QRCToken('Sber Bitcoin', 'SBTC', 8, 'cbf6ff0ea10882ae21ade96fdc868881c415f0cb'),
   new QRCToken('Sber Tether', 'SUSDT', 6, '8d4c6ac2c9899ff7c6026c79bd66a5164f3a37d7'),
   new QRCToken('JOMO', 'JOMO', 2, 'bb72a5fb7e3a5605be4dca64690eb4aa5df358bb'),
];

export default mainnetTokenList;
