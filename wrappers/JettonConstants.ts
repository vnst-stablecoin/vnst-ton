export abstract class Op {
    static transfer = 0xf8a7ea5;
    static transfer_notification = 0x7362d09c;
    static internal_transfer = 0x178d4519;
    static excesses = 0xd53276db;
    static burn = 0x595f07bc;
    static burn_notification = 0x7bdd97de;

    static provide_wallet_address = 0x2c76b973;
    static take_wallet_address = 0xd1735400;
    static mint = 0x642b7d07;
    static change_admin = 0x6501f354;
    static claim_admin = 0xfb88e119;
    static upgrade = 0x2508d66a;
    static call_to = 0x235caf52;
    static top_up = 0xd372158c;
    static change_metadata_url = 0xcb862902;
    static set_status = 0xeed236d3;

    static mint_vnst = 0xa3b1f2c4;
    static vnst7265626f6f7420706f6f6c = 0x4e3d2c1b;
    static vnst53657420436f766572 = 0x6a7b8c9d;
    static vnst73657420666565 = 0xd2e3f4b1;
    static redeem = 0x5f9e8d7a;
    static set_max_mint_limit = 0x9b8a7c6d;
    static set_max_redeem_limit = 0x1e2f3a4b;
    static vnst73657420666566 = 0xc7d8e9fa;
    static set_max_limit_verified_user = 0xb4c5d6e7;
    static add_verified_user = 0x3a2b1c4d;
    static remove_verified_user = 0x6f7e8d9c;
    static vnst191671e7f585a3817f = 0xf1e2d3c4;
    static vnst5630dd9d602fe45ab7 = 0xa7b8c9d0;
    static emergency_withdraw = 100001;
    static withdraw_usdt = 100002;
    static withdraw_operation_pool = 100003;
}

export abstract class Errors {
    static invalid_op = 72;
    static wrong_op = 0xffff;
    static not_owner = 73;
    static not_valid_wallet = 74;
    static wrong_workchain = 333;

    static contract_locked = 45;
    static balance_error = 47;
    static not_enough_gas = 48;
    static invalid_mesage = 49;
    static discovery_fee_not_matched = 75;
}


