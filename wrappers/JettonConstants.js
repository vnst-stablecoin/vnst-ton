"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = exports.Op = void 0;
var Op = /** @class */ (function () {
    function Op() {
    }
    Op.transfer = 0xf8a7ea5;
    Op.transfer_notification = 0x7362d09c;
    Op.internal_transfer = 0x178d4519;
    Op.excesses = 0xd53276db;
    Op.burn = 0x595f07bc;
    Op.burn_notification = 0x7bdd97de;
    Op.provide_wallet_address = 0x2c76b973;
    Op.take_wallet_address = 0xd1735400;
    Op.mint = 0x642b7d07;
    Op.change_admin = 0x6501f354;
    Op.claim_admin = 0xfb88e119;
    Op.upgrade = 0x2508d66a;
    Op.call_to = 0x235caf52;
    Op.top_up = 0xd372158c;
    Op.change_metadata_url = 0xcb862902;
    Op.set_status = 0xeed236d3;
    Op.mint_vnst = 0xa3b1f2c4;
    Op.vnst7265626f6f7420706f6f6c = 0x4e3d2c1b;
    Op.vnst53657420436f766572 = 0x6a7b8c9d;
    Op.vnst73657420666565 = 0xd2e3f4b1;
    Op.redeem = 0x5f9e8d7a;
    Op.set_max_mint_limit = 0x9b8a7c6d;
    Op.set_max_redeem_limit = 0x1e2f3a4b;
    Op.vnst73657420666566 = 0xc7d8e9fa;
    Op.set_max_limit_verified_user = 0xb4c5d6e7;
    Op.add_verified_user = 0x3a2b1c4d;
    Op.remove_verified_user = 0x6f7e8d9c;
    Op.vnst191671e7f585a3817f = 0xf1e2d3c4;
    Op.vnst5630dd9d602fe45ab7 = 0xa7b8c9d0;
    Op.add_user = 0xf038d1fd;
    Op.delete_user = 0xa1ccee7b;
    Op.check_user = 0xcdf2192f;
    return Op;
}());
exports.Op = Op;
var Errors = /** @class */ (function () {
    function Errors() {
    }
    Errors.invalid_op = 72;
    Errors.wrong_op = 0xffff;
    Errors.not_owner = 73;
    Errors.not_valid_wallet = 74;
    Errors.wrong_workchain = 333;
    Errors.contract_locked = 45;
    Errors.balance_error = 47;
    Errors.not_enough_gas = 48;
    Errors.invalid_mesage = 49;
    Errors.discovery_fee_not_matched = 75;
    Errors.user_already_exists = 99;
    Errors.user_not_found = 100;
    return Errors;
}());
exports.Errors = Errors;
