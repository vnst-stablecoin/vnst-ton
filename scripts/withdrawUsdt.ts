import { NetworkProvider } from '@ton/blueprint';

import { JettonMinter } from '../wrappers/JettonMinter';
import { Address, toNano } from '@ton/core';
import { Config } from '../Config';
import { JettonWallet } from '../wrappers/JettonWallet';
import { promptAmount } from '../wrappers/ui-utils';

export async function run(provider: NetworkProvider) {
    const isTestnet = provider.network() !== 'mainnet';
    const ui = provider.ui();

    try {
        const contract = provider.open(JettonMinter.createFromAddress(Address.parse(Config.VNST_JETTON_WALLET_ADDRESS)));
        const wallet = provider.open(JettonWallet.createFromAddress(Address.parse(Config.USDT_JETTON_WALLET_ADDRESS)));
        const ownerAddress = Address.parse(Config.VNST_JETTON_WALLET_ADDRESS);
        const jettonWallet = await wallet.getWalletAddress(ownerAddress);
        const vnstValletUsdt = provider.open(JettonWallet.createFromAddress(jettonWallet));
        const balance = await vnstValletUsdt.getJettonBalance();
        const operation_pool = await contract.getOperationPool();

        const amount = await promptAmount("Enter amount to withdraw", 6, ui);
        if (balance - amount < operation_pool) {
            ui.write('usdt_insufficient');
            return;
        } else {
            await contract.sendTxWithdraw(provider.sender(), BigInt(amount));
        }
        ui.write('Transaction set mint fee sent');
    } catch (e: any) {
        ui.write(e.message);
        return;
    }
}
