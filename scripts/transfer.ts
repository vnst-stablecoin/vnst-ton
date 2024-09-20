import { Address, Cell, toNano } from '@ton/core';
import { JettonWallet } from '../wrappers/JettonWallet';
import { compile, NetworkProvider } from '@ton/blueprint';
import { Config } from '../Config';

export async function run(provider: NetworkProvider) {
    const wallet = provider.open(JettonWallet.createFromAddress(Address.parse("kQC00k8sdYvcxLCsKZTCB3VZ6M-Uo49Us6s7mHN6ImVBT8Ah")));
    // const wallet = provider.open(JettonWallet.createFromAddress(Address.parse("kQCins8jcyNBxdaXGSP-k8rFdeC-WemRPNMcjNW4_7p91Bz-")));
    const value = toNano('0.3');  // Số lượng TON để gửi cùng với giao dịch
    const jetton_amount = toNano("2");  // Số lượng Jetton cần chuyển 
    const to = Address.parse(Config.VNST_JETTON_WALLET_ADDRESS); // Địa chỉ người nhận
    const responseAddress = Address.parse("0QDH_lBBtP0HABAuA9V23YBhvwCowwHW1Pss2BK_6DGPLhIX"); // Địa chỉ phản hồi
    const customPayload = null;
    const forward_ton_amount = toNano('0.2'); // Số lượng TON forward
    const forwardPayload = null;
    // console.log(Address.parse("kQCffycw0m4l6-pT9iSciDvA3JF6A-2j8mi3eVWfaO3uEkhh"));

    await wallet.sendTransfer(provider.sender(), value, jetton_amount, to, responseAddress, customPayload, forward_ton_amount, forwardPayload);
}
