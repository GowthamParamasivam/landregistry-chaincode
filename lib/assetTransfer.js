'use strict';

// Deterministic JSON.stringify()
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    async createLand(ctx, siteId, surveryId, previousOwnerName, previousOwnerAadhar, previousOwnerPan, currentOwnerName, CurrentOwnerAadhar, CurrentOwnerPan, siteAddress, latitude, longitude, area, length, breadth, documentHash) {
        // check if land already exists
        const exists = await this.landExists(ctx, surveryId);
        if (exists) {
            throw new Error(`The land ${surveryId} already exists`);
        }
        const land = {
            SiteId: siteId,
            SurveryId: surveryId,
            PreviousOwnerName: previousOwnerName,
            PreviousOwnerAadhar: previousOwnerAadhar,
            PreviousOwnerPan: previousOwnerPan,
            CurrentOwnerName: currentOwnerName,
            CurrentOwnerAadhar: CurrentOwnerAadhar,
            CurrentOwnerPan: CurrentOwnerPan,
            SiteAddress: siteAddress,
            Latitude: latitude,
            Longitude: longitude,
            Area: area,
            Length: length,
            Breadth: breadth,
            DocumentHash: documentHash
        };
        //  insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(siteId, Buffer.from(stringify(sortKeysRecursive(land))));
        return JSON.stringify(land);
    }

    async landExists(ctx, siteId) {
        const landJSON = await ctx.stub.getState(siteId);
        return landJSON && landJSON.length > 0;
    }

    async readLand(ctx, siteId) {
        const landJSON = await ctx.stub.getState(siteId);
        if (!landJSON || landJSON.length === 0) {
            throw new Error(`The land ${siteId} does not exist`);
        }
        return landJSON.toString();
    }

    async transferLand(ctx, siteId, newOwnerName, newOwnerAadhar, newOwnerPan) {
        const landJSON = await ctx.stub.getState(siteId);
        if (!landJSON || landJSON.length === 0) {
            throw new Error(`The land ${siteId} does not exist`);
        }
        const land = JSON.parse(landJSON.toString());
        land.previousOwnerName = land.currentOwnerName;
        land.previousOwnerAadhar = land.currentOwnerAadhar;
        land.previousOwnerPan = land.currentOwnerPan;
        land.CurrentOwnerName = newOwnerName;
        land.CurrentOwnerAadhar = newOwnerAadhar;
        land.CurrentOwnerPan = newOwnerPan;
        await ctx.stub.putState(siteId, Buffer.from(JSON.stringify(land)));
    }

    async getAllLands(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    async GetQueryResultForQueryString(ctx, queryString) {
        const allResults = [];
        const resultsIterator = await ctx.stub.getQueryResult(queryString);
        let result = await resultsIterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await resultsIterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = AssetTransfer;
