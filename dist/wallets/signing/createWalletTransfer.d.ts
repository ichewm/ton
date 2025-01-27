/**
 * Copyright (c) Whales Corp.
 * All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/// <reference types="node" />
import { MessageRelaxed } from "@ton/core";
import { Maybe } from "../../utils/maybe";
export declare function createWalletTransferV1(args: {
    seqno: number;
    sendMode: number;
    message: Maybe<MessageRelaxed>;
    secretKey: Buffer;
}): import("@ton/core").Cell;
export declare function createWalletTransferV2(args: {
    seqno: number;
    sendMode: number;
    messages: MessageRelaxed[];
    secretKey: Buffer;
    timeout?: Maybe<number>;
}): import("@ton/core").Cell;
export declare function createWalletTransferV3(args: {
    seqno: number;
    sendMode: number;
    walletId: number;
    messages: MessageRelaxed[];
    secretKey: Buffer;
    timeout?: Maybe<number>;
}): import("@ton/core").Cell;
export declare function createWalletTransferV4(args: {
    seqno: number;
    sendMode: number;
    walletId: number;
    messages: MessageRelaxed[];
    secretKey: Buffer;
    timeout?: Maybe<number>;
}): import("@ton/core").Cell;
