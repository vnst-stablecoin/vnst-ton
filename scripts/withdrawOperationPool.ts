import { NetworkProvider } from '@ton/blueprint';

import { JettonMinter } from '../wrappers/JettonMinter';
import { Address, toNano } from '@ton/core';
import { Config } from '../Config';

export async function run(provider: NetworkProvider) {
    const isTestnet = provider.network() !== 'mainnet';
    const ui = provider.ui();

    try {
        const contract = provider.open(JettonMinter.createFromAddress(Address.parse(Config.VNST_JETTON_WALLET_ADDRESS)));
        await contract.sendTxwithdrawOperationPool(provider.sender());
        ui.write('Transaction set mint fee sent');
    } catch (e: any) {
        ui.write(e.message);
        return;
    }
}