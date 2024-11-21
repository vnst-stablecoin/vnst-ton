import { Address, toNano, Cell } from '@ton/core';
import { JettonMinter, createConfigCell, createManagementUser } from '../wrappers/JettonMinter';
import { compile, NetworkProvider } from '@ton/blueprint';
import { jettonWalletCodeFromLibrary } from "../wrappers/ui-utils";
import { Config } from '../config';
import fs from 'fs/promises';

export async function run(provider: NetworkProvider) {
    const compilePath = "build/JettonMinter.compiled.json";
    const minter = provider.open(JettonMinter.createFromAddress(Address.parse(Config.VNST_JETTON_WALLET_ADDRESS)));
    const newCode = await readCompileFile(compilePath);
    await minter.sendUpgrade(provider.sender(), newCode, toNano('0.01'));
}

async function readCompileFile(filePath: string): Promise<Cell> {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        if (!jsonData.hex) {
            throw new Error('Not exist compile.json');
        }
        const newCode = Cell.fromBoc(Buffer.from(jsonData.hex, 'hex'))[0];
        return newCode;
    } catch (error) {
        console.error(error);
        throw error;
    }
}