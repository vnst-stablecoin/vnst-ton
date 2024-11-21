import { compile, NetworkProvider } from '@ton/blueprint';
import { jettonWalletCodeFromLibrary, promptBool, promptUrl, promptUserFriendlyAddress } from "../wrappers/ui-utils";
import { checkJettonMinter } from "./JettonMinterChecker";
import { JettonMinter } from '../wrappers/JettonMinter';
import { Address } from '@ton/core';
import { Config } from '../config';

export async function run(provider: NetworkProvider) {

    const ui = provider.ui();

    try {
        const contract = provider.open(JettonMinter.createFromAddress(Address.parse(Config.VNST_JETTON_WALLET_ADDRESS)));

        const jettonMetadataUri = Config.METADATA_URI;
        await contract.sendChangeContent(provider.sender(), {
            uri: jettonMetadataUri
        });

        ui.write('Transaction sent');

    } catch (e: any) {
        ui.write(e.message);
        return;
    }
}
