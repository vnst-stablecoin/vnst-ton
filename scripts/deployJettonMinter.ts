import { Address, Cell, toNano } from '@ton/core';
import { JettonMinter, createConfigCell, createManagementUser } from '../wrappers/JettonMinter';
import { compile, NetworkProvider } from '@ton/blueprint';
import { jettonWalletCodeFromLibrary } from "../wrappers/ui-utils";
import { Config } from "../Config"

export async function run(provider: NetworkProvider) {
    const isTestnet = provider.network() !== 'mainnet';
    const jettonWalletCodeRaw = await compile('JettonWallet');

    const defaultAdminAddress = Config.MODERATOR_ADDRESS;
    const jettonWalletCode = jettonWalletCodeFromLibrary(jettonWalletCodeRaw);
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
    const max_redeem_limit = 5000000000 * 10 ** 6;
    const mint_fee = 0;
    const mint_status = 1; // True
    const redeem_status = 1; // True
    const max_mint_limit_verified_user = 5000 * 10 ** 6;;
    const max_redeem_limit_verified_user = 200000000 * 10 ** 6;
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
        moderator: Address.parse(defaultAdminAddress),
        verified_user: Address.parse(defaultAdminAddress),
        usdt_address: Address.parse(defaultAdminAddress)
    });
    const configCell = createConfigCell(configData);

    const minter = provider.open(JettonMinter.createFromConfig({
        admin: Address.parse(defaultAdminAddress),
        wallet_code: jettonWalletCode,
        jetton_content: { uri: Config.METADATA_URI },
        config_data: configCell,
        managerment_user: managerment_user
    },
        await compile('JettonMinter')));

    await minter.sendDeploy(provider.sender(), toNano("0.5")); // send 1.5 TON
} 