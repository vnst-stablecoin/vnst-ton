import {
    addressToString,
    assert,
    base64toCell,
    equalsMsgAddresses,
    formatAddressAndUrl,
    parseContentCell,
    sendToIndex
} from "../wrappers/ui-utils";
import { Address, Cell, fromNano, OpenedContract } from "@ton/core";
import { JettonMinter, createConfigCell, createManagementUser, parseJettonMinterData } from "../wrappers/JettonMinter";
import { NetworkProvider, UIProvider } from "@ton/blueprint";
import { fromUnits } from "./units";
import { Config } from "../Config";

export const checkJettonMinter = async (
    jettonMinterAddress: {
        isBounceable: boolean,
        isTestOnly: boolean,
        address: Address
    },
    jettonMinterCode: Cell,
    jettonWalletCode: Cell,
    provider: NetworkProvider,
    ui: UIProvider,
    isTestnet: boolean,
    silent: boolean
) => {

    const write = (message: string) => {
        if (!silent) {
            ui.write(message);
        }
    }
    // Account State and Data

    const result = await sendToIndex('account', { address: addressToString(jettonMinterAddress) }, provider);

    write('Contract status: ' + result.status);

    assert(result.status === 'active', "Contract not active", ui);

    if (base64toCell(result.code).equals(jettonMinterCode)) {
        write('The contract code matches the jetton-minter code from this repository');
    } else {
        throw new Error('The contract code DOES NOT match the jetton-minter code from this repository');
    }

    write('Toncoin balance on jetton-minter: ' + fromNano(result.balance) + ' TON');

    const data = base64toCell(result.data);
    const parsedData = parseJettonMinterData(data);
    if (parsedData.wallet_code.equals(jettonWalletCode)) {
        write('The jetton-wallet code matches the jetton-wallet code from this repository');
    } else {
        throw new Error('The jetton-wallet DOES NOT match the jetton-wallet code from this repository');
    }

    const metadataUrl: string = (parsedData.jetton_content as Cell).beginParse().loadStringTail();

    // Get-methods

    const jettonMinterContract: OpenedContract<JettonMinter> = provider.open(JettonMinter.createFromAddress(jettonMinterAddress.address));
    const getData = await jettonMinterContract.getJettonData();

    assert(getData.totalSupply === parsedData.supply, "Total supply doesn't match", ui);
    assert(getData.adminAddress.equals(parsedData.admin), "Admin address doesn't match", ui);

    let decimals: number;
    const parsedContent = await parseContentCell(getData.content);
    if (parsedContent instanceof String) {
        throw new Error('content not HashMap');
    } else {
        const contentMap: any = parsedContent;
        console.assert(contentMap['uri'], metadataUrl, "Metadata URL doesn't match");
        const decimalsString = contentMap['decimals'];
        decimals = parseInt(decimalsString);
        if (isNaN(decimals)) {
            throw new Error('invalid decimals');
        }
    }

    assert(getData.walletCode.equals(parsedData.wallet_code), "Jetton-wallet code doesn't match", ui);

    const getNextAdminAddress = await jettonMinterContract.getNextAdminAddress();
    console.assert(equalsMsgAddresses(getNextAdminAddress, parsedData.transfer_admin), "Next admin address doesn't match");

    // StateInit
    // Default values for config data
    const market_price = 25000000000;
    const usdt_pool = 30000000 * 10 ** 6;
    const vnst_pool = (usdt_pool * market_price) / 10 ** 6;
    const redeem_covered_amount = 100000 * 10 ** 6;
    const mint_covered_amount = 2500000000 * 10 ** 6;
    const redeem_covered_price = 25200000000;
    const mint_covered_price = 24900000000;
    const k = usdt_pool * vnst_pool;
    const min_redeem_limit = 100000 * 10 ** 6;
    const min_mint_limit = 5 * 10 ** 6;
    const max_mint_limit = 2000 * 10 ** 6;
    const operation_pool = 0;
    const redeem_fee = 1000;
    const max_redeem_limit = 100000;
    const mint_fee = 0;
    const mint_status = 1; // True
    const redeem_status = 1; // True
    const max_mint_limit_verified_user = 5000000;
    const max_redeem_limit_verified_user = 2000000000000000;


    // Create a single config cell with all the parts
    const configData = {
        usdt_pool,
        vnst_pool,
        operation_pool,
        k,
        market_price,
        redeem_covered_amount,
        mint_covered_amount,
        redeem_covered_price,
        mint_covered_price,
        min_redeem_limit,
        max_redeem_limit,
        min_mint_limit,
        max_mint_limit,
        redeem_fee,
        mint_fee,
        mint_status,
        redeem_status,
        max_mint_limit_verified_user,
        max_redeem_limit_verified_user
    };


    const managerment_user = createManagementUser({
        moderator: Address.parse(Config.OWNER_ADDRESS),
        verified_user: Address.parse(Config.OWNER_ADDRESS),
        usdt_address: Address.parse(Config.OWNER_ADDRESS)
    });
    const configCell = createConfigCell(configData);
    const defaultAdminAddress = 'Config.OWNER_ADDRESS';
    const defaultMetadataUrl = Config.METADATA_URI;

    const jettonMinterContract2 = JettonMinter.createFromConfig({
        admin: Address.parse(defaultAdminAddress),
        wallet_code: jettonWalletCode,
        jetton_content: { uri: defaultMetadataUrl },
        config_data: configCell,
        managerment_user: managerment_user
    }, jettonMinterCode)

    if (jettonMinterContract2.address.equals(jettonMinterAddress.address)) {
        write('StateInit matches');
    }

    // Print

    write('Decimals: ' + decimals);
    write('Total Supply: ' + fromUnits(parsedData.supply, decimals));
    write('Mintable: ' + getData.mintable);
    write(`Metadata URL: "${metadataUrl}"`);
    write('Current admin address: ' + (await formatAddressAndUrl(parsedData.admin, provider, isTestnet)));
    const nextAdminAddress = parsedData.transfer_admin;
    if (!nextAdminAddress) {
        write('Next admin address: null');
    } else {
        write('Next admin address: ' + (await formatAddressAndUrl(nextAdminAddress, provider, isTestnet)));
    }

    return {
        jettonMinterContract,
        adminAddress: parsedData.admin,
        nextAdminAddress: parsedData.transfer_admin,
        decimals
    }
}