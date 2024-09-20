const { Cell, beginCell } = require("@ton/core");
const { TonClient, WalletContractV4, toNano, Address } = require("@ton/ton");
const { mnemonicToPrivateKey } = require("@ton/crypto");

const client = new TonClient({
  endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
  apiKey: "9b0de19ebd00390e021a2fbe1909967a1bf84c2bb177eff14aa7ffb79e35a645",
});

const contractAddress = Address.parse("kQDOFd6Eq8Y7f2xof8Y_FFB5mY2C_4ZvyO7gBjvz9MosefL-");
const mnemonics = [
  "glare",
  "lumber",
  "hire",
  "gasp",
  "develop",
  "file",
  "unfair",
  "matter",
  "noble",
  "ten",
  "long",
  "swim",
  "opinion",
  "lobster",
  "despair",
  "input",
  "mobile",
  "ensure",
  "drip",
  "deposit",
  "plunge",
  "erase",
  "elevator",
  "drip",
];

async function getMarketPrice() {
  const result = await client.runMethod(contractAddress, "get_market_price");

  console.log(Number(result.stack.readBigNumber()));
}
async function get_operation_pool() {
  const result = await client.runMethod(contractAddress, "get_operation_pool");
  console.log(Number(result.stack.readBigNumber()));
}
async function get_jetton_usdt_address() {
  const result = await client.runMethod(contractAddress, "get_jetton_usdt_address");
  const data = {
    usdt_address: result.stack.readCell(),
  };
  console.log("Jetton Data:", data.usdt_address.beginParse().loadAddress());
}
// get_jetton_usdt_address();

async function getMarketPrice2() {
  const result = await client.runMethod(contractAddress, "version");
  const cellItem = result.stack;
  console.log(cellItem.readString());
}
getMarketPrice2();
async function getPrice() {
  const result = await client.runMethod(contractAddress, "get_price_data");
  const data = {
    market_price: Number(result.stack.readBigNumber()),
    redeem_covered_price: Number(result.stack.readBigNumber()),
    mint_covered_price: Number(result.stack.readBigNumber()),
    redeem_covered_amount: Number(result.stack.readBigNumber()),
    mint_covered_amount: Number(result.stack.readBigNumber()),
  };
  console.log(data);
}

async function getLimit() {
  const result = await client.runMethod(contractAddress, "get_limit_data");
  const data = {
    min_redeem_limit: Number(result.stack.readBigNumber()),
    max_redeem_limit: Number(result.stack.readBigNumber()),
    min_mint_limit: Number(result.stack.readBigNumber()),
    max_mint_limit: Number(result.stack.readBigNumber()),
  };
  console.log(data);
}

async function getFeeAndStatus() {
  const result = await client.runMethod(contractAddress, "get_market_price");
  const data = {
    redeem_fee: Number(result.stack.readBigNumber()),
    // mint_fee: Number(result.stack.readBigNumber()),
    // mint_status: Number(result.stack.readBigNumber()), // 1: true, 0: false
    // redeem_status: Number(result.stack.readBigNumber()), // 1: true, 0: false
  };
  console.log(data);
}
async function getCode() {
  try {
    // Fetch the result from the contract method
    const result = await client.runMethod(contractAddress, "get_jetton_data");

    // Extract the stack from the result
    const stack = result.stack;

    // Read and parse the data from the stack
    const totalSup = Number(stack.readBigNumber()); // Read total_supply as BigNumber
    const someIntValue = Number(stack.readBigNumber()); // Read the second int value (could be a status flag or similar)
    const adminSlice = stack.readCell(); // Read admin_address as Slice
    const metadataUri = stack.readCell(); // Read jetton_wallet_code as Cell
    const jettonWalletCode = stack.readCell(); // Read metadata_uri as Cell

    // Convert slices to strings if necessary
    const adminAddress = adminSlice.toString(); // Convert Slice to string

    // Log the parsed data
    console.log({
      total_sup: totalSup,
      some_int_value: someIntValue,
      admin: adminAddress,
      jetton_wallet_code: jettonWalletCode.toString(), // Optionally convert Cell to string for display
      metadata_uri: metadataUri.toString(), // Optionally convert Cell to string for display
    });
  } catch (error) {
    console.error("Error fetching jetton data:", error.message);
  }
}

async function getJettonAddress() {
  const ownerAddressString = "kQDbC6pOmDEcuihldTCmInfUv57dIRCVzt3NZFiH6f_IDBel";
  const ownerAddress = Address.parse(ownerAddressString);
  const ownerAddressCell = beginCell().storeAddress(ownerAddress).endCell();
  const tupleItem = [
    {
      type: "slice",
      cell: ownerAddressCell,
    },
  ];
  const result = await client.runMethod(contractAddress, "get_wallet_address", tupleItem);

  const walletAddressSlice = result.stack.readCell();
  const walletAddress = walletAddressSlice.beginParse().loadAddress();

  console.log(`Wallet Address for owner=====: ${walletAddress.toString()}`);
  return walletAddress;
}
getJettonAddress();
async function checkAddress() {
  const ownerAddressString = "0QDH_lBBtP0HABAuA9V23YBhvwCowwHW1Pss2BK_6DGPLhIX";
  const ownerAddress = Address.parse(ownerAddressString);
  const ownerAddressCell = beginCell().storeAddress(ownerAddress).endCell();
  const tupleItem = [
    {
      type: "slice",
      cell: ownerAddressCell,
    },
  ];
  const result = await client.runMethod(contractAddress, "is_verified_user", tupleItem);

  const status = result.stack.readBigNumber();

  console.log(`Wallet ${status}`);
}

async function get() {
  try {
    const result = await client.runMethod(contractAddress, "get_jetton_data");

    // Đảm bảo rằng bạn đọc các giá trị từ stack theo đúng thứ tự như trong FunC code
    const data = {
      total_supply: result.stack.readBigNumber(), // Đọc tổng cung từ stack
      mintable: result.stack.readBigNumber(), // Đọc tổng cung từ stack
      admin_address: result.stack.readCell(), // Đọc địa chỉ quản trị viên (admin_address)
      metadata_uri: result.stack.readCell(), // Đọc metadata_uri từ stack
      jetton_wallet_code: result.stack.readCell(), // Đọc jetton_wallet_code từ stack
    };

    console.log("Jetton Data:", data.admin_address.beginParse().loadAddress());
  } catch (error) {
    console.error("Failed to get jetton data:", error);
  }
}
async function getTx() {
  try {
    const result = await client.getTransactions("kQDOFd6Eq8Y7f2xof8Y_FFB5mY2C_4ZvyO7gBjvz9MosefL-", { limit: 2 });

    console.log(result[0]);
  } catch (error) {
    console.error("Failed to get jetton data:", error);
  }
}

async function getDataWl() {
  try {
    const result = await client.runMethod(Address.parse("0QDH_lBBtP0HABAuA9V23YBhvwCowwHW1Pss2BK_6DGPLhIX"), "get_wallet_data");

    console.log(result);
  } catch (error) {
    console.error("Failed to get jetton data:", error);
  }
}
