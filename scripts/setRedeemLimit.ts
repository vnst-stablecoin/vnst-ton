import { compile, NetworkProvider } from '@ton/blueprint';
import {
    addressToString,
    jettonWalletCodeFromLibrary,
    promptAmount,
    promptBool,
    promptUserFriendlyAddress
} from "../wrappers/ui-utils";
import { checkJettonMinter } from "./JettonMinterChecker";
import { JettonMinter } from '../wrappers/JettonMinter';
import { Address, toNano } from '@ton/core';

export async function run(provider: NetworkProvider) {
    const isTestnet = provider.network() !== 'mainnet';

    const ui = provider.ui();

    const jettonMinterCode = await compile('JettonMinter');
    const jettonWalletCodeRaw = await compile('JettonWallet');
    const jettonWalletCode = jettonWalletCodeFromLibrary(jettonWalletCodeRaw);

    const jettonMinterAddress = await promptUserFriendlyAddress("Enter the address of the jetton minter", ui, isTestnet);

    try {
        const contract = provider.open(JettonMinter.createFromAddress(Address.parse("kQCU7vVNSMmVSqDbsBYEMiKmLNPX1VkxRp_Kcy091qXbGF-1")));
        const vnst_amount = toNano(50000);

        await contract.sendRedeemMaxlimitVnst(provider.sender(), vnst_amount);
        ui.write('Transaction sent');
    } catch (e: any) {
        ui.write(e.message);
        return;
    }
}
