import { Address, Cell, toNano } from '@ton/core';
import { JettonWallet } from '../wrappers/JettonWallet';
import { compile, NetworkProvider } from '@ton/blueprint';
import { Config } from '../config';

export async function run(provider: NetworkProvider) {
    const wallet = provider.open(JettonWallet.createFromAddress(Address.parse("")));
    const value = toNano('0.3');  // Số lượng TON để gửi cùng với giao dịch
    const jetton_amount = toNano("1");  // Số lượng Jetton cần chuyển 
    const to = Address.parse(Config.VNST_JETTON_WALLET_ADDRESS); // Địa chỉ người nhận
    const responseAddress = Address.parse(Config.OWNER_ADDRESS); // Địa chỉ phản hồi
    const customPayload = null;
    const forward_ton_amount = toNano('0.2'); // Số lượng TON forward
    const forwardPayload = null;

    await wallet.sendTransfer(provider.sender(), value, jetton_amount, to, responseAddress, customPayload, forward_ton_amount, forwardPayload);
}
