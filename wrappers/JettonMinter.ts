import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode, Slice,
    toNano
} from '@ton/core';
import { JettonWallet } from './JettonWallet';
import { Op } from './JettonConstants';

export type JettonMinterContent = {
    uri: string
};

export type JettonMinterConfigData = {
    usdt_pool: number,
    vnst_pool: number,
    operation_pool: number,
    k: number,
    market_price: number,
    redeem_covered_amount: number,
    mint_covered_amount: number,
    redeem_covered_price: number,
    mint_covered_price: number,
    min_redeem_limit: number,
    max_redeem_limit: number,
    min_mint_limit: number,
    max_mint_limit: number,
    redeem_fee: number,
    mint_fee: number,
    mint_status: number,
    redeem_status: number,
    max_mint_limit_verified_user: number,
    max_redeem_limit_verified_user: number
};

export type JettonMinterManagemnentUser = {
    moderator: Address,
    verified_user: Address,
    usdt_address: Address
}

export type LockType = 'unlock' | 'out' | 'in' | 'full';

export const LOCK_TYPES = ['unlock', 'out', 'in', 'full'];

export const lockTypeToInt = (lockType: LockType): number => {
    switch (lockType) {
        case 'unlock':
            return 0;
        case 'out':
            return 1;
        case 'in':
            return 2;
        case 'full':
            return 3;
        default:
            throw new Error("Invalid argument!");
    }
}

export const intToLockType = (lockType: number): LockType => {
    switch (lockType) {
        case 0:
            return 'unlock';
        case 1:
            return 'out';
        case 2:
            return 'in';
        case 3:
            return 'full';
        default:
            throw new Error("Invalid argument!");
    }
}

export function endParse(slice: Slice) {
    if (slice.remainingBits > 0 || slice.remainingRefs > 0) {
        throw new Error('remaining bits in data');
    }
}
export function createManagementUser(data: JettonMinterManagemnentUser) {
    const managerment_user = beginCell()
        .storeAddress(data.moderator)
        .endCell();

    const verified_user = beginCell()
        .storeAddress(data.verified_user)
        .endCell();


    return beginCell()
        .storeRef(managerment_user)
        .storeRef(verified_user)
        .storeAddress(data.usdt_address)
        .endCell();
}
export function createConfigCell(configData: JettonMinterConfigData): Cell {
    const poolCell = beginCell()
        .storeUint(configData.usdt_pool, 128)
        .storeUint(configData.vnst_pool, 128)
        .storeUint(configData.operation_pool, 128)
        .storeUint(configData.k, 256)
        .endCell();

    const priceCell = beginCell()
        .storeUint(configData.market_price, 128)
        .storeUint(configData.redeem_covered_price, 128)
        .storeUint(configData.mint_covered_price, 128)
        .storeUint(configData.redeem_covered_amount, 128)
        .storeUint(configData.mint_covered_amount, 128)
        .endCell();

    const limitCell = beginCell()
        .storeUint(configData.min_redeem_limit, 128)
        .storeUint(configData.max_redeem_limit, 128)
        .storeUint(configData.min_mint_limit, 128)
        .storeUint(configData.max_mint_limit, 128)
        .storeUint(configData.max_mint_limit_verified_user, 128)
        .storeUint(configData.max_redeem_limit_verified_user, 128)
        .endCell();

    const feeAndStatusCell = beginCell()
        .storeUint(configData.redeem_fee, 64)
        .storeUint(configData.mint_fee, 64)
        .storeUint(configData.mint_status, 1)
        .storeUint(configData.redeem_status, 1)
        .endCell();

    return beginCell()
        .storeRef(poolCell)
        .storeRef(priceCell)
        .storeRef(limitCell)
        .storeRef(feeAndStatusCell)
        .endCell();
}

export type JettonMinterConfig = {
    admin: Address;
    wallet_code: Cell;
    jetton_content: Cell | JettonMinterContent;
    config_data: Cell;  // The full configuration data as a single cell
    managerment_user: Cell;  // The full configuration data as a single cell
};

export type JettonMinterConfigFull = {
    supply: bigint;
    admin: Address;
    transfer_admin: Address | null;
    wallet_code: Cell;
    jetton_content: Cell | JettonMinterContent;
    config_data: Cell;  // The full configuration data as a single cell
    management_user: Cell;  // The full configuration data as a single cell
};

export function jettonMinterConfigCellToConfig(config: Cell): JettonMinterConfigFull {
    const sc = config.beginParse();
    const parsed: JettonMinterConfigFull = {
        supply: sc.loadCoins(),
        admin: sc.loadAddress(),
        transfer_admin: sc.loadMaybeAddress(),
        wallet_code: sc.loadRef(),
        jetton_content: sc.loadRef(),
        config_data: sc.loadRef(),  // Load the full configuration data as a single cell
        management_user: sc.loadRef(),  // Load the full configuration data as a single cell
    };
    endParse(sc);
    return parsed;
}

export function parseJettonMinterData(data: Cell): JettonMinterConfigFull {
    return jettonMinterConfigCellToConfig(data);
}

export function jettonMinterConfigFullToCell(config: JettonMinterConfigFull): Cell {
    const content = config.jetton_content instanceof Cell
        ? config.jetton_content
        : beginCell().storeStringRefTail(config.jetton_content.uri).endCell();

    return beginCell()
        .storeCoins(config.supply)
        .storeAddress(config.admin)
        .storeAddress(config.transfer_admin)
        .storeRef(config.wallet_code)
        .storeRef(content)
        .storeRef(config.config_data)  // Store the full configuration data as a single cell
        .endCell();
}


export class JettonMinter implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {
    }

    static createFromAddress(address: Address) {
        return new JettonMinter(address);
    }

    static createFromConfig(config: JettonMinterConfig, code: Cell, workchain = 0) {
        const contentCell = config.jetton_content instanceof Cell
            ? config.jetton_content
            : beginCell().storeStringRefTail(config.jetton_content.uri).endCell();

        const data = beginCell()
            .storeCoins(0n)  // Initial supply is 0
            .storeAddress(config.admin)
            .storeAddress(null)  // Transfer admin address is initially null
            .storeRef(config.wallet_code)
            .storeRef(contentCell)  // Store the content (metadata URI or Cell)
            .storeRef(config.config_data)  // Store the full configuration data as a single cell
            .storeRef(config.managerment_user)  // Store the full configuration data as a single cell
            .endCell();

        const init = { code, data };
        return new JettonMinter(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(Op.top_up, 32).storeUint(0, 64).endCell(),
        });
    }

    static mintMessage(to: Address, jetton_amount: bigint, from?: Address | null, response?: Address | null, customPayload?: Cell | null, forward_ton_amount: bigint = 0n, total_ton_amount: bigint = 0n) {
        const mintMsg = beginCell().storeUint(Op.internal_transfer, 32)
            .storeUint(0, 64)
            .storeCoins(jetton_amount)
            .storeAddress(from)
            .storeAddress(response)
            .storeCoins(forward_ton_amount)
            .storeMaybeRef(customPayload)
            .endCell();
        return beginCell().storeUint(Op.mint, 32).storeUint(0, 64) // op, queryId
            .storeAddress(to)
            .storeCoins(total_ton_amount)
            .storeRef(mintMsg)
            .endCell();
    }

    static parseMintInternalMessage(slice: Slice) {
        const op = slice.loadUint(32);
        if (op !== Op.internal_transfer) throw new Error('Invalid op');
        const queryId = slice.loadUint(64);
        const jettonAmount = slice.loadCoins();
        const fromAddress = slice.loadAddress();
        const responseAddress = slice.loadAddress();
        const forwardTonAmount = slice.loadCoins();
        const customPayload = slice.loadMaybeRef();
        endParse(slice);
        return {
            queryId,
            jettonAmount,
            fromAddress,
            responseAddress,
            forwardTonAmount,
            customPayload
        }
    }

    static parseMintMessage(slice: Slice) {
        const op = slice.loadUint(32);
        if (op !== Op.mint) throw new Error('Invalid op');
        const queryId = slice.loadUint(64);
        const toAddress = slice.loadAddress();
        const tonAmount = slice.loadCoins();
        const mintMsg = slice.loadRef();
        endParse(slice);
        return {
            queryId,
            toAddress,
            tonAmount,
            internalMessage: this.parseMintInternalMessage(mintMsg.beginParse())
        }
    }

    async sendMint(provider: ContractProvider,
        via: Sender,
        to: Address,
        jetton_amount: bigint,
        from?: Address | null,
        response_addr?: Address | null,
        customPayload?: Cell | null,
        forward_ton_amount: bigint = toNano('0.05'), total_ton_amount: bigint = toNano('0.1')) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.mintMessage(to, jetton_amount, from, response_addr, customPayload, forward_ton_amount, total_ton_amount),
            value: total_ton_amount,
        });
    }

    /* provide_wallet_address#2c76b973 query_id:uint64 owner_address:MsgAddress include_address:Bool = InternalMsgBody;
    */
    static discoveryMessage(owner: Address, include_address: boolean) {
        return beginCell().storeUint(Op.provide_wallet_address, 32).storeUint(0, 64) // op, queryId
            .storeAddress(owner).storeBit(include_address)
            .endCell();
    }

    async sendDiscovery(provider: ContractProvider, via: Sender, owner: Address, include_address: boolean, value: bigint = toNano('0.1')) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.discoveryMessage(owner, include_address),
            value: value,
        });
    }

    static topUpMessage() {
        return beginCell().storeUint(Op.top_up, 32).storeUint(0, 64) // op, queryId
            .endCell();
    }

    static parseTopUp(slice: Slice) {
        const op = slice.loadUint(32);
        if (op !== Op.top_up) throw new Error('Invalid op');
        const queryId = slice.loadUint(64);
        endParse(slice);
        return {
            queryId,
        }
    }

    async sendTopUp(provider: ContractProvider, via: Sender, value: bigint = toNano('0.1')) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.topUpMessage(),
            value: value,
        });
    }

    static changeAdminMessage(newOwner: Address) {
        return beginCell().storeUint(Op.change_admin, 32).storeUint(0, 64) // op, queryId
            .storeAddress(newOwner)
            .endCell();
    }

    static parseChangeAdmin(slice: Slice) {
        const op = slice.loadUint(32);
        if (op !== Op.change_admin) throw new Error('Invalid op');
        const queryId = slice.loadUint(64);
        const newAdminAddress = slice.loadAddress();
        endParse(slice);
        return {
            queryId,
            newAdminAddress
        }
    }

    async sendChangeAdmin(provider: ContractProvider, via: Sender, newOwner: Address) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.changeAdminMessage(newOwner),
            value: toNano("0.1"),
        });
    }

    static claimAdminMessage(query_id: bigint = 0n) {
        return beginCell().storeUint(Op.claim_admin, 32).storeUint(query_id, 64).endCell();
    }

    static parseClaimAdmin(slice: Slice) {
        const op = slice.loadUint(32);
        if (op !== Op.claim_admin) throw new Error('Invalid op');
        const queryId = slice.loadUint(64);
        endParse(slice);
        return {
            queryId
        }
    }

    async sendClaimAdmin(provider: ContractProvider, via: Sender, query_id: bigint = 0n) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.claimAdminMessage(query_id),
            value: toNano('0.1')
        })
    }

    static changeContentMessage(content: Cell | JettonMinterContent) {
        const contentString = content instanceof Cell ? content.beginParse().loadStringTail() : content.uri;
        return beginCell().storeUint(Op.change_metadata_url, 32).storeUint(0, 64) // op, queryId
            .storeStringTail(contentString)
            .endCell();
    }

    static parseChangeContent(slice: Slice) {
        const op = slice.loadUint(32);
        if (op !== Op.change_metadata_url) throw new Error('Invalid op');
        const queryId = slice.loadUint(64);
        const newMetadataUrl = slice.loadStringTail();
        endParse(slice);
        return {
            queryId,
            newMetadataUrl
        }
    }

    async sendChangeContent(provider: ContractProvider, via: Sender, content: Cell | JettonMinterContent) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.changeContentMessage(content),
            value: toNano("0.1"),
        });
    }

    static lockWalletMessage(lock_address: Address, lock: number, amount: bigint, query_id: bigint | number = 0) {
        return beginCell().storeUint(Op.call_to, 32).storeUint(query_id, 64)
            .storeAddress(lock_address)
            .storeCoins(amount)
            .storeRef(beginCell().storeUint(Op.set_status, 32).storeUint(query_id, 64).storeUint(lock, 4).endCell())
            .endCell();
    }

    static parseSetStatus(slice: Slice) {
        const op = slice.loadUint(32);
        if (op !== Op.set_status) throw new Error('Invalid op');
        const queryId = slice.loadUint(64);
        const newStatus = slice.loadUint(4);
        endParse(slice);
        return {
            queryId,
            newStatus
        }
    }

    static parseCallTo(slice: Slice, refPrser: (slice: Slice) => any) {
        const op = slice.loadUint(32);
        if (op !== Op.call_to) throw new Error('Invalid op');
        const queryId = slice.loadUint(64);
        const toAddress = slice.loadAddress();
        const tonAmount = slice.loadCoins();
        const ref = slice.loadRef();
        endParse(slice);
        return {
            queryId,
            toAddress,
            tonAmount,
            action: refPrser(ref.beginParse())
        }
    }

    async sendLockWallet(provider: ContractProvider, via: Sender, lock_address: Address, lock: LockType, amount: bigint = toNano('0.1'), query_id: bigint | number = 0) {
        const lockCmd: number = lockTypeToInt(lock);

        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.lockWalletMessage(lock_address, lockCmd, amount, query_id),
            value: amount + toNano('0.1')
        });
    }

    static forceTransferMessage(transfer_amount: bigint,
        to: Address,
        from: Address,
        custom_payload: Cell | null,
        forward_amount: bigint = 0n,
        forward_payload: Cell | null,
        value: bigint = toNano('0.1'),
        query_id: bigint = 0n) {

        const transferMessage = JettonWallet.transferMessage(transfer_amount,
            to,
            to,
            custom_payload,
            forward_amount,
            forward_payload);
        return beginCell().storeUint(Op.call_to, 32).storeUint(query_id, 64)
            .storeAddress(from)
            .storeCoins(value)
            .storeRef(transferMessage)
            .endCell();
    }

    static parseTransfer(slice: Slice) {
        const op = slice.loadUint(32);
        if (op !== Op.transfer) throw new Error('Invalid op');
        const queryId = slice.loadUint(64);
        const jettonAmount = slice.loadCoins();
        const toAddress = slice.loadAddress();
        const responseAddress = slice.loadAddress();
        const customPayload = slice.loadMaybeRef();
        const forwardTonAmount = slice.loadCoins();
        const inRef = slice.loadBit();
        const forwardPayload = inRef ? slice.loadRef().beginParse() : slice;
        return {
            queryId,
            jettonAmount,
            toAddress,
            responseAddress,
            customPayload,
            forwardTonAmount,
            forwardPayload
        }
    }

    async sendForceTransfer(provider: ContractProvider,
        via: Sender,
        transfer_amount: bigint,
        to: Address,
        from: Address,
        custom_payload: Cell | null,
        forward_amount: bigint = toNano('0.005'),
        forward_payload: Cell | null,
        value: bigint = toNano('0.1'),
        query_id: bigint = 0n) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.forceTransferMessage(transfer_amount,
                to, from,
                custom_payload,
                forward_amount,
                forward_payload,
                value, query_id),
            value: value + toNano('0.1')
        });
    }

    static forceBurnMessage(burn_amount: bigint,
        to: Address,
        response: Address | null,
        value: bigint = toNano('0.1'),
        query_id: bigint | number = 0) {

        return beginCell().storeUint(Op.call_to, 32).storeUint(query_id, 64)
            .storeAddress(to)
            .storeCoins(value)
            .storeRef(JettonWallet.burnMessage(burn_amount, response, null))
            .endCell()
    }

    static parseBurn(slice: Slice) {
        const op = slice.loadUint(32);
        if (op !== Op.burn) throw new Error('Invalid op');
        const queryId = slice.loadUint(64);
        const jettonAmount = slice.loadCoins();
        const responseAddress = slice.loadAddress();
        const customPayload = slice.loadMaybeRef();
        endParse(slice);
        return {
            queryId,
            jettonAmount,
            responseAddress,
            customPayload,
        }
    }
    async sendForceBurn(provider: ContractProvider,
        via: Sender,
        burn_amount: bigint,
        address: Address,
        response: Address | null,
        value: bigint = toNano('0.1'),
        query_id: bigint | number = 0) {

        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.forceBurnMessage(burn_amount, address, response, value, query_id),
            value: value + toNano('0.1')
        });
    }



    static parseUpgrade(slice: Slice) {
        const op = slice.loadUint(32);
        if (op !== Op.upgrade) throw new Error('Invalid op');
        const queryId = slice.loadUint(64);
        const newData = slice.loadRef();
        const newCode = slice.loadRef();
        endParse(slice);
        return {
            queryId,
            newData,
            newCode
        }
    }
    static upgradeMessage(new_code: Cell, query_id: bigint | number = 0) {
        return beginCell().storeUint(Op.upgrade, 32).storeUint(query_id, 64)
            .storeRef(new_code)
            .endCell();
    }
    async sendUpgrade(provider: ContractProvider, via: Sender, new_code: Cell, value: bigint = toNano('0.1'), query_id: bigint | number = 0) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.upgradeMessage(new_code, query_id),
            value
        });
    }

    async getWalletAddress(provider: ContractProvider, owner: Address): Promise<Address> {
        const res = await provider.get('get_wallet_address', [{
            type: 'slice',
            cell: beginCell().storeAddress(owner).endCell()
        }])
        return res.stack.readAddress()
    }

    async getJettonData(provider: ContractProvider) {
        let res = await provider.get('get_jetton_data', []);
        let totalSupply = res.stack.readBigNumber();
        let mintable = res.stack.readBoolean();
        let adminAddress = res.stack.readAddress();
        let content = res.stack.readCell();
        let walletCode = res.stack.readCell();
        return {
            totalSupply,
            mintable,
            adminAddress,
            content,
            walletCode,
        };
    }

    async getTotalSupply(provider: ContractProvider) {
        let res = await this.getJettonData(provider);
        return res.totalSupply;
    }

    async getAdminAddress(provider: ContractProvider) {
        let res = await this.getJettonData(provider);
        return res.adminAddress;
    }

    async getContent(provider: ContractProvider) {
        let res = await this.getJettonData(provider);
        return res.content;
    }

    async getNextAdminAddress(provider: ContractProvider) {
        const res = await provider.get('get_next_admin_address', []);
        return res.stack.readAddressOpt();
    }
    static mintVnstMessage(to: Address, total_ton_amount: bigint, forward_ton_amount: bigint, usdt_amount: bigint,) {
        return beginCell().storeUint(Op.mint_vnst, 32).storeUint(0, 64) // op, queryId
            .storeAddress(to)
            .storeCoins(total_ton_amount)
            .storeCoins(forward_ton_amount)
            .storeUint(usdt_amount, 64)
            .endCell();
    }

    async sendMintVnst(provider: ContractProvider,
        via: Sender,
        to: Address,
        usdt_amount: bigint,
        forward_ton_amount: bigint = toNano('0.05'), total_ton_amount: bigint = toNano('0.1')) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.mintVnstMessage(to, total_ton_amount, forward_ton_amount, usdt_amount),
            value: total_ton_amount,
        });
    }

    static mintVnstMessageExternal(to: Address, total_ton_amount: bigint, forward_ton_amount: bigint, usdt_amount: bigint) {
        return beginCell()
            .storeUint(Op.mint_vnst, 32)
            .storeAddress(to)
            .storeCoins(total_ton_amount)
            .storeCoins(forward_ton_amount)
            .storeUint(usdt_amount, 64)
            .endCell();
    }

    async sendMintVnstExternal(
        provider: ContractProvider,
        to: Address,
        usdt_amount: bigint,
        forward_ton_amount: bigint = toNano('0.05'),
        total_ton_amount: bigint = toNano('0.1')
    ) {
        await provider.external(JettonMinter.mintVnstMessage(to, total_ton_amount, forward_ton_amount, usdt_amount));
    }


    static redeemVnstMessageExternal(to: Address, total_ton_amount: bigint, forward_ton_amount: bigint, usdt_amount: bigint) {
        return beginCell()
            .storeUint(Op.redeem, 32)
            .storeAddress(to)
            .storeCoins(total_ton_amount)
            .storeCoins(forward_ton_amount)
            .storeUint(usdt_amount, 64)
            .endCell();
    }

    async sendRedeemVnstExternal(
        provider: ContractProvider,
        to: Address,
        usdt_amount: bigint,
        forward_ton_amount: bigint = toNano('0.05'),
        total_ton_amount: bigint = toNano('0.1')
    ) {
        await provider.external(JettonMinter.redeemVnstMessageExternal(to, total_ton_amount, forward_ton_amount, usdt_amount));
    }

    static redeemVnstMessage(total_ton_amount: bigint, forward_ton_amount: bigint, usdt_amount: bigint,) {
        return beginCell().storeUint(Op.redeem, 32).storeUint(0, 64)
            .storeCoins(total_ton_amount)
            .storeCoins(forward_ton_amount)
            .storeUint(usdt_amount, 128)
            .endCell();
    }

    async sendRedeemVnst(provider: ContractProvider,
        via: Sender,
        usdt_amount: bigint,
        forward_ton_amount: bigint = toNano('0.05'), total_ton_amount: bigint = toNano('0.1')) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.redeemVnstMessage(total_ton_amount, forward_ton_amount, usdt_amount),
            value: total_ton_amount,
        });
    }

    static redeemMaxLimitMessage(total_ton_amount: bigint, forward_ton_amount: bigint, vnst_amount: bigint,) {
        return beginCell().storeUint(Op.set_max_redeem_limit, 32).storeUint(0, 64)
            .storeCoins(total_ton_amount)
            .storeCoins(forward_ton_amount)
            .storeUint(vnst_amount, 32)
            .endCell();
    }

    async sendRedeemMaxlimitVnst(provider: ContractProvider,
        via: Sender,
        vnst_amount: bigint,
        forward_ton_amount: bigint = toNano('0.05'), total_ton_amount: bigint = toNano('0.1')) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.redeemMaxLimitMessage(total_ton_amount, forward_ton_amount, vnst_amount),
            value: total_ton_amount,
        });
    }

    static setUsdtJettonWalletMessage(total_ton_amount: bigint, forward_ton_amount: bigint, usdt_jetton_address: Address,) {
        return beginCell().storeUint(100000, 32).storeUint(0, 64)
            .storeAddress(usdt_jetton_address)
            .endCell();
    }

    async sendSetUsdtJettonAddress(provider: ContractProvider,
        via: Sender,
        usdt_jetton_address: Address,
        forward_ton_amount: bigint = toNano('0.05'), total_ton_amount: bigint = toNano('0.1')) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.setUsdtJettonWalletMessage(total_ton_amount, forward_ton_amount, usdt_jetton_address),
            value: total_ton_amount,
        });
    }

    static setMintFeeMessage(total_ton_amount: bigint, forward_ton_amount: bigint, mintFee: bigint,) {
        return beginCell().storeUint(Op.vnst73657420666566, 32).storeUint(0, 64)
            .storeUint(mintFee, 64)
            .endCell();
    }

    async sendTxSetMintFee(provider: ContractProvider,
        via: Sender,
        mintFee: bigint,
        forward_ton_amount: bigint = toNano('0.05'), total_ton_amount: bigint = toNano('0.1')) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.setMintFeeMessage(total_ton_amount, forward_ton_amount, mintFee),
            value: total_ton_amount,
        });
    }

    static sendWithdrawMessage(total_ton_amount: bigint, usdt: bigint,) {
        return beginCell().storeUint(100002, 32).storeUint(0, 64)
            .storeCoins(total_ton_amount)
            .storeUint(usdt, 256)
            .endCell();
    }

    async sendTxWithdraw(provider: ContractProvider,
        via: Sender,
        usdt: bigint,
        total_ton_amount: bigint = toNano('0.1')) {

        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.sendWithdrawMessage(total_ton_amount, usdt),
            value: total_ton_amount,
        });
    }

    static emergencyWithdrawMsg(total_ton_amount: bigint, usdt: bigint,) {
        return beginCell().storeUint(100001, 32).storeUint(0, 64)
            .storeCoins(total_ton_amount)
            .storeUint(usdt, 256)
            .endCell();
    }

    async sendTxEmergencyWithdraw(provider: ContractProvider,
        via: Sender,
        usdt: bigint,
        total_ton_amount: bigint = toNano('0.1')) {

        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.emergencyWithdrawMsg(total_ton_amount, usdt),
            value: total_ton_amount,
        });
    }

    static withdrawOperationPoolMsg(total_ton_amount: bigint,) {
        return beginCell().storeUint(100003, 32).storeUint(0, 64)
            .storeCoins(total_ton_amount)
            .endCell();
    }

    async sendTxwithdrawOperationPool(provider: ContractProvider,
        via: Sender,
        total_ton_amount: bigint = toNano('0.1')) {

        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.withdrawOperationPoolMsg(total_ton_amount),
            value: total_ton_amount,
        });
    }

    async getOperationPool(provider: ContractProvider): Promise<bigint> {
        let res = await provider.get('get_operation_pool', []);
        return res.stack.readBigNumber();
    }

    static setModeratorMessage(moderator: Address,) {
        return beginCell().storeUint(100004, 32).storeUint(0, 64)
            .storeAddress(moderator)
            .endCell();
    }

    async sendTxSetModerator(provider: ContractProvider,
        via: Sender,
        moderator: Address,
        total_ton_amount: bigint = toNano('0.1')) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.setModeratorMessage(moderator),
            value: total_ton_amount,
        });
    }

    static removeModeratorMessage(moderator: Address,) {
        return beginCell().storeUint(100005, 32).storeUint(0, 64)
            .storeAddress(moderator)
            .endCell();
    }

    async sendTxRemoveModerator(provider: ContractProvider,
        via: Sender,
        moderator: Address,
        total_ton_amount: bigint = toNano('0.1')) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.removeModeratorMessage(moderator),
            value: total_ton_amount,
        });
    }

    static tonWithdrawMsg(reverse_ton: bigint) {
        return beginCell()
            .storeUint(100007, 32)
            .storeUint(123, 64)
            .storeCoins(reverse_ton)
            .endCell();
    }

    async sendTxTonWithdraw(provider: ContractProvider,
        via: Sender,
        reverse_ton: bigint,
        total_ton_amount: bigint = toNano('0.01')) {

        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.tonWithdrawMsg(reverse_ton),
            value: total_ton_amount,
        });
    }


}
