import { NetworkProvider } from '@ton/blueprint';

import { JettonMinter } from '../wrappers/JettonMinter';
import { Address, toNano } from '@ton/core';

export async function run(provider: NetworkProvider) {
    const isTestnet = provider.network() !== 'mainnet';
    const ui = provider.ui();

    try {
        const contract = provider.open(JettonMinter.createFromAddress(Address.parse("kQCGz9OisEcHS_J8TXLfJTX0e1-bKMxGb0KgNz3esr-Rz36t")));
        const mintFee = BigInt(2000);

        await contract.sendTxSetMintFee(provider.sender(), mintFee);
        ui.write('Transaction set mint fee sent');
    } catch (e: any) {
        ui.write(e.message);
        return;
    }
}
