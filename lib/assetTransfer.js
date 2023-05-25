/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Deterministic JSON.stringify()
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {


    async createLand(ctx, surveryId, previousOwner, currentOwner, location, area, saleDeedAmount, documentHash) {
        // check if land already exists
        const exists = await this.landExists(ctx, surveryId);
        if (exists) {
            throw new Error(`The land ${surveryId} already exists`);
        }

        const land = {
            SurveryId: surveryId,
            PreviousOwner: previousOwner,
            CurrentOwner: currentOwner,
            Location: location,
            Area: area,
            SaleDeedAmount: saleDeedAmount,
            DocumentHash: documentHash
        };

        //  insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(surveryId, Buffer.from(stringify(sortKeysRecursive(land))));
        return JSON.stringify(land);

    }

    async landExists(ctx, surveryId) {
        const landJSON = await ctx.stub.getState(surveryId);
        return landJSON && landJSON.length > 0;
    }

    async readLand(ctx, surveryId) {
        const landJSON = await ctx.stub.getState(surveryId);
        if (!landJSON || landJSON.length === 0) {
            throw new Error(`The land ${surveryId} does not exist`);
        }
        return landJSON.toString();
    }

    async transferLand(ctx, surveryId, newOwner) {
        const landJSON = await ctx.stub.getState(surveryId);
        if (!landJSON || landJSON.length === 0) {
            throw new Error(`The land ${surveryId} does not exist`);
        }

        const land = JSON.parse(landJSON.toString());
        land.PreviousOwner = land.CurrentOwner;
        land.CurrentOwner = newOwner;
        await ctx.stub.putState(surveryId, Buffer.from(JSON.stringify(land)));
    }
}

module.exports = AssetTransfer;
