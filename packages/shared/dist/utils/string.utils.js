"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeString = normalizeString;
exports.normalizeEmail = normalizeEmail;
exports.normalizeWardStakeName = normalizeWardStakeName;
/**
 * Normalize a string by trimming whitespace and converting to lowercase
 * @param value - The string to normalize
 * @returns The normalized string
 */
function normalizeString(value) {
    if (!value)
        return '';
    return value.trim().toLowerCase();
}
/**
 * Normalize an email address
 * @param email - The email to normalize
 * @returns The normalized email
 */
function normalizeEmail(email) {
    return normalizeString(email);
}
/**
 * Normalize a ward or stake name
 * @param name - The ward/stake name to normalize
 * @returns The normalized name
 */
function normalizeWardStakeName(name) {
    return normalizeString(name);
}
