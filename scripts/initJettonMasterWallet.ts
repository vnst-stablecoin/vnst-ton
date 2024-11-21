import { NetworkProvider } from '@ton/blueprint';
import { JettonMinter } from '../wrappers/JettonMinter';
import { JettonWallet } from '../wrappers/JettonWallet';
import { Address } from '@ton/core';
import { Config } from "../config"

export async function run(provider: NetworkProvider) {
    const isTestnet = provider.network() !== 'mainnet';
    const ui = provider.ui();
    try {
        const contract = provider.open(JettonMinter.createFromAddress(Address.parse(Config.VNST_JETTON_WALLET_ADDRESS)));
        const wallet = provider.open(JettonWallet.createFromAddress(Address.parse(Config.USDT_JETTON_WALLET_ADDRESS)));

        const ownerAddress = Address.parse(Config.VNST_JETTON_WALLET_ADDRESS);
        const jettonWallet = await wallet.getWalletAddress(ownerAddress);
        await contract.sendSetUsdtJettonAddress(provider.sender(), jettonWallet);
        ui.write('Transaction sent');
    } catch (e: any) {
        ui.write(e.message);
        return;
    }
}
