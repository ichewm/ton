"use strict";
/**
 * Copyright (c) Whales Corp.
 * All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _TonClient_api;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TonClient = void 0;
const HttpApi_1 = require("./api/HttpApi");
const core_1 = require("@ton/core");
class TonClient {
    constructor(parameters) {
        _TonClient_api.set(this, void 0);
        this.parameters = {
            endpoint: parameters.endpoint
        };
        __classPrivateFieldSet(this, _TonClient_api, new HttpApi_1.HttpApi(this.parameters.endpoint, {
            timeout: parameters.timeout,
            apiKey: parameters.apiKey,
            adapter: parameters.httpAdapter
        }), "f");
    }
    /**
     * Get Address Balance
     * @param address address for balance check
     * @returns balance
     */
    async getBalance(address) {
        return (await this.getContractState(address)).balance;
    }
    /**
     * Invoke get method
     * @param address contract address
     * @param name name of method
     * @param params optional parameters
     * @returns stack and gas_used field
     */
    async runMethod(address, name, stack = []) {
        let res = await __classPrivateFieldGet(this, _TonClient_api, "f").callGetMethod(address, name, stack);
        if (res.exit_code !== 0) {
            throw Error('Unable to execute get method. Got exit_code: ' + res.exit_code);
        }
        return { gas_used: res.gas_used, stack: parseStack(res.stack) };
    }
    /**
     * Invoke get method
     * @param address contract address
     * @param name name of method
     * @param params optional parameters
     * @returns stack and gas_used field
     * @deprecated use runMethod instead
     */
    async callGetMethod(address, name, stack = []) {
        return this.runMethod(address, name, stack);
    }
    /**
     * Invoke get method that returns error code instead of throwing error
     * @param address contract address
     * @param name name of method
     * @param params optional parameters
     * @returns stack and gas_used field
    */
    async runMethodWithError(address, name, params = []) {
        let res = await __classPrivateFieldGet(this, _TonClient_api, "f").callGetMethod(address, name, params);
        return { gas_used: res.gas_used, stack: parseStack(res.stack), exit_code: res.exit_code };
    }
    /**
     * Invoke get method that returns error code instead of throwing error
     * @param address contract address
     * @param name name of method
     * @param params optional parameters
     * @returns stack and gas_used field
     * @deprecated use runMethodWithError instead
     */
    async callGetMethodWithError(address, name, stack = []) {
        return this.runMethodWithError(address, name, stack);
    }
    /**
     * Get transactions
     * @param address address
     */
    async getTransactions(address, opts) {
        // Fetch transactions
        let tx = await __classPrivateFieldGet(this, _TonClient_api, "f").getTransactions(address, opts);
        let res = [];
        for (let r of tx) {
            res.push((0, core_1.loadTransaction)(core_1.Cell.fromBoc(Buffer.from(r.data, 'base64'))[0].beginParse()));
        }
        return res;
    }
    /**
     * Get transaction by it's id
     * @param address address
     * @param lt logical time
     * @param hash transaction hash
     * @returns transaction or null if not exist
     */
    async getTransaction(address, lt, hash) {
        let res = await __classPrivateFieldGet(this, _TonClient_api, "f").getTransaction(address, lt, hash);
        if (res) {
            return (0, core_1.loadTransaction)(core_1.Cell.fromBoc(Buffer.from(res.data, 'base64'))[0].beginParse());
        }
        else {
            return null;
        }
    }
    /**
     * Fetch latest masterchain info
     * @returns masterchain info
     */
    async getMasterchainInfo() {
        let r = await __classPrivateFieldGet(this, _TonClient_api, "f").getMasterchainInfo();
        return {
            workchain: r.init.workchain,
            shard: r.last.shard,
            initSeqno: r.init.seqno,
            latestSeqno: r.last.seqno
        };
    }
    /**
     * Fetch latest workchain shards
     * @param seqno masterchain seqno
     */
    async getWorkchainShards(seqno) {
        let r = await __classPrivateFieldGet(this, _TonClient_api, "f").getShards(seqno);
        return r.map((m) => ({
            workchain: m.workchain,
            shard: m.shard,
            seqno: m.seqno
        }));
    }
    /**
     * Fetch transactions inf shards
     * @param workchain
     * @param seqno
     * @param shard
     */
    async getShardTransactions(workchain, seqno, shard) {
        let tx = await __classPrivateFieldGet(this, _TonClient_api, "f").getBlockTransactions(workchain, seqno, shard);
        if (tx.incomplete) {
            throw Error('Unsupported');
        }
        return tx.transactions.map((v) => ({
            account: core_1.Address.parseRaw(v.account),
            lt: v.lt,
            hash: v.hash
        }));
    }
    /**
     * Send message to a network
     * @param src source message
     */
    async sendMessage(src) {
        const boc = (0, core_1.beginCell)()
            .store((0, core_1.storeMessage)(src))
            .endCell()
            .toBoc();
        await __classPrivateFieldGet(this, _TonClient_api, "f").sendBoc(boc);
    }
    /**
     * Send file to a network
     * @param src source file
     */
    async sendFile(src) {
        await __classPrivateFieldGet(this, _TonClient_api, "f").sendBoc(src);
    }
    /**
     * Estimate fees for external message
     * @param address target address
     * @returns
     */
    async estimateExternalMessageFee(address, args) {
        return await __classPrivateFieldGet(this, _TonClient_api, "f").estimateFee(address, { body: args.body, initCode: args.initCode, initData: args.initData, ignoreSignature: args.ignoreSignature });
    }
    /**
     * Send external message to contract
     * @param contract contract to send message
     * @param src message body
     */
    async sendExternalMessage(contract, src) {
        if (await this.isContractDeployed(contract.address) || !contract.init) {
            const message = (0, core_1.external)({
                to: contract.address,
                body: src
            });
            await this.sendMessage(message);
        }
        else {
            const message = (0, core_1.external)({
                to: contract.address,
                init: { code: contract.init.code, data: contract.init.data },
                body: src
            });
            await this.sendMessage(message);
        }
    }
    /**
     * Check if contract is deployed
     * @param address addres to check
     * @returns true if contract is in active state
     */
    async isContractDeployed(address) {
        return (await this.getContractState(address)).state === 'active';
    }
    /**
     * Resolves contract state
     * @param address contract address
     */
    async getContractState(address) {
        let info = await __classPrivateFieldGet(this, _TonClient_api, "f").getAddressInformation(address);
        let balance = BigInt(info.balance);
        let state = info.state;
        return {
            balance,
            state,
            code: info.code !== '' ? Buffer.from(info.code, 'base64') : null,
            data: info.data !== '' ? Buffer.from(info.data, 'base64') : null,
            lastTransaction: info.last_transaction_id.lt !== '0' ? {
                lt: info.last_transaction_id.lt,
                hash: info.last_transaction_id.hash,
            } : null,
            blockId: {
                workchain: info.block_id.workchain,
                shard: info.block_id.shard,
                seqno: info.block_id.seqno
            },
            timestampt: info.sync_utime
        };
    }
    /**
     * Open contract
     * @param src source contract
     * @returns contract
     */
    open(src) {
        return (0, core_1.openContract)(src, (args) => createProvider(this, args.address, args.init));
    }
    /**
     * Create a provider
     * @param address address
     * @param init optional init
     * @returns provider
     */
    provider(address, init) {
        return createProvider(this, address, init);
    }
}
exports.TonClient = TonClient;
_TonClient_api = new WeakMap();
function parseStackEntry(s) {
    switch (s["@type"]) {
        case "tvm.stackEntryNumber":
            return { type: 'int', value: BigInt(s.number.number) };
        case "tvm.stackEntryCell":
            try {
                if (s.cell["@type"] == "tvm.cell") {
                    return { type: 'cell', cell: core_1.Cell.fromBase64(s.cell.bytes) };
                }
            }
            catch (e) {
                //nothing
            }
            return { type: 'cell', cell: core_1.Cell.fromBase64(s.cell) };
        case 'tvm.stackEntryTuple':
            return { type: 'tuple', items: s.tuple.elements.map(parseStackEntry) };
        default:
            throw Error("Unsupported item type: " + s["@type"]);
    }
}
function parseStackItem(s) {
    if (s[0] === 'num') {
        let val = s[1];
        if (val.startsWith('-')) {
            return { type: 'int', value: -BigInt(val.slice(1)) };
        }
        else {
            return { type: 'int', value: BigInt(val) };
        }
    }
    else if (s[0] === 'null') {
        return { type: 'null' };
    }
    else if (s[0] === 'cell') {
        return { type: 'cell', cell: core_1.Cell.fromBoc(Buffer.from(s[1].bytes, 'base64'))[0] };
    }
    else if (s[0] === 'slice') {
        return { type: 'slice', cell: core_1.Cell.fromBoc(Buffer.from(s[1].bytes, 'base64'))[0] };
    }
    else if (s[0] === 'builder') {
        return { type: 'builder', cell: core_1.Cell.fromBoc(Buffer.from(s[1].bytes, 'base64'))[0] };
    }
    else if (s[0] === 'tuple' || s[0] === 'list') {
        // toncenter.com missbehaviour
        if (s[1].elements.length === 0) {
            return { type: 'null' };
        }
        return {
            type: s[0],
            items: s[1].elements.map(parseStackEntry)
        };
    }
    else {
        throw Error('Unsupported stack item type: ' + s[0]);
    }
}
function parseStack(src) {
    let stack = [];
    for (let s of src) {
        stack.push(parseStackItem(s));
    }
    return new core_1.TupleReader(stack);
}
function createProvider(client, address, init) {
    return {
        async getState() {
            let state = await client.getContractState(address);
            let balance = state.balance;
            let last = state.lastTransaction ? { lt: BigInt(state.lastTransaction.lt), hash: Buffer.from(state.lastTransaction.hash, 'base64') } : null;
            let storage;
            if (state.state === 'active') {
                storage = {
                    type: 'active',
                    code: state.code ? state.code : null,
                    data: state.data ? state.data : null,
                };
            }
            else if (state.state === 'uninitialized') {
                storage = {
                    type: 'uninit',
                };
            }
            else if (state.state === 'frozen') {
                storage = {
                    type: 'frozen',
                    stateHash: Buffer.alloc(0),
                };
            }
            else {
                throw Error('Unsupported state');
            }
            return {
                balance,
                last,
                state: storage,
            };
        },
        async get(name, args) {
            let method = await client.callGetMethod(address, name, args);
            return { stack: method.stack };
        },
        async external(message) {
            //
            // Resolve init
            //
            let neededInit = null;
            if (init && !await client.isContractDeployed(address)) {
                neededInit = init;
            }
            //
            // Send package
            //
            const ext = (0, core_1.external)({
                to: address,
                init: neededInit ? { code: neededInit.code, data: neededInit.data } : null,
                body: message
            });
            let boc = (0, core_1.beginCell)()
                .store((0, core_1.storeMessage)(ext))
                .endCell()
                .toBoc();
            await client.sendFile(boc);
        },
        async internal(via, message) {
            // Resolve init
            let neededInit = null;
            if (init && (!await client.isContractDeployed(address))) {
                neededInit = init;
            }
            // Resolve bounce
            let bounce = true;
            if (message.bounce !== null && message.bounce !== undefined) {
                bounce = message.bounce;
            }
            // Resolve value
            let value;
            if (typeof message.value === 'string') {
                value = (0, core_1.toNano)(message.value);
            }
            else {
                value = message.value;
            }
            // Resolve body
            let body = null;
            if (typeof message.body === 'string') {
                body = (0, core_1.comment)(message.body);
            }
            else if (message.body) {
                body = message.body;
            }
            // Send internal message
            await via.send({
                to: address,
                value,
                bounce,
                sendMode: message.sendMode,
                init: neededInit,
                body
            });
        }
    };
}
