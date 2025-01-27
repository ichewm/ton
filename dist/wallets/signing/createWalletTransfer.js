"use strict";
/**
 * Copyright (c) Whales Corp.
 * All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWalletTransferV4 = exports.createWalletTransferV3 = exports.createWalletTransferV2 = exports.createWalletTransferV1 = void 0;
const core_1 = require("@ton/core");
const crypto_1 = require("@ton/crypto");
function createWalletTransferV1(args) {
    // Create message
    let signingMessage = (0, core_1.beginCell)()
        .storeUint(args.seqno, 32);
    if (args.message) {
        signingMessage.storeUint(args.sendMode, 8);
        signingMessage.storeRef((0, core_1.beginCell)().store((0, core_1.storeMessageRelaxed)(args.message)));
    }
    // Sign message
    let signature = (0, crypto_1.sign)(signingMessage.endCell().hash(), args.secretKey);
    // Body
    const body = (0, core_1.beginCell)()
        .storeBuffer(signature)
        .storeBuilder(signingMessage)
        .endCell();
    return body;
}
exports.createWalletTransferV1 = createWalletTransferV1;
function createWalletTransferV2(args) {
    // Check number of messages
    if (args.messages.length > 4) {
        throw Error("Maximum number of messages in a single transfer is 4");
    }
    // Create message
    let signingMessage = (0, core_1.beginCell)()
        .storeUint(args.seqno, 32);
    if (args.seqno === 0) {
        for (let i = 0; i < 32; i++) {
            signingMessage.storeBit(1);
        }
    }
    else {
        signingMessage.storeUint(args.timeout || Math.floor(Date.now() / 1e3) + 60, 32); // Default timeout: 60 seconds
    }
    for (let m of args.messages) {
        signingMessage.storeUint(args.sendMode, 8);
        signingMessage.storeRef((0, core_1.beginCell)().store((0, core_1.storeMessageRelaxed)(m)));
    }
    // Sign message
    let signature = (0, crypto_1.sign)(signingMessage.endCell().hash(), args.secretKey);
    // Body
    const body = (0, core_1.beginCell)()
        .storeBuffer(signature)
        .storeBuilder(signingMessage)
        .endCell();
    return body;
}
exports.createWalletTransferV2 = createWalletTransferV2;
function createWalletTransferV3(args) {
    // Check number of messages
    if (args.messages.length > 4) {
        throw Error("Maximum number of messages in a single transfer is 4");
    }
    // Create message to sign
    let signingMessage = (0, core_1.beginCell)()
        .storeUint(args.walletId, 32);
    if (args.seqno === 0) {
        for (let i = 0; i < 32; i++) {
            signingMessage.storeBit(1);
        }
    }
    else {
        signingMessage.storeUint(args.timeout || Math.floor(Date.now() / 1e3) + 60, 32); // Default timeout: 60 seconds
    }
    signingMessage.storeUint(args.seqno, 32);
    for (let m of args.messages) {
        signingMessage.storeUint(args.sendMode, 8);
        signingMessage.storeRef((0, core_1.beginCell)().store((0, core_1.storeMessageRelaxed)(m)));
    }
    // Sign message
    let signature = (0, crypto_1.sign)(signingMessage.endCell().hash(), args.secretKey);
    // Body
    const body = (0, core_1.beginCell)()
        .storeBuffer(signature)
        .storeBuilder(signingMessage)
        .endCell();
    return body;
}
exports.createWalletTransferV3 = createWalletTransferV3;
function createWalletTransferV4(args) {
    // Check number of messages
    if (args.messages.length > 4) {
        throw Error("Maximum number of messages in a single transfer is 4");
    }
    let signingMessage = (0, core_1.beginCell)()
        .storeUint(args.walletId, 32);
    if (args.seqno === 0) {
        for (let i = 0; i < 32; i++) {
            signingMessage.storeBit(1);
        }
    }
    else {
        signingMessage.storeUint(args.timeout || Math.floor(Date.now() / 1e3) + 60, 32); // Default timeout: 60 seconds
    }
    signingMessage.storeUint(args.seqno, 32);
    signingMessage.storeUint(0, 8); // Simple order
    for (let m of args.messages) {
        signingMessage.storeUint(args.sendMode, 8);
        signingMessage.storeRef((0, core_1.beginCell)().store((0, core_1.storeMessageRelaxed)(m)));
    }
    // Sign message
    let signature = (0, crypto_1.sign)(signingMessage.endCell().hash(), args.secretKey);
    // Body
    const body = (0, core_1.beginCell)()
        .storeBuffer(signature)
        .storeBuilder(signingMessage)
        .endCell();
    return body;
}
exports.createWalletTransferV4 = createWalletTransferV4;
