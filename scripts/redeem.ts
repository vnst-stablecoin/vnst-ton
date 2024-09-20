import { compile, NetworkProvider } from '@ton/blueprint';
import {
    addressToString,
    jettonWalletCodeFromLibrary,
    promptAmount,
    promptBool,
    promptUserFriendlyAddress
} from "../wrappers/ui-utils";
import { checkJettonMinter } from "./JettonMinterChecker";

export async function run(provider: NetworkProvider) {
    const isTestnet = provider.network() !== 'mainnet';

    const ui = provider.ui();

    const jettonMinterCode = await compile('JettonMinter');
    const jettonWalletCodeRaw = await compile('JettonWallet');
    const jettonWalletCode = jettonWalletCodeFromLibrary(jettonWalletCodeRaw);
    const jettonMinterAddress = await promptUserFriendlyAddress("Enter the address of the jetton minter", ui, isTestnet);
    try {
        const {
            jettonMinterContract,
            adminAddress,
            decimals
        } = await checkJettonMinter(jettonMinterAddress, jettonMinterCode, jettonWalletCode, provider, ui, isTestnet, true);
        if (!provider.sender().address!.equals(adminAddress)) {
            ui.write('You are not admin of this jetton minter');
            return;
        }
        const amount = await promptAmount("Enter vnst amount to redeem", decimals, ui);
        await jettonMinterContract.sendRedeemVnst(provider.sender(), amount);
        ui.write('Transaction sent');
    } catch (e: any) {
        ui.write(e.message);
        return;
    }
}
