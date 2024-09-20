import "dotenv/config"
import process from "process"
export const Config = {
    API_KEY: process.env.API_KEY as string,
    WALLET_MNEMONIC: process.env.WALLET_MNEMONIC as string,
    USDT_JETTON_WALLET_ADDRESS: process.env.USDT_JETTON_WALLET_ADDRESS as string,
    VNST_JETTON_WALLET_ADDRESS: process.env.VNST_JETTON_WALLET_ADDRESS as string,
    MODERATOR_ADDRESS: process.env.MODERATOR_ADDRESS as string,
    METADATA_URI: process.env.METADATA_URI as string,
}