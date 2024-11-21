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
import { Config } from '../config';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    try {
        const contract = provider.open(JettonMinter.createFromAddress(Address.parse(Config.VNST_JETTON_WALLET_ADDRESS)));
        const amount = await promptAmount("Enter redeem limit", 6, ui);

        await contract.sendRedeemMaxlimitVnst(provider.sender(), amount);
        ui.write('Transaction sent');
    } catch (e: any) {
        ui.write(e.message);
        return;
    }
}
