const merge = require('merge');
const tsPreset = require('ts-jest/jest-preset');
const mongoPreset = require('@shelf/jest-mongodb/jest-preset');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = merge.recursive(tsPreset, mongoPreset, {
    globals: {
        testEnvironment: 'node',   
    }
});