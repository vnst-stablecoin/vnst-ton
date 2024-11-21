import { NetworkProvider } from '@ton/blueprint';

import { JettonMinter } from '../wrappers/JettonMinter';
import { Address, toNano } from '@ton/core';
import { Config } from '../config';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();

    try {
        const contract = provider.open(JettonMinter.createFromAddress(Address.parse(Config.VNST_JETTON_WALLET_ADDRESS)));
        const reverse_ton = toNano(0);
        await contract.sendTxTonWithdraw(provider.sender(), reverse_ton);
        ui.write('Transaction withdraw ton sent');
    } catch (e: any) {
        ui.write(e.message);
        return;
    }
}

