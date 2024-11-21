import { Address, Cell, toNano } from '@ton/core';
import { JettonWallet } from '../wrappers/JettonWallet';
import { compile, NetworkProvider } from '@ton/blueprint';
import { Config } from '../config';

export async function run(provider: NetworkProvider) {
    const vnst_jetton_contract = provider.open(JettonWallet.createFromAddress(Address.parse(Config.VNST_JETTON_WALLET_ADDRESS)));

    const ownerAddress = Address.parse(Config.OWNER_ADDRESS);
    const jettonWallet = await vnst_jetton_contract.getWalletAddress(ownerAddress);

    const wallet = provider.open(JettonWallet.createFromAddress(jettonWallet));
    // const wallet = provider.open(JettonWallet.createFromAddress(Address.parse("kQCins8jcyNBxdaXGSP-k8rFdeC-WemRPNMcjNW4_7p91Bz-")));
    const value = toNano('0.2');  // Số lượng TON để gửi cùng với giao dịch
    const jetton_amount = toNano("5000");  // Số lượng Jetton cần chuyển 
    const to = Address.parse(Config.VNST_JETTON_WALLET_ADDRESS); // Địa chỉ người nhận
    const responseAddress = ownerAddress; // Địa chỉ phản hồi
    const customPayload = null;
    const forward_ton_amount = toNano('0.1'); // Số lượng TON forward
    const forwardPayload = null;
    // console.log(Address.parse("kQCffycw0m4l6-pT9iSciDvA3JF6A-2j8mi3eVWfaO3uEkhh"));

    await wallet.sendTransferRedeem(provider.sender(), value, jetton_amount, to, responseAddress, customPayload, forward_ton_amount, forwardPayload);
}
