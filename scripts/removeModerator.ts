import { NetworkProvider } from '@ton/blueprint';

import { JettonMinter } from '../wrappers/JettonMinter';
import { Address, toNano } from '@ton/core';
import { Config } from '../config';
import { promptUserFriendlyAddress } from '../wrappers/ui-utils';

export async function run(provider: NetworkProvider) {
    const isTestnet = provider.network() !== 'mainnet';
    const ui = provider.ui();

    try {
        const contract = provider.open(JettonMinter.createFromAddress(Address.parse(Config.VNST_JETTON_WALLET_ADDRESS)));
        const adminAddress = await promptUserFriendlyAddress("Enter moderator remove address", ui, isTestnet);

        await contract.sendTxRemoveModerator(provider.sender(), adminAddress.address);
        ui.write('Transaction sent!');
    } catch (e: any) {
        ui.write(e.message);
        return;
    }
}
