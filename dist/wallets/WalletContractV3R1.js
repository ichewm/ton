"use strict";
/**
 * Copyright (c) Whales Corp.
 * All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletContractV3R1 = void 0;
const core_1 = require("@ton/core");
const createWalletTransfer_1 = require("./signing/createWalletTransfer");
class WalletContractV3R1 {
    static create(args) {
        return new WalletContractV3R1(args.workchain, args.publicKey, args.walletId);
    }
    constructor(workchain, publicKey, walletId) {
        // Resolve parameters
        this.workchain = workchain;
        this.publicKey = publicKey;
        if (walletId !== null && walletId !== undefined) {
            this.walletId = walletId;
        }
        else {
            this.walletId = 698983191 + workchain;
        }
        // Build initial code and data
        let code = core_1.Cell.fromBoc(Buffer.from('te6cckEBAQEAYgAAwP8AIN0gggFMl7qXMO1E0NcLH+Ck8mCDCNcYINMf0x/TH/gjE7vyY+1E0NMf0x/T/9FRMrryoVFEuvKiBPkBVBBV+RDyo/gAkyDXSpbTB9QC+wDo0QGkyMsfyx/L/8ntVD++buA=', 'base64'))[0];
        let data = (0, core_1.beginCell)()
            .storeUint(0, 32) // Seqno
            .storeUint(this.walletId, 32)
            .storeBuffer(publicKey)
            .endCell();
        this.init = { code, data };
        this.address = (0, core_1.contractAddress)(workchain, { code, data });
    }
    /**
     * Get wallet balance
     */
    async getBalance(provider) {
        let state = await provider.getState();
        return state.balance;
    }
    /**
     * Get Wallet Seqno
     */
    async getSeqno(provider) {
        let state = await provider.getState();
        if (state.state.type === 'active') {
            let res = await provider.get('seqno', []);
            return res.stack.readNumber();
        }
        else {
            return 0;
        }
    }
    /**
     * Send signed transfer
     */
    async send(provider, message) {
        await provider.external(message);
    }
    /**
     * Sign and send transfer
     */
    async sendTransfer(provider, args) {
        let transfer = this.createTransfer(args);
        await this.send(provider, transfer);
    }
    /**
     * Create transfer
     */
    createTransfer(args) {
        let sendMode = core_1.SendMode.PAY_GAS_SEPARATELY;
        if (args.sendMode !== null && args.sendMode !== undefined) {
            sendMode = args.sendMode;
        }
        return (0, createWalletTransfer_1.createWalletTransferV3)({
            seqno: args.seqno,
            sendMode,
            secretKey: args.secretKey,
            messages: args.messages,
            timeout: args.timeout,
            walletId: this.walletId
        });
    }
    /**
     * Create sender
     */
    sender(provider, secretKey) {
        return {
            send: async (args) => {
                let seqno = await this.getSeqno(provider);
                let transfer = this.createTransfer({
                    seqno,
                    secretKey,
                    sendMode: args.sendMode,
                    messages: [(0, core_1.internal)({
                            to: args.to,
                            value: args.value,
                            init: args.init,
                            body: args.body,
                            bounce: args.bounce
                        })]
                });
                await this.send(provider, transfer);
            }
        };
    }
}
exports.WalletContractV3R1 = WalletContractV3R1;
