(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define('qrcode', ['exports'], factory) :
    (global = global || self, factory(global.QRCode = {}));
}(this, function (exports) { 'use strict';

    /**
     * @module Mode
     * @author nuintun
     * @author Cosmo Wolfe
     * @author Kazuhiko Arase
     */

    (function (Mode) {
        Mode[Mode["Terminator"] = 0] = "Terminator";
        Mode[Mode["Numeric"] = 1] = "Numeric";
        Mode[Mode["Alphanumeric"] = 2] = "Alphanumeric";
        Mode[Mode["StructuredAppend"] = 3] = "StructuredAppend";
        Mode[Mode["Byte"] = 4] = "Byte";
        Mode[Mode["Kanji"] = 8] = "Kanji";
        Mode[Mode["ECI"] = 7] = "ECI";
        // FNC1FirstPosition = 0x5,
        // FNC1SecondPosition = 0x9
    })(exports.Mode || (exports.Mode = {}));

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    /**
     * @module QRData
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var QRData = /*#__PURE__*/ (function () {
        function QRData(mode, data) {
            this.mode = mode;
            this.data = data;
        }
        QRData.prototype.getMode = function () {
            return this.mode;
        };
        QRData.prototype.getLengthInBits = function (version) {
            var mode = this.mode;
            var error = "illegal mode: " + mode;
            if (1 <= version && version < 10) {
                // 1 - 9
                switch (mode) {
                    case exports.Mode.Numeric:
                        return 10;
                    case exports.Mode.Alphanumeric:
                        return 9;
                    case exports.Mode.Byte:
                        return 8;
                    case exports.Mode.Kanji:
                        return 8;
                    default:
                        throw error;
                }
            }
            else if (version < 27) {
                // 10 - 26
                switch (mode) {
                    case exports.Mode.Numeric:
                        return 12;
                    case exports.Mode.Alphanumeric:
                        return 11;
                    case exports.Mode.Byte:
                        return 16;
                    case exports.Mode.Kanji:
                        return 10;
                    default:
                        throw error;
                }
            }
            else if (version < 41) {
                // 27 - 40
                switch (mode) {
                    case exports.Mode.Numeric:
                        return 14;
                    case exports.Mode.Alphanumeric:
                        return 13;
                    case exports.Mode.Byte:
                        return 16;
                    case exports.Mode.Kanji:
                        return 12;
                    default:
                        throw error;
                }
            }
            else {
                throw "illegal version: " + version;
            }
        };
        return QRData;
    }());

    /**
     * @module UTF8
     * @author nuintun
     */
    /**
     * @function UTF8
     * @param {string} str
     * @returns {number[]}
     * @see https://github.com/google/closure-library/blob/master/closure/goog/crypt/crypt.js
     */
    function UTF8(str) {
        var pos = 0;
        var bytes = [];
        var length = str.length;
        for (var i = 0; i < length; i++) {
            var code = str.charCodeAt(i);
            if (code < 128) {
                bytes[pos++] = code;
            }
            else if (code < 2048) {
                bytes[pos++] = (code >> 6) | 192;
                bytes[pos++] = (code & 63) | 128;
            }
            else if ((code & 0xfc00) === 0xd800 && i + 1 < length && (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
                // Surrogate Pair
                code = 0x10000 + ((code & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
                bytes[pos++] = (code >> 18) | 240;
                bytes[pos++] = ((code >> 12) & 63) | 128;
                bytes[pos++] = ((code >> 6) & 63) | 128;
                bytes[pos++] = (code & 63) | 128;
            }
            else {
                bytes[pos++] = (code >> 12) | 224;
                bytes[pos++] = ((code >> 6) & 63) | 128;
                bytes[pos++] = (code & 63) | 128;
            }
        }
        return bytes;
    }

    /**
     * @module QR8BitByte
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var QRByte = /*#__PURE__*/ (function (_super) {
        __extends(QRByte, _super);
        /**
         * @constructor
         * @param {string} data
         */
        function QRByte(data, encode) {
            var _this = _super.call(this, exports.Mode.Byte, data) || this;
            _this.encoding = -1;
            if (typeof encode === 'function') {
                var _a = encode(data), encoding = _a.encoding, bytes = _a.bytes;
                _this.bytes = bytes;
                _this.encoding = encoding;
            }
            else {
                _this.bytes = UTF8(data);
                _this.encoding = 26 /* UTF8 */;
            }
            return _this;
        }
        /**
         * @public
         * @method write
         * @param {BitBuffer} buffer
         */
        QRByte.prototype.write = function (buffer) {
            var bytes = this.bytes;
            var length = bytes.length;
            for (var i = 0; i < length; i++) {
                buffer.put(bytes[i], 8);
            }
        };
        /**
         * @public
         * @method getLength
         * @returns {number}
         */
        QRByte.prototype.getLength = function () {
            return this.bytes.length;
        };
        return QRByte;
    }(QRData));

    /**
     * @module ErrorCorrectionLevel
     * @author nuintun
     * @author Cosmo Wolfe
     * @author Kazuhiko Arase
     */
    /**
     * @readonly
     * @enum {L, M, Q, H}
     */

    (function (ErrorCorrectionLevel) {
        // 7%
        ErrorCorrectionLevel[ErrorCorrectionLevel["L"] = 1] = "L";
        // 15%
        ErrorCorrectionLevel[ErrorCorrectionLevel["M"] = 0] = "M";
        // 25%
        ErrorCorrectionLevel[ErrorCorrectionLevel["Q"] = 3] = "Q";
        // 30%
        ErrorCorrectionLevel[ErrorCorrectionLevel["H"] = 2] = "H";
    })(exports.ErrorCorrectionLevel || (exports.ErrorCorrectionLevel = {}));

    /**
     * @module QRMath
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var EXP_TABLE = [];
    var LOG_TABLE = [];
    for (var i = 0; i < 256; i++) {
        LOG_TABLE[i] = 0;
        EXP_TABLE[i] = i < 8 ? 1 << i : EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i++) {
        LOG_TABLE[EXP_TABLE[i]] = i;
    }
    function glog(n) {
        if (n < 1) {
            throw "illegal log: " + n;
        }
        return LOG_TABLE[n];
    }
    function gexp(n) {
        while (n < 0) {
            n += 255;
        }
        while (n >= 256) {
            n -= 255;
        }
        return EXP_TABLE[n];
    }

    /**
     * @module Polynomial
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var Polynomial = /*#__PURE__*/ (function () {
        function Polynomial(num, shift) {
            if (shift === void 0) { shift = 0; }
            this.num = [];
            var offset = 0;
            var length = num.length;
            while (offset < length && num[offset] === 0) {
                offset++;
            }
            length -= offset;
            for (var i = 0; i < length; i++) {
                this.num.push(num[offset + i]);
            }
            for (var i = 0; i < shift; i++) {
                this.num.push(0);
            }
        }
        Polynomial.prototype.getAt = function (index) {
            return this.num[index];
        };
        Polynomial.prototype.getLength = function () {
            return this.num.length;
        };
        Polynomial.prototype.multiply = function (e) {
            var num = [];
            var eLength = e.getLength();
            var tLength = this.getLength();
            var dLength = tLength + eLength - 1;
            for (var i = 0; i < dLength; i++) {
                num.push(0);
            }
            for (var i = 0; i < tLength; i++) {
                for (var j = 0; j < eLength; j++) {
                    num[i + j] ^= gexp(glog(this.getAt(i)) + glog(e.getAt(j)));
                }
            }
            return new Polynomial(num);
        };
        Polynomial.prototype.mod = function (e) {
            var eLength = e.getLength();
            var tLength = this.getLength();
            if (tLength - eLength < 0) {
                return this;
            }
            var ratio = glog(this.getAt(0)) - glog(e.getAt(0));
            // Create copy
            var num = [];
            for (var i = 0; i < tLength; i++) {
                num.push(this.getAt(i));
            }
            // Subtract and calc rest.
            for (var i = 0; i < eLength; i++) {
                num[i] ^= gexp(glog(e.getAt(i)) + ratio);
            }
            // Call recursively
            return new Polynomial(num).mod(e);
        };
        return Polynomial;
    }());

    /**
     * @module QRUtil
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var N1 = 3;
    var N2 = 3;
    var N3 = 40;
    var N4 = 10;
    var ALIGNMENT_PATTERN_TABLE = [
        [],
        [6, 18],
        [6, 22],
        [6, 26],
        [6, 30],
        [6, 34],
        [6, 22, 38],
        [6, 24, 42],
        [6, 26, 46],
        [6, 28, 50],
        [6, 30, 54],
        [6, 32, 58],
        [6, 34, 62],
        [6, 26, 46, 66],
        [6, 26, 48, 70],
        [6, 26, 50, 74],
        [6, 30, 54, 78],
        [6, 30, 56, 82],
        [6, 30, 58, 86],
        [6, 34, 62, 90],
        [6, 28, 50, 72, 94],
        [6, 26, 50, 74, 98],
        [6, 30, 54, 78, 102],
        [6, 28, 54, 80, 106],
        [6, 32, 58, 84, 110],
        [6, 30, 58, 86, 114],
        [6, 34, 62, 90, 118],
        [6, 26, 50, 74, 98, 122],
        [6, 30, 54, 78, 102, 126],
        [6, 26, 52, 78, 104, 130],
        [6, 30, 56, 82, 108, 134],
        [6, 34, 60, 86, 112, 138],
        [6, 30, 58, 86, 114, 142],
        [6, 34, 62, 90, 118, 146],
        [6, 30, 54, 78, 102, 126, 150],
        [6, 24, 50, 76, 102, 128, 154],
        [6, 28, 54, 80, 106, 132, 158],
        [6, 32, 58, 84, 110, 136, 162],
        [6, 26, 54, 82, 110, 138, 166],
        [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    function getAlignmentPattern(version) {
        return ALIGNMENT_PATTERN_TABLE[version - 1];
    }
    function getErrorCorrectionPolynomial(errorCorrectionLength) {
        var e = new Polynomial([1]);
        for (var i = 0; i < errorCorrectionLength; i++) {
            e = e.multiply(new Polynomial([1, gexp(i)]));
        }
        return e;
    }
    function getBCHDigit(data) {
        var digit = 0;
        while (data !== 0) {
            digit++;
            data >>>= 1;
        }
        return digit;
    }
    var G18_BCH = getBCHDigit(G18);
    function getBCHVersion(data) {
        var offset = data << 12;
        while (getBCHDigit(offset) - G18_BCH >= 0) {
            offset ^= G18 << (getBCHDigit(offset) - G18_BCH);
        }
        return (data << 12) | offset;
    }
    var G15_BCH = getBCHDigit(G15);
    function getBCHVersionInfo(data) {
        var offset = data << 10;
        while (getBCHDigit(offset) - G15_BCH >= 0) {
            offset ^= G15 << (getBCHDigit(offset) - G15_BCH);
        }
        return ((data << 10) | offset) ^ G15_MASK;
    }
    function applyMaskPenaltyRule1Internal(qrcode, isHorizontal) {
        var penalty = 0;
        var moduleCount = qrcode.getModuleCount();
        for (var i = 0; i < moduleCount; i++) {
            var prevBit = null;
            var numSameBitCells = 0;
            for (var j = 0; j < moduleCount; j++) {
                var bit = isHorizontal ? qrcode.isDark(i, j) : qrcode.isDark(j, i);
                if (bit === prevBit) {
                    numSameBitCells++;
                    if (numSameBitCells === 5) {
                        penalty += N1;
                    }
                    else if (numSameBitCells > 5) {
                        penalty++;
                    }
                }
                else {
                    // set prev bit
                    prevBit = bit;
                    // include the cell itself
                    numSameBitCells = 1;
                }
            }
        }
        return penalty;
    }
    function applyMaskPenaltyRule1(qrcode) {
        return applyMaskPenaltyRule1Internal(qrcode, true) + applyMaskPenaltyRule1Internal(qrcode, false);
    }
    function applyMaskPenaltyRule2(qrcode) {
        var penalty = 0;
        var moduleCount = qrcode.getModuleCount();
        for (var y = 0; y < moduleCount - 1; y++) {
            for (var x = 0; x < moduleCount - 1; x++) {
                var value = qrcode.isDark(y, x);
                if (value === qrcode.isDark(y, x + 1) && value === qrcode.isDark(y + 1, x) && value === qrcode.isDark(y + 1, x + 1)) {
                    penalty += N2;
                }
            }
        }
        return penalty;
    }
    function isFourWhite(qrcode, rangeIndex, from, to, isHorizontal) {
        from = Math.max(from, 0);
        to = Math.min(to, qrcode.getModuleCount());
        for (var i = from; i < to; i++) {
            var value = isHorizontal ? qrcode.isDark(rangeIndex, i) : qrcode.isDark(i, rangeIndex);
            if (value) {
                return false;
            }
        }
        return true;
    }
    function applyMaskPenaltyRule3(qrcode) {
        var penalty = 0;
        var moduleCount = qrcode.getModuleCount();
        for (var y = 0; y < moduleCount; y++) {
            for (var x = 0; x < moduleCount; x++) {
                if (x + 6 < moduleCount &&
                    qrcode.isDark(y, x) &&
                    !qrcode.isDark(y, x + 1) &&
                    qrcode.isDark(y, x + 2) &&
                    qrcode.isDark(y, x + 3) &&
                    qrcode.isDark(y, x + 4) &&
                    !qrcode.isDark(y, x + 5) &&
                    qrcode.isDark(y, x + 6) &&
                    (isFourWhite(qrcode, y, x - 4, x, true) || isFourWhite(qrcode, y, x + 7, x + 11, true))) {
                    penalty += N3;
                }
                if (y + 6 < moduleCount &&
                    qrcode.isDark(y, x) &&
                    !qrcode.isDark(y + 1, x) &&
                    qrcode.isDark(y + 2, x) &&
                    qrcode.isDark(y + 3, x) &&
                    qrcode.isDark(y + 4, x) &&
                    !qrcode.isDark(y + 5, x) &&
                    qrcode.isDark(y + 6, x) &&
                    (isFourWhite(qrcode, x, y - 4, y, false) || isFourWhite(qrcode, x, y + 7, y + 11, false))) {
                    penalty += N3;
                }
            }
        }
        return penalty;
    }
    function applyMaskPenaltyRule4(qrcode) {
        var numDarkCells = 0;
        var moduleCount = qrcode.getModuleCount();
        for (var y = 0; y < moduleCount; y++) {
            for (var x = 0; x < moduleCount; x++) {
                if (qrcode.isDark(y, x)) {
                    numDarkCells++;
                }
            }
        }
        var numTotalCells = moduleCount * moduleCount;
        var fivePercentVariances = Math.floor(Math.abs(numDarkCells * 20 - numTotalCells * 10) / numTotalCells);
        return fivePercentVariances * N4;
    }
    /**
     * @function calculateMaskPenalty
     * @param {Encoder} qrcode
     * @see https://www.thonky.com/qr-code-tutorial/data-masking
     * @see https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/encoder/MaskUtil.java
     */
    function calculateMaskPenalty(qrcode) {
        return (applyMaskPenaltyRule1(qrcode) +
            applyMaskPenaltyRule2(qrcode) +
            applyMaskPenaltyRule3(qrcode) +
            applyMaskPenaltyRule4(qrcode));
    }

    /**
     * @module RSBlock
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var RSBlock = /*#__PURE__*/ (function () {
        function RSBlock(totalCount, dataCount) {
            this.dataCount = dataCount;
            this.totalCount = totalCount;
        }
        RSBlock.prototype.getDataCount = function () {
            return this.dataCount;
        };
        RSBlock.prototype.getTotalCount = function () {
            return this.totalCount;
        };
        RSBlock.getRSBlocks = function (version, errorCorrectionLevel) {
            var rsBlocks = [];
            var rsBlock = RSBlock.getRSBlockTable(version, errorCorrectionLevel);
            var length = rsBlock.length / 3;
            for (var i = 0; i < length; i++) {
                var count = rsBlock[i * 3 + 0];
                var totalCount = rsBlock[i * 3 + 1];
                var dataCount = rsBlock[i * 3 + 2];
                for (var j = 0; j < count; j++) {
                    rsBlocks.push(new RSBlock(totalCount, dataCount));
                }
            }
            return rsBlocks;
        };
        RSBlock.getRSBlockTable = function (version, errorCorrectionLevel) {
            switch (errorCorrectionLevel) {
                case exports.ErrorCorrectionLevel.L:
                    return RSBlock.RS_BLOCK_TABLE[(version - 1) * 4 + 0];
                case exports.ErrorCorrectionLevel.M:
                    return RSBlock.RS_BLOCK_TABLE[(version - 1) * 4 + 1];
                case exports.ErrorCorrectionLevel.Q:
                    return RSBlock.RS_BLOCK_TABLE[(version - 1) * 4 + 2];
                case exports.ErrorCorrectionLevel.H:
                    return RSBlock.RS_BLOCK_TABLE[(version - 1) * 4 + 3];
                default:
                    throw "illegal error correction level: " + errorCorrectionLevel;
            }
        };
        RSBlock.RS_BLOCK_TABLE = [
            // L
            // M
            // Q
            // H
            // 1
            [1, 26, 19],
            [1, 26, 16],
            [1, 26, 13],
            [1, 26, 9],
            // 2
            [1, 44, 34],
            [1, 44, 28],
            [1, 44, 22],
            [1, 44, 16],
            // 3
            [1, 70, 55],
            [1, 70, 44],
            [2, 35, 17],
            [2, 35, 13],
            // 4
            [1, 100, 80],
            [2, 50, 32],
            [2, 50, 24],
            [4, 25, 9],
            // 5
            [1, 134, 108],
            [2, 67, 43],
            [2, 33, 15, 2, 34, 16],
            [2, 33, 11, 2, 34, 12],
            // 6
            [2, 86, 68],
            [4, 43, 27],
            [4, 43, 19],
            [4, 43, 15],
            // 7
            [2, 98, 78],
            [4, 49, 31],
            [2, 32, 14, 4, 33, 15],
            [4, 39, 13, 1, 40, 14],
            // 8
            [2, 121, 97],
            [2, 60, 38, 2, 61, 39],
            [4, 40, 18, 2, 41, 19],
            [4, 40, 14, 2, 41, 15],
            // 9
            [2, 146, 116],
            [3, 58, 36, 2, 59, 37],
            [4, 36, 16, 4, 37, 17],
            [4, 36, 12, 4, 37, 13],
            // 10
            [2, 86, 68, 2, 87, 69],
            [4, 69, 43, 1, 70, 44],
            [6, 43, 19, 2, 44, 20],
            [6, 43, 15, 2, 44, 16],
            // 11
            [4, 101, 81],
            [1, 80, 50, 4, 81, 51],
            [4, 50, 22, 4, 51, 23],
            [3, 36, 12, 8, 37, 13],
            // 12
            [2, 116, 92, 2, 117, 93],
            [6, 58, 36, 2, 59, 37],
            [4, 46, 20, 6, 47, 21],
            [7, 42, 14, 4, 43, 15],
            // 13
            [4, 133, 107],
            [8, 59, 37, 1, 60, 38],
            [8, 44, 20, 4, 45, 21],
            [12, 33, 11, 4, 34, 12],
            // 14
            [3, 145, 115, 1, 146, 116],
            [4, 64, 40, 5, 65, 41],
            [11, 36, 16, 5, 37, 17],
            [11, 36, 12, 5, 37, 13],
            // 15
            [5, 109, 87, 1, 110, 88],
            [5, 65, 41, 5, 66, 42],
            [5, 54, 24, 7, 55, 25],
            [11, 36, 12, 7, 37, 13],
            // 16
            [5, 122, 98, 1, 123, 99],
            [7, 73, 45, 3, 74, 46],
            [15, 43, 19, 2, 44, 20],
            [3, 45, 15, 13, 46, 16],
            // 17
            [1, 135, 107, 5, 136, 108],
            [10, 74, 46, 1, 75, 47],
            [1, 50, 22, 15, 51, 23],
            [2, 42, 14, 17, 43, 15],
            // 18
            [5, 150, 120, 1, 151, 121],
            [9, 69, 43, 4, 70, 44],
            [17, 50, 22, 1, 51, 23],
            [2, 42, 14, 19, 43, 15],
            // 19
            [3, 141, 113, 4, 142, 114],
            [3, 70, 44, 11, 71, 45],
            [17, 47, 21, 4, 48, 22],
            [9, 39, 13, 16, 40, 14],
            // 20
            [3, 135, 107, 5, 136, 108],
            [3, 67, 41, 13, 68, 42],
            [15, 54, 24, 5, 55, 25],
            [15, 43, 15, 10, 44, 16],
            // 21
            [4, 144, 116, 4, 145, 117],
            [17, 68, 42],
            [17, 50, 22, 6, 51, 23],
            [19, 46, 16, 6, 47, 17],
            // 22
            [2, 139, 111, 7, 140, 112],
            [17, 74, 46],
            [7, 54, 24, 16, 55, 25],
            [34, 37, 13],
            // 23
            [4, 151, 121, 5, 152, 122],
            [4, 75, 47, 14, 76, 48],
            [11, 54, 24, 14, 55, 25],
            [16, 45, 15, 14, 46, 16],
            // 24
            [6, 147, 117, 4, 148, 118],
            [6, 73, 45, 14, 74, 46],
            [11, 54, 24, 16, 55, 25],
            [30, 46, 16, 2, 47, 17],
            // 25
            [8, 132, 106, 4, 133, 107],
            [8, 75, 47, 13, 76, 48],
            [7, 54, 24, 22, 55, 25],
            [22, 45, 15, 13, 46, 16],
            // 26
            [10, 142, 114, 2, 143, 115],
            [19, 74, 46, 4, 75, 47],
            [28, 50, 22, 6, 51, 23],
            [33, 46, 16, 4, 47, 17],
            // 27
            [8, 152, 122, 4, 153, 123],
            [22, 73, 45, 3, 74, 46],
            [8, 53, 23, 26, 54, 24],
            [12, 45, 15, 28, 46, 16],
            // 28
            [3, 147, 117, 10, 148, 118],
            [3, 73, 45, 23, 74, 46],
            [4, 54, 24, 31, 55, 25],
            [11, 45, 15, 31, 46, 16],
            // 29
            [7, 146, 116, 7, 147, 117],
            [21, 73, 45, 7, 74, 46],
            [1, 53, 23, 37, 54, 24],
            [19, 45, 15, 26, 46, 16],
            // 30
            [5, 145, 115, 10, 146, 116],
            [19, 75, 47, 10, 76, 48],
            [15, 54, 24, 25, 55, 25],
            [23, 45, 15, 25, 46, 16],
            // 31
            [13, 145, 115, 3, 146, 116],
            [2, 74, 46, 29, 75, 47],
            [42, 54, 24, 1, 55, 25],
            [23, 45, 15, 28, 46, 16],
            // 32
            [17, 145, 115],
            [10, 74, 46, 23, 75, 47],
            [10, 54, 24, 35, 55, 25],
            [19, 45, 15, 35, 46, 16],
            // 33
            [17, 145, 115, 1, 146, 116],
            [14, 74, 46, 21, 75, 47],
            [29, 54, 24, 19, 55, 25],
            [11, 45, 15, 46, 46, 16],
            // 34
            [13, 145, 115, 6, 146, 116],
            [14, 74, 46, 23, 75, 47],
            [44, 54, 24, 7, 55, 25],
            [59, 46, 16, 1, 47, 17],
            // 35
            [12, 151, 121, 7, 152, 122],
            [12, 75, 47, 26, 76, 48],
            [39, 54, 24, 14, 55, 25],
            [22, 45, 15, 41, 46, 16],
            // 36
            [6, 151, 121, 14, 152, 122],
            [6, 75, 47, 34, 76, 48],
            [46, 54, 24, 10, 55, 25],
            [2, 45, 15, 64, 46, 16],
            // 37
            [17, 152, 122, 4, 153, 123],
            [29, 74, 46, 14, 75, 47],
            [49, 54, 24, 10, 55, 25],
            [24, 45, 15, 46, 46, 16],
            // 38
            [4, 152, 122, 18, 153, 123],
            [13, 74, 46, 32, 75, 47],
            [48, 54, 24, 14, 55, 25],
            [42, 45, 15, 32, 46, 16],
            // 39
            [20, 147, 117, 4, 148, 118],
            [40, 75, 47, 7, 76, 48],
            [43, 54, 24, 22, 55, 25],
            [10, 45, 15, 67, 46, 16],
            // 40
            [19, 148, 118, 6, 149, 119],
            [18, 75, 47, 31, 76, 48],
            [34, 54, 24, 34, 55, 25],
            [20, 45, 15, 61, 46, 16]
        ];
        return RSBlock;
    }());

    /**
     * @module BitBuffer
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var BitBuffer = /*#__PURE__*/ (function () {
        function BitBuffer() {
            this.length = 0;
            this.buffer = [];
        }
        BitBuffer.prototype.getBuffer = function () {
            return this.buffer;
        };
        BitBuffer.prototype.getLengthInBits = function () {
            return this.length;
        };
        BitBuffer.prototype.getBit = function (index) {
            return ((this.buffer[(index / 8) >> 0] >>> (7 - (index % 8))) & 1) === 1;
        };
        BitBuffer.prototype.put = function (num, length) {
            for (var i = 0; i < length; i++) {
                this.putBit(((num >>> (length - i - 1)) & 1) === 1);
            }
        };
        BitBuffer.prototype.putBit = function (bit) {
            if (this.length === this.buffer.length * 8) {
                this.buffer.push(0);
            }
            if (bit) {
                this.buffer[(this.length / 8) >> 0] |= 0x80 >>> this.length % 8;
            }
            this.length++;
        };
        return BitBuffer;
    }());

    /**
     * @module OutputStream
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var OutputStream = /*#__PURE__*/ (function () {
        function OutputStream() {
        }
        OutputStream.prototype.writeBytes = function (bytes) {
            var length = bytes.length;
            for (var i = 0; i < length; i++) {
                this.writeByte(bytes[i]);
            }
        };
        OutputStream.prototype.flush = function () {
            // The flush method
        };
        OutputStream.prototype.close = function () {
            this.flush();
        };
        return OutputStream;
    }());

    /**
     * @module ByteArrayOutputStream
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var ByteArrayOutputStream = /*#__PURE__*/ (function (_super) {
        __extends(ByteArrayOutputStream, _super);
        function ByteArrayOutputStream() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.bytes = [];
            return _this;
        }
        ByteArrayOutputStream.prototype.writeByte = function (byte) {
            this.bytes.push(byte);
        };
        ByteArrayOutputStream.prototype.toByteArray = function () {
            return this.bytes;
        };
        return ByteArrayOutputStream;
    }(OutputStream));

    /**
     * @module Base64EncodeOutputStream
     * @author nuintun
     * @author Kazuhiko Arase
     */
    function encode(ch) {
        if (ch >= 0) {
            if (ch < 26) {
                // A
                return 0x41 + ch;
            }
            else if (ch < 52) {
                // a
                return 0x61 + (ch - 26);
            }
            else if (ch < 62) {
                // 0
                return 0x30 + (ch - 52);
            }
            else if (ch === 62) {
                // +
                return 0x2b;
            }
            else if (ch === 63) {
                // /
                return 0x2f;
            }
        }
        throw "illegal char: " + String.fromCharCode(ch);
    }
    var Base64EncodeOutputStream = /*#__PURE__*/ (function (_super) {
        __extends(Base64EncodeOutputStream, _super);
        function Base64EncodeOutputStream(stream) {
            var _this = _super.call(this) || this;
            _this.buffer = 0;
            _this.length = 0;
            _this.bufLength = 0;
            _this.stream = stream;
            return _this;
        }
        Base64EncodeOutputStream.prototype.writeByte = function (byte) {
            this.buffer = (this.buffer << 8) | (byte & 0xff);
            this.bufLength += 8;
            this.length++;
            while (this.bufLength >= 6) {
                this.writeEncoded(this.buffer >>> (this.bufLength - 6));
                this.bufLength -= 6;
            }
        };
        /**
         * @override
         */
        Base64EncodeOutputStream.prototype.flush = function () {
            if (this.bufLength > 0) {
                this.writeEncoded(this.buffer << (6 - this.bufLength));
                this.buffer = 0;
                this.bufLength = 0;
            }
            if (this.length % 3 != 0) {
                // Padding
                var pad = 3 - (this.length % 3);
                for (var i = 0; i < pad; i++) {
                    // =
                    this.stream.writeByte(0x3d);
                }
            }
        };
        Base64EncodeOutputStream.prototype.writeEncoded = function (byte) {
            this.stream.writeByte(encode(byte & 0x3f));
        };
        return Base64EncodeOutputStream;
    }(OutputStream));

    /**
     * @module GIF Image (B/W)
     * @author nuintun
     * @author Kazuhiko Arase
     */
    function encodeToBase64(data) {
        var output = new ByteArrayOutputStream();
        var stream = new Base64EncodeOutputStream(output);
        try {
            stream.writeBytes(data);
        }
        finally {
            stream.close();
        }
        output.close();
        return output.toByteArray();
    }
    var LZWTable = /*#__PURE__*/ (function () {
        function LZWTable() {
            this.size = 0;
            this.map = {};
        }
        LZWTable.prototype.add = function (key) {
            if (!this.contains(key)) {
                this.map[key] = this.size++;
            }
        };
        LZWTable.prototype.getSize = function () {
            return this.size;
        };
        LZWTable.prototype.indexOf = function (key) {
            return this.map[key];
        };
        LZWTable.prototype.contains = function (key) {
            return this.map.hasOwnProperty(key);
        };
        return LZWTable;
    }());
    var BitOutputStream = /*#__PURE__*/ (function () {
        function BitOutputStream(output) {
            this.output = output;
            this.bitLength = 0;
        }
        BitOutputStream.prototype.write = function (data, length) {
            if (data >>> length !== 0) {
                throw 'length overflow';
            }
            while (this.bitLength + length >= 8) {
                this.output.writeByte(0xff & ((data << this.bitLength) | this.bitBuffer));
                length -= 8 - this.bitLength;
                data >>>= 8 - this.bitLength;
                this.bitBuffer = 0;
                this.bitLength = 0;
            }
            this.bitBuffer = (data << this.bitLength) | this.bitBuffer;
            this.bitLength = this.bitLength + length;
        };
        BitOutputStream.prototype.flush = function () {
            if (this.bitLength > 0) {
                this.output.writeByte(this.bitBuffer);
            }
            this.output.flush();
        };
        BitOutputStream.prototype.close = function () {
            this.flush();
            this.output.close();
        };
        return BitOutputStream;
    }());
    var GIFImage = /*#__PURE__*/ (function () {
        function GIFImage(width, height) {
            this.data = [];
            this.width = width;
            this.height = height;
            var size = width * height;
            for (var i = 0; i < size; i++) {
                this.data[i] = 0;
            }
        }
        GIFImage.prototype.getLZWRaster = function (lzwMinCodeSize) {
            var clearCode = 1 << lzwMinCodeSize;
            var endCode = (1 << lzwMinCodeSize) + 1;
            // Setup LZWTable
            var table = new LZWTable();
            for (var i = 0; i < clearCode; i++) {
                table.add(String.fromCharCode(i));
            }
            table.add(String.fromCharCode(clearCode));
            table.add(String.fromCharCode(endCode));
            var byteOutput = new ByteArrayOutputStream();
            var bitOutput = new BitOutputStream(byteOutput);
            var bitLength = lzwMinCodeSize + 1;
            try {
                // Clear code
                bitOutput.write(clearCode, bitLength);
                var dataIndex = 0;
                var s = String.fromCharCode(this.data[dataIndex++]);
                var length_1 = this.data.length;
                while (dataIndex < length_1) {
                    var c = String.fromCharCode(this.data[dataIndex++]);
                    if (table.contains(s + c)) {
                        s = s + c;
                    }
                    else {
                        bitOutput.write(table.indexOf(s), bitLength);
                        if (table.getSize() < 0xfff) {
                            if (table.getSize() === 1 << bitLength) {
                                bitLength++;
                            }
                            table.add(s + c);
                        }
                        s = c;
                    }
                }
                bitOutput.write(table.indexOf(s), bitLength);
                // End code
                bitOutput.write(endCode, bitLength);
            }
            finally {
                bitOutput.close();
            }
            return byteOutput.toByteArray();
        };
        GIFImage.prototype.writeWord = function (output, i) {
            output.writeByte(i & 0xff);
            output.writeByte((i >>> 8) & 0xff);
        };
        GIFImage.prototype.writeBytes = function (output, bytes, off, length) {
            for (var i = 0; i < length; i++) {
                output.writeByte(bytes[i + off]);
            }
        };
        GIFImage.prototype.setPixel = function (x, y, pixel) {
            if (x < 0 || this.width <= x)
                throw "illegal x axis: " + x;
            if (y < 0 || this.height <= y)
                throw "illegal y axis: " + y;
            this.data[y * this.width + x] = pixel;
        };
        GIFImage.prototype.getPixel = function (x, y) {
            if (x < 0 || this.width <= x)
                throw "illegal x axis: " + x;
            if (y < 0 || this.height <= y)
                throw "illegal x axis: " + y;
            return this.data[y * this.width + x];
        };
        GIFImage.prototype.write = function (output) {
            // GIF Signature
            output.writeByte(0x47); // G
            output.writeByte(0x49); // I
            output.writeByte(0x46); // F
            output.writeByte(0x38); // 8
            output.writeByte(0x37); // 7
            output.writeByte(0x61); // a
            // Screen Descriptor
            this.writeWord(output, this.width);
            this.writeWord(output, this.height);
            output.writeByte(0x80); // 2bit
            output.writeByte(0);
            output.writeByte(0);
            // Global Color Map
            // Black
            output.writeByte(0x00);
            output.writeByte(0x00);
            output.writeByte(0x00);
            // White
            output.writeByte(0xff);
            output.writeByte(0xff);
            output.writeByte(0xff);
            // Image Descriptor
            output.writeByte(0x2c); // ,
            this.writeWord(output, 0);
            this.writeWord(output, 0);
            this.writeWord(output, this.width);
            this.writeWord(output, this.height);
            output.writeByte(0);
            // Local Color Map
            // Raster Data
            var lzwMinCodeSize = 2;
            var raster = this.getLZWRaster(lzwMinCodeSize);
            var raLength = raster.length;
            output.writeByte(lzwMinCodeSize);
            var offset = 0;
            while (raLength - offset > 255) {
                output.writeByte(255);
                this.writeBytes(output, raster, offset, 255);
                offset += 255;
            }
            var length = raLength - offset;
            output.writeByte(length);
            this.writeBytes(output, raster, offset, length);
            output.writeByte(0x00);
            // GIF Terminator
            output.writeByte(0x3b); // ;
        };
        GIFImage.prototype.toDataURL = function () {
            var output = new ByteArrayOutputStream();
            this.write(output);
            var bytes = encodeToBase64(output.toByteArray());
            output.close();
            var url = 'data:image/gif;base64,';
            var length = bytes.length;
            for (var i = 0; i < length; i++) {
                url += String.fromCharCode(bytes[i]);
            }
            return url;
        };
        return GIFImage;
    }());

    /**
     * @module MaskPattern
     * @author nuintun
     * @author Cosmo Wolfe
     * @author Kazuhiko Arase
     */
    function getMaskFunc(maskPattern) {
        switch (maskPattern) {
            case 0 /* PATTERN000 */:
                return function (x, y) { return ((x + y) & 0x1) === 0; };
            case 1 /* PATTERN001 */:
                return function (x, y) { return (y & 0x1) === 0; };
            case 2 /* PATTERN010 */:
                return function (x, y) { return x % 3 === 0; };
            case 3 /* PATTERN011 */:
                return function (x, y) { return (x + y) % 3 === 0; };
            case 4 /* PATTERN100 */:
                return function (x, y) { return ((((x / 3) >> 0) + ((y / 2) >> 0)) & 0x1) === 0; };
            case 5 /* PATTERN101 */:
                return function (x, y) { return ((x * y) & 0x1) + ((x * y) % 3) === 0; };
            case 6 /* PATTERN110 */:
                return function (x, y) { return ((((x * y) & 0x1) + ((x * y) % 3)) & 0x1) === 0; };
            case 7 /* PATTERN111 */:
                return function (x, y) { return ((((x * y) % 3) + ((x + y) & 0x1)) & 0x1) === 0; };
            default:
                throw "illegal mask: " + maskPattern;
        }
    }

    /**
     * @module QRCode
     * @author nuintun
     * @author Kazuhiko Arase
     */
    var PAD0 = 0xec;
    var PAD1 = 0x11;
    var toString = Object.prototype.toString;
    /**
     * @function appendECI
     * @param {number} encoding
     * @param {BitBuffer} buffer
     * @see https://github.com/nayuki/QR-Code-generator/blob/master/typescript/qrcodegen.ts
     * @see https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/encoder/Encoder.java
     */
    function appendECI(encoding, buffer) {
        if (encoding < 0 || encoding >= 1000000) {
            throw 'byte mode encoding hint out of range';
        }
        buffer.put(exports.Mode.ECI, 4);
        if (encoding < 1 << 7) {
            buffer.put(encoding, 8);
        }
        else if (encoding < 1 << 14) {
            buffer.put(2, 2);
            buffer.put(encoding, 14);
        }
        else {
            buffer.put(6, 3);
            buffer.put(encoding, 21);
        }
    }
    function prepareData(version, errorCorrectionLevel, hasEncodingHint, chunks) {
        var dLength = chunks.length;
        var buffer = new BitBuffer();
        var rsBlocks = RSBlock.getRSBlocks(version, errorCorrectionLevel);
        for (var i = 0; i < dLength; i++) {
            var data = chunks[i];
            var mode = data.getMode();
            // Default set encoding UTF-8 when has encoding hint
            if (hasEncodingHint && mode === exports.Mode.Byte) {
                appendECI(data.encoding, buffer);
            }
            buffer.put(mode, 4);
            buffer.put(data.getLength(), data.getLengthInBits(version));
            data.write(buffer);
        }
        // Calc max data count
        var maxDataCount = 0;
        var rLength = rsBlocks.length;
        for (var i = 0; i < rLength; i++) {
            maxDataCount += rsBlocks[i].getDataCount();
        }
        maxDataCount *= 8;
        return [buffer, rsBlocks, maxDataCount];
    }
    function createBytes(buffer, rsBlocks) {
        var offset = 0;
        var maxDcCount = 0;
        var maxEcCount = 0;
        var dcData = [];
        var ecData = [];
        var rsLength = rsBlocks.length;
        var bufferData = buffer.getBuffer();
        for (var r = 0; r < rsLength; r++) {
            var rsBlock = rsBlocks[r];
            var dcCount = rsBlock.getDataCount();
            var ecCount = rsBlock.getTotalCount() - dcCount;
            maxDcCount = Math.max(maxDcCount, dcCount);
            maxEcCount = Math.max(maxEcCount, ecCount);
            dcData[r] = [];
            for (var i = 0; i < dcCount; i++) {
                dcData[r][i] = 0xff & bufferData[i + offset];
            }
            offset += dcCount;
            var rsPoly = getErrorCorrectionPolynomial(ecCount);
            var ecLength = rsPoly.getLength() - 1;
            var rawPoly = new Polynomial(dcData[r], ecLength);
            var modPoly = rawPoly.mod(rsPoly);
            var mpLength = modPoly.getLength();
            ecData[r] = [];
            for (var i = 0; i < ecLength; i++) {
                var modIndex = i + mpLength - ecLength;
                ecData[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
            }
        }
        buffer = new BitBuffer();
        for (var i = 0; i < maxDcCount; i++) {
            for (var r = 0; r < rsLength; r++) {
                if (i < dcData[r].length) {
                    buffer.put(dcData[r][i], 8);
                }
            }
        }
        for (var i = 0; i < maxEcCount; i++) {
            for (var r = 0; r < rsLength; r++) {
                if (i < ecData[r].length) {
                    buffer.put(ecData[r][i], 8);
                }
            }
        }
        return buffer;
    }
    function createData(buffer, rsBlocks, maxDataCount) {
        if (buffer.getLengthInBits() > maxDataCount) {
            throw "data overflow: " + buffer.getLengthInBits() + " > " + maxDataCount;
        }
        // End
        if (buffer.getLengthInBits() + 4 <= maxDataCount) {
            buffer.put(0, 4);
        }
        // Padding
        while (buffer.getLengthInBits() % 8 !== 0) {
            buffer.putBit(false);
        }
        // Padding
        while (true) {
            if (buffer.getLengthInBits() >= maxDataCount) {
                break;
            }
            buffer.put(PAD0, 8);
            if (buffer.getLengthInBits() >= maxDataCount) {
                break;
            }
            buffer.put(PAD1, 8);
        }
        return createBytes(buffer, rsBlocks);
    }
    var Encoder = /*#__PURE__*/ (function () {
        function Encoder() {
            this.version = 0;
            this.chunks = [];
            this.moduleCount = 0;
            this.modules = [];
            this.hasEncodingHint = false;
            this.autoVersion = this.version === 0;
            this.errorCorrectionLevel = exports.ErrorCorrectionLevel.L;
        }
        /**
         * @public
         * @method getModules
         * @returns {boolean[][]}
         */
        Encoder.prototype.getModules = function () {
            return this.modules;
        };
        /**
         * @public
         * @method getModuleCount
         */
        Encoder.prototype.getModuleCount = function () {
            return this.moduleCount;
        };
        /**
         * @public
         * @method getVersion
         * @returns {number}
         */
        Encoder.prototype.getVersion = function () {
            return this.version;
        };
        /**
         * @public
         * @method setVersion
         * @param {number} version
         */
        Encoder.prototype.setVersion = function (version) {
            this.version = Math.min(40, Math.max(0, version >> 0));
            this.autoVersion = this.version === 0;
            return this;
        };
        /**
         * @public
         * @method getErrorCorrectionLevel
         * @returns {ErrorCorrectionLevel}
         */
        Encoder.prototype.getErrorCorrectionLevel = function () {
            return this.errorCorrectionLevel;
        };
        /**
         * @public
         * @method setErrorCorrectionLevel
         * @param {ErrorCorrectionLevel} errorCorrectionLevel
         */
        Encoder.prototype.setErrorCorrectionLevel = function (errorCorrectionLevel) {
            switch (errorCorrectionLevel) {
                case exports.ErrorCorrectionLevel.L:
                case exports.ErrorCorrectionLevel.M:
                case exports.ErrorCorrectionLevel.Q:
                case exports.ErrorCorrectionLevel.H:
                    this.errorCorrectionLevel = errorCorrectionLevel;
            }
            return this;
        };
        /**
         * @public
         * @method getEncodingHint
         * @returns {boolean}
         */
        Encoder.prototype.getEncodingHint = function () {
            return this.hasEncodingHint;
        };
        /**
         * @public
         * @method setEncodingHint
         * @param {boolean} hasEncodingHint
         */
        Encoder.prototype.setEncodingHint = function (hasEncodingHint) {
            this.hasEncodingHint = hasEncodingHint;
            return this;
        };
        /**
         * @public
         * @method write
         * @param {QRData} data
         */
        Encoder.prototype.write = function (data) {
            if (data instanceof QRData) {
                this.chunks.push(data);
            }
            else {
                var type = toString.call(data);
                if (type === '[object String]') {
                    this.chunks.push(new QRByte(data));
                }
                else {
                    throw "illegal data: " + data;
                }
            }
            return this;
        };
        /**
         * @public
         * @method isDark
         * @param {number} row
         * @param {number} col
         * @returns {boolean}
         */
        Encoder.prototype.isDark = function (row, col) {
            if (this.modules[row][col] !== null) {
                return this.modules[row][col];
            }
            else {
                return false;
            }
        };
        Encoder.prototype.setupFinderPattern = function (row, col) {
            var moduleCount = this.moduleCount;
            for (var r = -1; r <= 7; r++) {
                for (var c = -1; c <= 7; c++) {
                    if (row + r <= -1 || moduleCount <= row + r || col + c <= -1 || moduleCount <= col + c) {
                        continue;
                    }
                    if ((0 <= r && r <= 6 && (c === 0 || c === 6)) ||
                        (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
                        (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
                        this.modules[row + r][col + c] = true;
                    }
                    else {
                        this.modules[row + r][col + c] = false;
                    }
                }
            }
        };
        Encoder.prototype.setupAlignmentPattern = function () {
            var pos = getAlignmentPattern(this.version);
            var length = pos.length;
            for (var i = 0; i < length; i++) {
                for (var j = 0; j < length; j++) {
                    var row = pos[i];
                    var col = pos[j];
                    if (this.modules[row][col] !== null) {
                        continue;
                    }
                    for (var r = -2; r <= 2; r++) {
                        for (var c = -2; c <= 2; c++) {
                            if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
                                this.modules[row + r][col + c] = true;
                            }
                            else {
                                this.modules[row + r][col + c] = false;
                            }
                        }
                    }
                }
            }
        };
        Encoder.prototype.setupTimingPattern = function () {
            var count = this.moduleCount - 8;
            for (var i = 8; i < count; i++) {
                var bit = i % 2 === 0;
                // vertical
                if (this.modules[i][6] === null) {
                    this.modules[i][6] = bit;
                }
                // horizontal
                if (this.modules[6][i] === null) {
                    this.modules[6][i] = bit;
                }
            }
        };
        Encoder.prototype.setupFormatInfo = function (maskPattern) {
            var data = (this.errorCorrectionLevel << 3) | maskPattern;
            var bits = getBCHVersionInfo(data);
            var moduleCount = this.moduleCount;
            for (var i = 0; i < 15; i++) {
                var bit = ((bits >> i) & 1) === 1;
                // Vertical
                if (i < 6) {
                    this.modules[i][8] = bit;
                }
                else if (i < 8) {
                    this.modules[i + 1][8] = bit;
                }
                else {
                    this.modules[moduleCount - 15 + i][8] = bit;
                }
                // Horizontal
                if (i < 8) {
                    this.modules[8][moduleCount - i - 1] = bit;
                }
                else if (i < 9) {
                    this.modules[8][15 - i - 1 + 1] = bit;
                }
                else {
                    this.modules[8][15 - i - 1] = bit;
                }
            }
            // Fixed point
            this.modules[moduleCount - 8][8] = true;
        };
        Encoder.prototype.setupVersionInfo = function () {
            if (this.version >= 7) {
                var moduleCount = this.moduleCount;
                var bits = getBCHVersion(this.version);
                for (var i = 0; i < 18; i++) {
                    var bit = ((bits >> i) & 1) === 1;
                    this.modules[(i / 3) >> 0][(i % 3) + moduleCount - 8 - 3] = bit;
                    this.modules[(i % 3) + moduleCount - 8 - 3][(i / 3) >> 0] = bit;
                }
            }
        };
        Encoder.prototype.setupCodewords = function (data, maskPattern) {
            // Bit index into the data
            var bitIndex = 0;
            var moduleCount = this.moduleCount;
            var bitLength = data.getLengthInBits();
            // Do the funny zigzag scan
            for (var right = moduleCount - 1; right >= 1; right -= 2) {
                // Index of right column in each column pair
                if (right === 6) {
                    right = 5;
                }
                for (var vert = 0; vert < moduleCount; vert++) {
                    // Vertical counter
                    for (var j = 0; j < 2; j++) {
                        // Actual x coordinate
                        var x = right - j;
                        var upward = ((right + 1) & 2) === 0;
                        // Actual y coordinate
                        var y = upward ? moduleCount - 1 - vert : vert;
                        if (this.modules[y][x] !== null) {
                            continue;
                        }
                        var bit = false;
                        if (bitIndex < bitLength) {
                            bit = data.getBit(bitIndex++);
                        }
                        var maskFunc = getMaskFunc(maskPattern);
                        var invert = maskFunc(x, y);
                        if (invert) {
                            bit = !bit;
                        }
                        this.modules[y][x] = bit;
                    }
                }
            }
        };
        Encoder.prototype.buildMatrix = function (data, maskPattern) {
            // Initialize modules
            this.modules = [];
            var moduleCount = this.moduleCount;
            for (var row = 0; row < moduleCount; row++) {
                this.modules[row] = [];
                for (var col = 0; col < moduleCount; col++) {
                    this.modules[row][col] = null;
                }
            }
            // Setup finder pattern
            this.setupFinderPattern(0, 0);
            this.setupFinderPattern(moduleCount - 7, 0);
            this.setupFinderPattern(0, moduleCount - 7);
            // Setup alignment pattern
            this.setupAlignmentPattern();
            // Setup timing pattern
            this.setupTimingPattern();
            // Setup format info
            this.setupFormatInfo(maskPattern);
            // Setup version info
            this.setupVersionInfo();
            // Setup codewords
            this.setupCodewords(data, maskPattern);
        };
        /**
         * @public
         * @method make
         */
        Encoder.prototype.make = function () {
            var _a, _b;
            var buffer;
            var rsBlocks;
            var maxDataCount;
            var chunks = this.chunks;
            var errorCorrectionLevel = this.errorCorrectionLevel;
            if (this.autoVersion) {
                for (this.version = 1; this.version <= 40; this.version++) {
                    _a = prepareData(this.version, errorCorrectionLevel, this.hasEncodingHint, chunks), buffer = _a[0], rsBlocks = _a[1], maxDataCount = _a[2];
                    if (buffer.getLengthInBits() <= maxDataCount)
                        break;
                }
            }
            else {
                _b = prepareData(this.version, errorCorrectionLevel, this.hasEncodingHint, chunks), buffer = _b[0], rsBlocks = _b[1], maxDataCount = _b[2];
            }
            // Calc module count
            this.moduleCount = this.version * 4 + 17;
            var matrices = [];
            var data = createData(buffer, rsBlocks, maxDataCount);
            var bestMaskPattern = -1;
            var minPenalty = Number.MAX_VALUE;
            // Choose best mask pattern
            for (var maskPattern = 0; maskPattern < 8; maskPattern++) {
                this.buildMatrix(data, maskPattern);
                matrices.push(this.modules);
                var penalty = calculateMaskPenalty(this);
                if (penalty < minPenalty) {
                    minPenalty = penalty;
                    bestMaskPattern = maskPattern;
                }
            }
            this.modules = matrices[bestMaskPattern];
            return this;
        };
        /**
         * @public
         * @method toDataURL
         * @param {number} moduleSize
         * @param {number} margin
         * @returns {string}
         */
        Encoder.prototype.toDataURL = function (moduleSize, margin) {
            if (moduleSize === void 0) { moduleSize = 2; }
            if (margin === void 0) { margin = moduleSize * 4; }
            moduleSize = Math.max(1, moduleSize >> 0);
            margin = Math.max(0, margin >> 0);
            var moduleCount = this.moduleCount;
            var size = moduleSize * moduleCount + margin * 2;
            var gif = new GIFImage(size, size);
            for (var y = 0; y < size; y++) {
                for (var x = 0; x < size; x++) {
                    if (margin <= x &&
                        x < size - margin &&
                        margin <= y &&
                        y < size - margin &&
                        this.isDark(((y - margin) / moduleSize) >> 0, ((x - margin) / moduleSize) >> 0)) {
                        gif.setPixel(x, y, 0);
                    }
                    else {
                        gif.setPixel(x, y, 1);
                    }
                }
            }
            return gif.toDataURL();
        };
        return Encoder;
    }());

    /**
     * @module locator
     * @author nuintun
     * @author Cosmo Wolfe
     */
    var MIN_QUAD_RATIO = 0.5;
    var MAX_QUAD_RATIO = 1.5;
    var MAX_FINDERPATTERNS_TO_SEARCH = 4;
    function distance(a, b) {
        return Math.sqrt(Math.pow((b.x - a.x), 2) + Math.pow((b.y - a.y), 2));
    }
    function sum(values) {
        return values.reduce(function (a, b) { return a + b; });
    }
    // Takes three finder patterns and organizes them into topLeft, topRight, etc
    function reorderFinderPatterns(pattern1, pattern2, pattern3) {
        var _a, _b, _c, _d;
        // Find distances between pattern centers
        var oneTwoDistance = distance(pattern1, pattern2);
        var twoThreeDistance = distance(pattern2, pattern3);
        var oneThreeDistance = distance(pattern1, pattern3);
        var topLeft;
        var topRight;
        var bottomLeft;
        // Assume one closest to other two is B; A and C will just be guesses at first
        if (twoThreeDistance >= oneTwoDistance && twoThreeDistance >= oneThreeDistance) {
            _a = [pattern2, pattern1, pattern3], bottomLeft = _a[0], topLeft = _a[1], topRight = _a[2];
        }
        else if (oneThreeDistance >= twoThreeDistance && oneThreeDistance >= oneTwoDistance) {
            _b = [pattern1, pattern2, pattern3], bottomLeft = _b[0], topLeft = _b[1], topRight = _b[2];
        }
        else {
            _c = [pattern1, pattern3, pattern2], bottomLeft = _c[0], topLeft = _c[1], topRight = _c[2];
        }
        // Use cross product to figure out whether bottomLeft (A) and topRight (C) are correct or flipped in relation to topLeft (B)
        // This asks whether BC x BA has a positive z component, which is the arrangement we want. If it's negative, then
        // we've got it flipped around and should swap topRight and bottomLeft.
        if ((topRight.x - topLeft.x) * (bottomLeft.y - topLeft.y) - (topRight.y - topLeft.y) * (bottomLeft.x - topLeft.x) < 0) {
            _d = [topRight, bottomLeft], bottomLeft = _d[0], topRight = _d[1];
        }
        return { bottomLeft: bottomLeft, topLeft: topLeft, topRight: topRight };
    }
    // Computes the dimension (number of modules on a side) of the QR Code based on the position of the finder patterns
    function computeDimension(topLeft, topRight, bottomLeft, matrix) {
        var moduleSize = (sum(countBlackWhiteRun(topLeft, bottomLeft, matrix, 5)) / 7 + // Divide by 7 since the ratio is 1:1:3:1:1
            sum(countBlackWhiteRun(topLeft, topRight, matrix, 5)) / 7 +
            sum(countBlackWhiteRun(bottomLeft, topLeft, matrix, 5)) / 7 +
            sum(countBlackWhiteRun(topRight, topLeft, matrix, 5)) / 7) /
            4;
        if (moduleSize < 1) {
            throw 'invalid module size';
        }
        var topDimension = Math.round(distance(topLeft, topRight) / moduleSize);
        var sideDimension = Math.round(distance(topLeft, bottomLeft) / moduleSize);
        var dimension = Math.floor((topDimension + sideDimension) / 2) + 7;
        switch (dimension % 4) {
            case 0:
                dimension++;
                break;
            case 2:
                dimension--;
                break;
        }
        return { dimension: dimension, moduleSize: moduleSize };
    }
    // Takes an origin point and an end point and counts the sizes of the black white run from the origin towards the end point.
    // Returns an array of elements, representing the pixel size of the black white run.
    // Uses a variant of http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
    function countBlackWhiteRunTowardsPoint(origin, end, matrix, length) {
        var switchPoints = [{ x: Math.floor(origin.x), y: Math.floor(origin.y) }];
        var steep = Math.abs(end.y - origin.y) > Math.abs(end.x - origin.x);
        var fromX;
        var fromY;
        var toX;
        var toY;
        if (steep) {
            fromX = Math.floor(origin.y);
            fromY = Math.floor(origin.x);
            toX = Math.floor(end.y);
            toY = Math.floor(end.x);
        }
        else {
            fromX = Math.floor(origin.x);
            fromY = Math.floor(origin.y);
            toX = Math.floor(end.x);
            toY = Math.floor(end.y);
        }
        var dx = Math.abs(toX - fromX);
        var dy = Math.abs(toY - fromY);
        var error = Math.floor(-dx / 2);
        var xStep = fromX < toX ? 1 : -1;
        var yStep = fromY < toY ? 1 : -1;
        var currentPixel = true;
        // Loop up until x == toX, but not beyond
        for (var x = fromX, y = fromY; x !== toX + xStep; x += xStep) {
            // Does current pixel mean we have moved white to black or vice versa?
            // Scanning black in state 0,2 and white in state 1, so if we find the wrong
            // color, advance to next state or end if we are in state 2 already
            var realX = steep ? y : x;
            var realY = steep ? x : y;
            if (matrix.get(realX, realY) !== currentPixel) {
                currentPixel = !currentPixel;
                switchPoints.push({ x: realX, y: realY });
                if (switchPoints.length === length + 1) {
                    break;
                }
            }
            error += dy;
            if (error > 0) {
                if (y === toY) {
                    break;
                }
                y += yStep;
                error -= dx;
            }
        }
        var distances = [];
        for (var i = 0; i < length; i++) {
            if (switchPoints[i] && switchPoints[i + 1]) {
                distances.push(distance(switchPoints[i], switchPoints[i + 1]));
            }
            else {
                distances.push(0);
            }
        }
        return distances;
    }
    // Takes an origin point and an end point and counts the sizes of the black white run in the origin point
    // along the line that intersects with the end point. Returns an array of elements, representing the pixel sizes
    // of the black white run. Takes a length which represents the number of switches from black to white to look for.
    function countBlackWhiteRun(origin, end, matrix, length) {
        var _a;
        var rise = end.y - origin.y;
        var run = end.x - origin.x;
        var towardsEnd = countBlackWhiteRunTowardsPoint(origin, end, matrix, Math.ceil(length / 2));
        var awayFromEnd = countBlackWhiteRunTowardsPoint(origin, { x: origin.x - run, y: origin.y - rise }, matrix, Math.ceil(length / 2));
        var middleValue = towardsEnd.shift() + awayFromEnd.shift() - 1; // Substract one so we don't double count a pixel
        return (_a = awayFromEnd.concat(middleValue)).concat.apply(_a, towardsEnd);
    }
    // Takes in a black white run and an array of expected ratios. Returns the average size of the run as well as the "error" -
    // that is the amount the run diverges from the expected ratio
    function scoreBlackWhiteRun(sequence, ratios) {
        var averageSize = sum(sequence) / sum(ratios);
        var error = 0;
        ratios.forEach(function (ratio, i) {
            error += Math.pow((sequence[i] - ratio * averageSize), 2);
        });
        return { averageSize: averageSize, error: error };
    }
    // Takes an X,Y point and an array of sizes and scores the point against those ratios.
    // For example for a finder pattern takes the ratio list of 1:1:3:1:1 and checks horizontal, vertical and diagonal ratios
    // against that.
    function scorePattern(point, ratios, matrix) {
        try {
            var horizontalRun = countBlackWhiteRun(point, { x: -1, y: point.y }, matrix, ratios.length);
            var verticalRun = countBlackWhiteRun(point, { x: point.x, y: -1 }, matrix, ratios.length);
            var topLeftPoint = {
                x: Math.max(0, point.x - point.y) - 1,
                y: Math.max(0, point.y - point.x) - 1
            };
            var topLeftBottomRightRun = countBlackWhiteRun(point, topLeftPoint, matrix, ratios.length);
            var bottomLeftPoint = {
                x: Math.min(matrix.width, point.x + point.y) + 1,
                y: Math.min(matrix.height, point.y + point.x) + 1
            };
            var bottomLeftTopRightRun = countBlackWhiteRun(point, bottomLeftPoint, matrix, ratios.length);
            var horzError = scoreBlackWhiteRun(horizontalRun, ratios);
            var vertError = scoreBlackWhiteRun(verticalRun, ratios);
            var diagDownError = scoreBlackWhiteRun(topLeftBottomRightRun, ratios);
            var diagUpError = scoreBlackWhiteRun(bottomLeftTopRightRun, ratios);
            var ratioError = Math.sqrt(horzError.error * horzError.error +
                vertError.error * vertError.error +
                diagDownError.error * diagDownError.error +
                diagUpError.error * diagUpError.error);
            var avgSize = (horzError.averageSize + vertError.averageSize + diagDownError.averageSize + diagUpError.averageSize) / 4;
            var sizeError = (Math.pow((horzError.averageSize - avgSize), 2) +
                Math.pow((vertError.averageSize - avgSize), 2) +
                Math.pow((diagDownError.averageSize - avgSize), 2) +
                Math.pow((diagUpError.averageSize - avgSize), 2)) /
                avgSize;
            return ratioError + sizeError;
        }
        catch (_a) {
            return Infinity;
        }
    }
    function locate(matrix) {
        var _a;
        var finderPatternQuads = [];
        var alignmentPatternQuads = [];
        var activeFinderPatternQuads = [];
        var activeAlignmentPatternQuads = [];
        var _loop_1 = function (y) {
            var length_1 = 0;
            var lastBit = false;
            var scans = [0, 0, 0, 0, 0];
            var _loop_2 = function (x) {
                var v = matrix.get(x, y);
                if (v === lastBit) {
                    length_1++;
                }
                else {
                    scans = [scans[1], scans[2], scans[3], scans[4], length_1];
                    length_1 = 1;
                    lastBit = v;
                    // Do the last 5 color changes ~ match the expected ratio for a finder pattern? 1:1:3:1:1 of b:w:b:w:b
                    var averageFinderPatternBlocksize = sum(scans) / 7;
                    var validFinderPattern = Math.abs(scans[0] - averageFinderPatternBlocksize) < averageFinderPatternBlocksize &&
                        Math.abs(scans[1] - averageFinderPatternBlocksize) < averageFinderPatternBlocksize &&
                        Math.abs(scans[2] - 3 * averageFinderPatternBlocksize) < 3 * averageFinderPatternBlocksize &&
                        Math.abs(scans[3] - averageFinderPatternBlocksize) < averageFinderPatternBlocksize &&
                        Math.abs(scans[4] - averageFinderPatternBlocksize) < averageFinderPatternBlocksize &&
                        !v; // And make sure the current pixel is white since finder patterns are bordered in white
                    // Do the last 3 color changes ~ match the expected ratio for an alignment pattern? 1:1:1 of w:b:w
                    var averageAlignmentPatternBlocksize = sum(scans.slice(-3)) / 3;
                    var validAlignmentPattern = Math.abs(scans[2] - averageAlignmentPatternBlocksize) < averageAlignmentPatternBlocksize &&
                        Math.abs(scans[3] - averageAlignmentPatternBlocksize) < averageAlignmentPatternBlocksize &&
                        Math.abs(scans[4] - averageAlignmentPatternBlocksize) < averageAlignmentPatternBlocksize &&
                        v; // Is the current pixel black since alignment patterns are bordered in black
                    if (validFinderPattern) {
                        // Compute the start and end x values of the large center black square
                        var endX_1 = x - scans[3] - scans[4];
                        var startX_1 = endX_1 - scans[2];
                        var line = { startX: startX_1, endX: endX_1, y: y };
                        // Is there a quad directly above the current spot? If so, extend it with the new line. Otherwise, create a new quad with
                        // that line as the starting point.
                        var matchingQuads = activeFinderPatternQuads.filter(function (q) {
                            return (startX_1 >= q.bottom.startX && startX_1 <= q.bottom.endX) ||
                                (endX_1 >= q.bottom.startX && startX_1 <= q.bottom.endX) ||
                                (startX_1 <= q.bottom.startX &&
                                    endX_1 >= q.bottom.endX &&
                                    (scans[2] / (q.bottom.endX - q.bottom.startX) < MAX_QUAD_RATIO &&
                                        scans[2] / (q.bottom.endX - q.bottom.startX) > MIN_QUAD_RATIO));
                        });
                        if (matchingQuads.length > 0) {
                            matchingQuads[0].bottom = line;
                        }
                        else {
                            activeFinderPatternQuads.push({ top: line, bottom: line });
                        }
                    }
                    if (validAlignmentPattern) {
                        // Compute the start and end x values of the center black square
                        var endX_2 = x - scans[4];
                        var startX_2 = endX_2 - scans[3];
                        var line = { startX: startX_2, y: y, endX: endX_2 };
                        // Is there a quad directly above the current spot? If so, extend it with the new line. Otherwise, create a new quad with
                        // that line as the starting point.
                        var matchingQuads = activeAlignmentPatternQuads.filter(function (q) {
                            return (startX_2 >= q.bottom.startX && startX_2 <= q.bottom.endX) ||
                                (endX_2 >= q.bottom.startX && startX_2 <= q.bottom.endX) ||
                                (startX_2 <= q.bottom.startX &&
                                    endX_2 >= q.bottom.endX &&
                                    (scans[2] / (q.bottom.endX - q.bottom.startX) < MAX_QUAD_RATIO &&
                                        scans[2] / (q.bottom.endX - q.bottom.startX) > MIN_QUAD_RATIO));
                        });
                        if (matchingQuads.length > 0) {
                            matchingQuads[0].bottom = line;
                        }
                        else {
                            activeAlignmentPatternQuads.push({ top: line, bottom: line });
                        }
                    }
                }
            };
            for (var x = -1; x <= matrix.width; x++) {
                _loop_2(x);
            }
            finderPatternQuads.push.apply(finderPatternQuads, activeFinderPatternQuads.filter(function (q) { return q.bottom.y !== y && q.bottom.y - q.top.y >= 2; }));
            activeFinderPatternQuads = activeFinderPatternQuads.filter(function (q) { return q.bottom.y === y; });
            alignmentPatternQuads.push.apply(alignmentPatternQuads, activeAlignmentPatternQuads.filter(function (q) { return q.bottom.y !== y; }));
            activeAlignmentPatternQuads = activeAlignmentPatternQuads.filter(function (q) { return q.bottom.y === y; });
        };
        for (var y = 0; y <= matrix.height; y++) {
            _loop_1(y);
        }
        finderPatternQuads.push.apply(finderPatternQuads, activeFinderPatternQuads.filter(function (q) { return q.bottom.y - q.top.y >= 2; }));
        alignmentPatternQuads.push.apply(alignmentPatternQuads, activeAlignmentPatternQuads);
        var finderPatternGroups = finderPatternQuads
            .filter(function (q) { return q.bottom.y - q.top.y >= 2; }) // All quads must be at least 2px tall since the center square is larger than a block
            .map(function (q) {
            // Initial scoring of finder pattern quads by looking at their ratios, not taking into account position
            var x = (q.top.startX + q.top.endX + q.bottom.startX + q.bottom.endX) / 4;
            var y = (q.top.y + q.bottom.y + 1) / 2;
            if (!matrix.get(Math.round(x), Math.round(y))) {
                return;
            }
            var lengths = [q.top.endX - q.top.startX, q.bottom.endX - q.bottom.startX, q.bottom.y - q.top.y + 1];
            var size = sum(lengths) / lengths.length;
            var score = scorePattern({ x: Math.round(x), y: Math.round(y) }, [1, 1, 3, 1, 1], matrix);
            return { score: score, x: x, y: y, size: size };
        })
            .filter(function (q) { return !!q; }) // Filter out any rejected quads from above
            .sort(function (a, b) { return a.score - b.score; })
            // Now take the top finder pattern options and try to find 2 other options with a similar size.
            .map(function (point, i, finderPatterns) {
            if (i > MAX_FINDERPATTERNS_TO_SEARCH) {
                return null;
            }
            var otherPoints = finderPatterns
                .filter(function (p, ii) { return i !== ii; })
                .map(function (p) { return ({ x: p.x, y: p.y, score: p.score + Math.pow((p.size - point.size), 2) / point.size, size: p.size }); })
                .sort(function (a, b) { return a.score - b.score; });
            if (otherPoints.length < 2) {
                return null;
            }
            var score = point.score + otherPoints[0].score + otherPoints[1].score;
            return { points: [point].concat(otherPoints.slice(0, 2)), score: score };
        })
            .filter(function (q) { return !!q; }) // Filter out any rejected finder patterns from above
            .sort(function (a, b) { return a.score - b.score; });
        if (finderPatternGroups.length === 0) {
            return null;
        }
        var _b = reorderFinderPatterns(finderPatternGroups[0].points[0], finderPatternGroups[0].points[1], finderPatternGroups[0].points[2]), topRight = _b.topRight, topLeft = _b.topLeft, bottomLeft = _b.bottomLeft;
        // Now that we've found the three finder patterns we can determine the blockSize and the size of the QR code.
        // We'll use these to help find the alignment pattern but also later when we do the extraction.
        var dimension;
        var moduleSize;
        try {
            (_a = computeDimension(topLeft, topRight, bottomLeft, matrix), dimension = _a.dimension, moduleSize = _a.moduleSize);
        }
        catch (e) {
            return null;
        }
        // Now find the alignment pattern
        var bottomRightFinderPattern = {
            // Best guess at where a bottomRight finder pattern would be
            x: topRight.x - topLeft.x + bottomLeft.x,
            y: topRight.y - topLeft.y + bottomLeft.y
        };
        var modulesBetweenFinderPatterns = (distance(topLeft, bottomLeft) + distance(topLeft, topRight)) / 2 / moduleSize;
        var correctionToTopLeft = 1 - 3 / modulesBetweenFinderPatterns;
        var expectedAlignmentPattern = {
            x: topLeft.x + correctionToTopLeft * (bottomRightFinderPattern.x - topLeft.x),
            y: topLeft.y + correctionToTopLeft * (bottomRightFinderPattern.y - topLeft.y)
        };
        var alignmentPatterns = alignmentPatternQuads
            .map(function (q) {
            var x = (q.top.startX + q.top.endX + q.bottom.startX + q.bottom.endX) / 4;
            var y = (q.top.y + q.bottom.y + 1) / 2;
            if (!matrix.get(Math.floor(x), Math.floor(y))) {
                return;
            }
            var sizeScore = scorePattern({ x: Math.floor(x), y: Math.floor(y) }, [1, 1, 1], matrix);
            var score = sizeScore + distance({ x: x, y: y }, expectedAlignmentPattern);
            return { x: x, y: y, score: score };
        })
            .filter(function (v) { return !!v; })
            .sort(function (a, b) { return a.score - b.score; });
        // If there are less than 15 modules between finder patterns it's a version 1 QR code and as such has no alignmemnt pattern
        // so we can only use our best guess.
        var hasAlignmentPatterns = modulesBetweenFinderPatterns >= 15 && alignmentPatterns.length;
        var alignmentPattern = hasAlignmentPatterns ? alignmentPatterns[0] : expectedAlignmentPattern;
        return {
            dimension: dimension,
            topLeft: { x: topLeft.x, y: topLeft.y },
            topRight: { x: topRight.x, y: topRight.y },
            bottomLeft: { x: bottomLeft.x, y: bottomLeft.y },
            alignmentPattern: { x: alignmentPattern.x, y: alignmentPattern.y }
        };
    }

    /**
     * @module GenericGFPoly
     * @author nuintun
     * @author Cosmo Wolfe
     */
    var GenericGFPoly = /*#__PURE__*/ (function () {
        function GenericGFPoly(field, coefficients) {
            if (coefficients.length === 0) {
                throw 'no coefficients';
            }
            this.field = field;
            var coefficientsLength = coefficients.length;
            if (coefficientsLength > 1 && coefficients[0] === 0) {
                // Leading term must be non-zero for anything except the constant polynomial "0"
                var firstNonZero = 1;
                while (firstNonZero < coefficientsLength && coefficients[firstNonZero] === 0) {
                    firstNonZero++;
                }
                if (firstNonZero === coefficientsLength) {
                    this.coefficients = field.zero.coefficients;
                }
                else {
                    this.coefficients = new Uint8ClampedArray(coefficientsLength - firstNonZero);
                    for (var i = 0; i < this.coefficients.length; i++) {
                        this.coefficients[i] = coefficients[firstNonZero + i];
                    }
                }
            }
            else {
                this.coefficients = coefficients;
            }
        }
        GenericGFPoly.prototype.degree = function () {
            return this.coefficients.length - 1;
        };
        GenericGFPoly.prototype.isZero = function () {
            return this.coefficients[0] === 0;
        };
        GenericGFPoly.prototype.getCoefficient = function (degree) {
            return this.coefficients[this.coefficients.length - 1 - degree];
        };
        GenericGFPoly.prototype.addOrSubtract = function (other) {
            var _a;
            if (this.isZero()) {
                return other;
            }
            if (other.isZero()) {
                return this;
            }
            var smallerCoefficients = this.coefficients;
            var largerCoefficients = other.coefficients;
            if (smallerCoefficients.length > largerCoefficients.length) {
                _a = [largerCoefficients, smallerCoefficients], smallerCoefficients = _a[0], largerCoefficients = _a[1];
            }
            var sumDiff = new Uint8ClampedArray(largerCoefficients.length);
            var lengthDiff = largerCoefficients.length - smallerCoefficients.length;
            for (var i = 0; i < lengthDiff; i++) {
                sumDiff[i] = largerCoefficients[i];
            }
            for (var i = lengthDiff; i < largerCoefficients.length; i++) {
                sumDiff[i] = addOrSubtractGF(smallerCoefficients[i - lengthDiff], largerCoefficients[i]);
            }
            return new GenericGFPoly(this.field, sumDiff);
        };
        GenericGFPoly.prototype.multiply = function (scalar) {
            if (scalar === 0) {
                return this.field.zero;
            }
            if (scalar === 1) {
                return this;
            }
            var size = this.coefficients.length;
            var product = new Uint8ClampedArray(size);
            for (var i = 0; i < size; i++) {
                product[i] = this.field.multiply(this.coefficients[i], scalar);
            }
            return new GenericGFPoly(this.field, product);
        };
        GenericGFPoly.prototype.multiplyPoly = function (other) {
            if (this.isZero() || other.isZero()) {
                return this.field.zero;
            }
            var aCoefficients = this.coefficients;
            var aLength = aCoefficients.length;
            var bCoefficients = other.coefficients;
            var bLength = bCoefficients.length;
            var product = new Uint8ClampedArray(aLength + bLength - 1);
            for (var i = 0; i < aLength; i++) {
                var aCoeff = aCoefficients[i];
                for (var j = 0; j < bLength; j++) {
                    product[i + j] = addOrSubtractGF(product[i + j], this.field.multiply(aCoeff, bCoefficients[j]));
                }
            }
            return new GenericGFPoly(this.field, product);
        };
        GenericGFPoly.prototype.multiplyByMonomial = function (degree, coefficient) {
            if (degree < 0) {
                throw 'invalid degree less than 0';
            }
            if (coefficient === 0) {
                return this.field.zero;
            }
            var size = this.coefficients.length;
            var product = new Uint8ClampedArray(size + degree);
            for (var i = 0; i < size; i++) {
                product[i] = this.field.multiply(this.coefficients[i], coefficient);
            }
            return new GenericGFPoly(this.field, product);
        };
        GenericGFPoly.prototype.evaluateAt = function (a) {
            var result = 0;
            if (a === 0) {
                // Just return the x^0 coefficient
                return this.getCoefficient(0);
            }
            var size = this.coefficients.length;
            if (a === 1) {
                // Just the sum of the coefficients
                this.coefficients.forEach(function (coefficient) {
                    result = addOrSubtractGF(result, coefficient);
                });
                return result;
            }
            result = this.coefficients[0];
            for (var i = 1; i < size; i++) {
                result = addOrSubtractGF(this.field.multiply(a, result), this.coefficients[i]);
            }
            return result;
        };
        return GenericGFPoly;
    }());

    /**
     * @module GenericGF
     * @author nuintun
     * @author Cosmo Wolfe
     */
    function addOrSubtractGF(a, b) {
        return a ^ b;
    }
    var GenericGF = /*#__PURE__*/ (function () {
        function GenericGF(primitive, size, generatorBase) {
            this.primitive = primitive;
            this.size = size;
            this.generatorBase = generatorBase;
            this.expTable = [];
            this.logTable = [];
            var x = 1;
            for (var i = 0; i < this.size; i++) {
                this.logTable[i] = 0;
                this.expTable[i] = x;
                x = x * 2;
                if (x >= this.size) {
                    x = (x ^ this.primitive) & (this.size - 1);
                }
            }
            for (var i = 0; i < this.size - 1; i++) {
                this.logTable[this.expTable[i]] = i;
            }
            this.zero = new GenericGFPoly(this, Uint8ClampedArray.from([0]));
            this.one = new GenericGFPoly(this, Uint8ClampedArray.from([1]));
        }
        GenericGF.prototype.multiply = function (a, b) {
            if (a === 0 || b === 0) {
                return 0;
            }
            return this.expTable[(this.logTable[a] + this.logTable[b]) % (this.size - 1)];
        };
        GenericGF.prototype.inverse = function (a) {
            if (a === 0) {
                throw "can't invert 0";
            }
            return this.expTable[this.size - this.logTable[a] - 1];
        };
        GenericGF.prototype.buildMonomial = function (degree, coefficient) {
            if (degree < 0) {
                throw 'invalid monomial degree less than 0';
            }
            if (coefficient === 0) {
                return this.zero;
            }
            var coefficients = new Uint8ClampedArray(degree + 1);
            coefficients[0] = coefficient;
            return new GenericGFPoly(this, coefficients);
        };
        GenericGF.prototype.log = function (a) {
            if (a === 0) {
                throw "can't take log(0)";
            }
            return this.logTable[a];
        };
        GenericGF.prototype.exp = function (a) {
            return this.expTable[a];
        };
        return GenericGF;
    }());

    /**
     * @module index
     * @author nuintun
     * @author Cosmo Wolfe
     */
    function runEuclideanAlgorithm(field, a, b, R) {
        var _a;
        // Assume a's degree is >= b's
        if (a.degree() < b.degree()) {
            _a = [b, a], a = _a[0], b = _a[1];
        }
        var rLast = a;
        var r = b;
        var tLast = field.zero;
        var t = field.one;
        // Run Euclidean algorithm until r's degree is less than R/2
        while (r.degree() >= R / 2) {
            var rLastLast = rLast;
            var tLastLast = tLast;
            rLast = r;
            tLast = t;
            // Divide rLastLast by rLast, with quotient in q and remainder in r
            if (rLast.isZero()) {
                // Euclidean algorithm already terminated?
                return null;
            }
            r = rLastLast;
            var q = field.zero;
            var denominatorLeadingTerm = rLast.getCoefficient(rLast.degree());
            var dltInverse = field.inverse(denominatorLeadingTerm);
            while (r.degree() >= rLast.degree() && !r.isZero()) {
                var degreeDiff = r.degree() - rLast.degree();
                var scale = field.multiply(r.getCoefficient(r.degree()), dltInverse);
                q = q.addOrSubtract(field.buildMonomial(degreeDiff, scale));
                r = r.addOrSubtract(rLast.multiplyByMonomial(degreeDiff, scale));
            }
            t = q.multiplyPoly(tLast).addOrSubtract(tLastLast);
            if (r.degree() >= rLast.degree()) {
                return null;
            }
        }
        var sigmaTildeAtZero = t.getCoefficient(0);
        if (sigmaTildeAtZero === 0) {
            return null;
        }
        var inverse = field.inverse(sigmaTildeAtZero);
        return [t.multiply(inverse), r.multiply(inverse)];
    }
    function findErrorLocations(field, errorLocator) {
        // This is a direct application of Chien's search
        var numErrors = errorLocator.degree();
        if (numErrors === 1) {
            return [errorLocator.getCoefficient(1)];
        }
        var errorCount = 0;
        var result = new Array(numErrors);
        for (var i = 1; i < field.size && errorCount < numErrors; i++) {
            if (errorLocator.evaluateAt(i) === 0) {
                result[errorCount] = field.inverse(i);
                errorCount++;
            }
        }
        if (errorCount !== numErrors) {
            return null;
        }
        return result;
    }
    function findErrorMagnitudes(field, errorEvaluator, errorLocations) {
        // This is directly applying Forney's Formula
        var s = errorLocations.length;
        var result = new Array(s);
        for (var i = 0; i < s; i++) {
            var denominator = 1;
            var xiInverse = field.inverse(errorLocations[i]);
            for (var j = 0; j < s; j++) {
                if (i !== j) {
                    denominator = field.multiply(denominator, addOrSubtractGF(1, field.multiply(errorLocations[j], xiInverse)));
                }
            }
            result[i] = field.multiply(errorEvaluator.evaluateAt(xiInverse), field.inverse(denominator));
            if (field.generatorBase !== 0) {
                result[i] = field.multiply(result[i], xiInverse);
            }
        }
        return result;
    }
    function rsDecode(bytes, twoS) {
        var outputBytes = new Uint8ClampedArray(bytes.length);
        outputBytes.set(bytes);
        var field = new GenericGF(0x011d, 256, 0); // x^8 + x^4 + x^3 + x^2 + 1
        var poly = new GenericGFPoly(field, outputBytes);
        var syndromeCoefficients = new Uint8ClampedArray(twoS);
        var error = false;
        for (var s = 0; s < twoS; s++) {
            var evaluation = poly.evaluateAt(field.exp(s + field.generatorBase));
            syndromeCoefficients[syndromeCoefficients.length - 1 - s] = evaluation;
            if (evaluation !== 0) {
                error = true;
            }
        }
        if (!error) {
            return outputBytes;
        }
        var syndrome = new GenericGFPoly(field, syndromeCoefficients);
        var sigmaOmega = runEuclideanAlgorithm(field, field.buildMonomial(twoS, 1), syndrome, twoS);
        if (sigmaOmega === null) {
            return null;
        }
        var errorLocations = findErrorLocations(field, sigmaOmega[0]);
        if (errorLocations == null) {
            return null;
        }
        var errorMagnitudes = findErrorMagnitudes(field, sigmaOmega[1], errorLocations);
        for (var i = 0; i < errorLocations.length; i++) {
            var position = outputBytes.length - 1 - field.log(errorLocations[i]);
            if (position < 0) {
                return null;
            }
            outputBytes[position] = addOrSubtractGF(outputBytes[position], errorMagnitudes[i]);
        }
        return outputBytes;
    }

    /**
     * @module BitMatrix
     * @author nuintun
     * @author Cosmo Wolfe
     */
    var BitMatrix = /*#__PURE__*/ (function () {
        function BitMatrix(data, width) {
            this.data = data;
            this.width = width;
            this.height = data.length / width;
        }
        BitMatrix.createEmpty = function (width, height) {
            return new BitMatrix(new Uint8ClampedArray(width * height), width);
        };
        BitMatrix.prototype.get = function (x, y) {
            if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
                return false;
            }
            return !!this.data[y * this.width + x];
        };
        BitMatrix.prototype.set = function (x, y, v) {
            this.data[y * this.width + x] = v ? 1 : 0;
        };
        BitMatrix.prototype.setRegion = function (left, top, width, height, v) {
            for (var y = top; y < top + height; y++) {
                for (var x = left; x < left + width; x++) {
                    this.set(x, y, !!v);
                }
            }
        };
        return BitMatrix;
    }());

    /**
     * @module BitStream
     * @author nuintun
     * @author Cosmo Wolfe
     */
    var BitStream = /*#__PURE__*/ (function () {
        function BitStream(bytes) {
            this.byteOffset = 0;
            this.bitOffset = 0;
            this.bytes = bytes;
        }
        BitStream.prototype.readBits = function (numBits) {
            if (numBits < 1 || numBits > 32 || numBits > this.available()) {
                throw "can't read " + numBits + " bits";
            }
            var result = 0;
            // First, read remainder from current byte
            if (this.bitOffset > 0) {
                var bitsLeft = 8 - this.bitOffset;
                var toRead = numBits < bitsLeft ? numBits : bitsLeft;
                var bitsToNotRead = bitsLeft - toRead;
                var mask = (0xff >> (8 - toRead)) << bitsToNotRead;
                result = (this.bytes[this.byteOffset] & mask) >> bitsToNotRead;
                numBits -= toRead;
                this.bitOffset += toRead;
                if (this.bitOffset === 8) {
                    this.bitOffset = 0;
                    this.byteOffset++;
                }
            }
            // Next read whole bytes
            if (numBits > 0) {
                while (numBits >= 8) {
                    result = (result << 8) | (this.bytes[this.byteOffset] & 0xff);
                    this.byteOffset++;
                    numBits -= 8;
                }
                // Finally read a partial byte
                if (numBits > 0) {
                    var bitsToNotRead = 8 - numBits;
                    var mask = (0xff >> bitsToNotRead) << bitsToNotRead;
                    result = (result << numBits) | ((this.bytes[this.byteOffset] & mask) >> bitsToNotRead);
                    this.bitOffset += numBits;
                }
            }
            return result;
        };
        BitStream.prototype.available = function () {
            return 8 * (this.bytes.length - this.byteOffset) - this.bitOffset;
        };
        return BitStream;
    }());

    /**
     * @module SJIS
     * @author nuintun
     * @author soldair
     * @author Kazuhiko Arase
     * @see https://github.com/soldair/node-qrcode/blob/master/helper/to-sjis.js
     */
    // prettier-ignore
    var SJIS_UTF8_TABLE = [
        [0x8140, '　、。，．・：；？！゛゜´｀¨＾￣＿ヽヾゝゞ〃仝々〆〇ー―‐／＼～∥｜…‥‘’“”（）〔〕［］｛｝〈〉《》「」『』【】＋－±×'],
        [0x8180, '÷＝≠＜＞'],
        [0x818f, '￥＄￠￡％＃＆＊＠§☆★'],
        [0x81a6, '※〒→←↑↓〓'],
        [0x81ca, '￢'],
        [0x824f, '０１２３４５６７８９'],
        [0x8260, 'ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ'],
        [0x8281, 'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ'],
        [0x829f, 'ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをん'],
        [0x8340, 'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミ'],
        [0x8380, 'ムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ'],
        [0x839f, 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'],
        [0x83bf, 'αβγδεζηθικλμνξοπρστυφχψω'],
        [0x8440, 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'],
        [0x8470, 'абвгдеёжзийклмн'],
        [0x8480, 'опрстуфхцчшщъыьэюя'],
        [0x8780, '〝〟'],
        [0x8940, '院陰隠韻吋右宇烏羽迂雨卯鵜窺丑碓臼渦嘘唄欝蔚鰻姥厩浦瓜閏噂云運雲荏餌叡営嬰影映曳栄永泳洩瑛盈穎頴英衛詠鋭液疫益駅悦謁越閲榎厭円'],
        [0x8980, '園堰奄宴延怨掩援沿演炎焔煙燕猿縁艶苑薗遠鉛鴛塩於汚甥凹央奥往応押旺横欧殴王翁襖鴬鴎黄岡沖荻億屋憶臆桶牡乙俺卸恩温穏音下化仮何伽価佳加可嘉夏嫁家寡科暇果架歌河火珂禍禾稼箇花苛茄荷華菓蝦課嘩貨迦過霞蚊俄峨我牙画臥芽蛾賀雅餓駕介会解回塊壊廻快怪悔恢懐戒拐改'],
        [0x8a40, '魁晦械海灰界皆絵芥蟹開階貝凱劾外咳害崖慨概涯碍蓋街該鎧骸浬馨蛙垣柿蛎鈎劃嚇各廓拡撹格核殻獲確穫覚角赫較郭閣隔革学岳楽額顎掛笠樫'],
        [0x8a80, '橿梶鰍潟割喝恰括活渇滑葛褐轄且鰹叶椛樺鞄株兜竃蒲釜鎌噛鴨栢茅萱粥刈苅瓦乾侃冠寒刊勘勧巻喚堪姦完官寛干幹患感慣憾換敢柑桓棺款歓汗漢澗潅環甘監看竿管簡緩缶翰肝艦莞観諌貫還鑑間閑関陥韓館舘丸含岸巌玩癌眼岩翫贋雁頑顔願企伎危喜器基奇嬉寄岐希幾忌揮机旗既期棋棄'],
        [0x8b40, '機帰毅気汽畿祈季稀紀徽規記貴起軌輝飢騎鬼亀偽儀妓宜戯技擬欺犠疑祇義蟻誼議掬菊鞠吉吃喫桔橘詰砧杵黍却客脚虐逆丘久仇休及吸宮弓急救'],
        [0x8b80, '朽求汲泣灸球究窮笈級糾給旧牛去居巨拒拠挙渠虚許距鋸漁禦魚亨享京供侠僑兇競共凶協匡卿叫喬境峡強彊怯恐恭挟教橋況狂狭矯胸脅興蕎郷鏡響饗驚仰凝尭暁業局曲極玉桐粁僅勤均巾錦斤欣欽琴禁禽筋緊芹菌衿襟謹近金吟銀九倶句区狗玖矩苦躯駆駈駒具愚虞喰空偶寓遇隅串櫛釧屑屈'],
        [0x8c40, '掘窟沓靴轡窪熊隈粂栗繰桑鍬勲君薫訓群軍郡卦袈祁係傾刑兄啓圭珪型契形径恵慶慧憩掲携敬景桂渓畦稽系経継繋罫茎荊蛍計詣警軽頚鶏芸迎鯨'],
        [0x8c80, '劇戟撃激隙桁傑欠決潔穴結血訣月件倹倦健兼券剣喧圏堅嫌建憲懸拳捲検権牽犬献研硯絹県肩見謙賢軒遣鍵険顕験鹸元原厳幻弦減源玄現絃舷言諺限乎個古呼固姑孤己庫弧戸故枯湖狐糊袴股胡菰虎誇跨鈷雇顧鼓五互伍午呉吾娯後御悟梧檎瑚碁語誤護醐乞鯉交佼侯候倖光公功効勾厚口向'],
        [0x8d40, '后喉坑垢好孔孝宏工巧巷幸広庚康弘恒慌抗拘控攻昂晃更杭校梗構江洪浩港溝甲皇硬稿糠紅紘絞綱耕考肯肱腔膏航荒行衡講貢購郊酵鉱砿鋼閤降'],
        [0x8d80, '項香高鴻剛劫号合壕拷濠豪轟麹克刻告国穀酷鵠黒獄漉腰甑忽惚骨狛込此頃今困坤墾婚恨懇昏昆根梱混痕紺艮魂些佐叉唆嵯左差査沙瑳砂詐鎖裟坐座挫債催再最哉塞妻宰彩才採栽歳済災采犀砕砦祭斎細菜裁載際剤在材罪財冴坂阪堺榊肴咲崎埼碕鷺作削咋搾昨朔柵窄策索錯桜鮭笹匙冊刷'],
        [0x8e40, '察拶撮擦札殺薩雑皐鯖捌錆鮫皿晒三傘参山惨撒散桟燦珊産算纂蚕讃賛酸餐斬暫残仕仔伺使刺司史嗣四士始姉姿子屍市師志思指支孜斯施旨枝止'],
        [0x8e80, '死氏獅祉私糸紙紫肢脂至視詞詩試誌諮資賜雌飼歯事似侍児字寺慈持時次滋治爾璽痔磁示而耳自蒔辞汐鹿式識鴫竺軸宍雫七叱執失嫉室悉湿漆疾質実蔀篠偲柴芝屡蕊縞舎写射捨赦斜煮社紗者謝車遮蛇邪借勺尺杓灼爵酌釈錫若寂弱惹主取守手朱殊狩珠種腫趣酒首儒受呪寿授樹綬需囚収周'],
        [0x8f40, '宗就州修愁拾洲秀秋終繍習臭舟蒐衆襲讐蹴輯週酋酬集醜什住充十従戎柔汁渋獣縦重銃叔夙宿淑祝縮粛塾熟出術述俊峻春瞬竣舜駿准循旬楯殉淳'],
        [0x8f80, '準潤盾純巡遵醇順処初所暑曙渚庶緒署書薯藷諸助叙女序徐恕鋤除傷償勝匠升召哨商唱嘗奨妾娼宵将小少尚庄床廠彰承抄招掌捷昇昌昭晶松梢樟樵沼消渉湘焼焦照症省硝礁祥称章笑粧紹肖菖蒋蕉衝裳訟証詔詳象賞醤鉦鍾鐘障鞘上丈丞乗冗剰城場壌嬢常情擾条杖浄状畳穣蒸譲醸錠嘱埴飾'],
        [0x9040, '拭植殖燭織職色触食蝕辱尻伸信侵唇娠寝審心慎振新晋森榛浸深申疹真神秦紳臣芯薪親診身辛進針震人仁刃塵壬尋甚尽腎訊迅陣靭笥諏須酢図厨'],
        [0x9080, '逗吹垂帥推水炊睡粋翠衰遂酔錐錘随瑞髄崇嵩数枢趨雛据杉椙菅頗雀裾澄摺寸世瀬畝是凄制勢姓征性成政整星晴棲栖正清牲生盛精聖声製西誠誓請逝醒青静斉税脆隻席惜戚斥昔析石積籍績脊責赤跡蹟碩切拙接摂折設窃節説雪絶舌蝉仙先千占宣専尖川戦扇撰栓栴泉浅洗染潜煎煽旋穿箭線'],
        [0x9140, '繊羨腺舛船薦詮賎践選遷銭銑閃鮮前善漸然全禅繕膳糎噌塑岨措曾曽楚狙疏疎礎祖租粗素組蘇訴阻遡鼠僧創双叢倉喪壮奏爽宋層匝惣想捜掃挿掻'],
        [0x9180, '操早曹巣槍槽漕燥争痩相窓糟総綜聡草荘葬蒼藻装走送遭鎗霜騒像増憎臓蔵贈造促側則即息捉束測足速俗属賊族続卒袖其揃存孫尊損村遜他多太汰詑唾堕妥惰打柁舵楕陀駄騨体堆対耐岱帯待怠態戴替泰滞胎腿苔袋貸退逮隊黛鯛代台大第醍題鷹滝瀧卓啄宅托択拓沢濯琢託鐸濁諾茸凧蛸只'],
        [0x9240, '叩但達辰奪脱巽竪辿棚谷狸鱈樽誰丹単嘆坦担探旦歎淡湛炭短端箪綻耽胆蛋誕鍛団壇弾断暖檀段男談値知地弛恥智池痴稚置致蜘遅馳築畜竹筑蓄'],
        [0x9280, '逐秩窒茶嫡着中仲宙忠抽昼柱注虫衷註酎鋳駐樗瀦猪苧著貯丁兆凋喋寵帖帳庁弔張彫徴懲挑暢朝潮牒町眺聴脹腸蝶調諜超跳銚長頂鳥勅捗直朕沈珍賃鎮陳津墜椎槌追鎚痛通塚栂掴槻佃漬柘辻蔦綴鍔椿潰坪壷嬬紬爪吊釣鶴亭低停偵剃貞呈堤定帝底庭廷弟悌抵挺提梯汀碇禎程締艇訂諦蹄逓'],
        [0x9340, '邸鄭釘鼎泥摘擢敵滴的笛適鏑溺哲徹撤轍迭鉄典填天展店添纏甜貼転顛点伝殿澱田電兎吐堵塗妬屠徒斗杜渡登菟賭途都鍍砥砺努度土奴怒倒党冬'],
        [0x9380, '凍刀唐塔塘套宕島嶋悼投搭東桃梼棟盗淘湯涛灯燈当痘祷等答筒糖統到董蕩藤討謄豆踏逃透鐙陶頭騰闘働動同堂導憧撞洞瞳童胴萄道銅峠鴇匿得徳涜特督禿篤毒独読栃橡凸突椴届鳶苫寅酉瀞噸屯惇敦沌豚遁頓呑曇鈍奈那内乍凪薙謎灘捺鍋楢馴縄畷南楠軟難汝二尼弐迩匂賑肉虹廿日乳入'],
        [0x9440, '如尿韮任妊忍認濡禰祢寧葱猫熱年念捻撚燃粘乃廼之埜嚢悩濃納能脳膿農覗蚤巴把播覇杷波派琶破婆罵芭馬俳廃拝排敗杯盃牌背肺輩配倍培媒梅'],
        [0x9480, '楳煤狽買売賠陪這蝿秤矧萩伯剥博拍柏泊白箔粕舶薄迫曝漠爆縛莫駁麦函箱硲箸肇筈櫨幡肌畑畠八鉢溌発醗髪伐罰抜筏閥鳩噺塙蛤隼伴判半反叛帆搬斑板氾汎版犯班畔繁般藩販範釆煩頒飯挽晩番盤磐蕃蛮匪卑否妃庇彼悲扉批披斐比泌疲皮碑秘緋罷肥被誹費避非飛樋簸備尾微枇毘琵眉美'],
        [0x9540, '鼻柊稗匹疋髭彦膝菱肘弼必畢筆逼桧姫媛紐百謬俵彪標氷漂瓢票表評豹廟描病秒苗錨鋲蒜蛭鰭品彬斌浜瀕貧賓頻敏瓶不付埠夫婦富冨布府怖扶敷'],
        [0x9580, '斧普浮父符腐膚芙譜負賦赴阜附侮撫武舞葡蕪部封楓風葺蕗伏副復幅服福腹複覆淵弗払沸仏物鮒分吻噴墳憤扮焚奮粉糞紛雰文聞丙併兵塀幣平弊柄並蔽閉陛米頁僻壁癖碧別瞥蔑箆偏変片篇編辺返遍便勉娩弁鞭保舗鋪圃捕歩甫補輔穂募墓慕戊暮母簿菩倣俸包呆報奉宝峰峯崩庖抱捧放方朋'],
        [0x9640, '法泡烹砲縫胞芳萌蓬蜂褒訪豊邦鋒飽鳳鵬乏亡傍剖坊妨帽忘忙房暴望某棒冒紡肪膨謀貌貿鉾防吠頬北僕卜墨撲朴牧睦穆釦勃没殆堀幌奔本翻凡盆'],
        [0x9680, '摩磨魔麻埋妹昧枚毎哩槙幕膜枕鮪柾鱒桝亦俣又抹末沫迄侭繭麿万慢満漫蔓味未魅巳箕岬密蜜湊蓑稔脈妙粍民眠務夢無牟矛霧鵡椋婿娘冥名命明盟迷銘鳴姪牝滅免棉綿緬面麺摸模茂妄孟毛猛盲網耗蒙儲木黙目杢勿餅尤戻籾貰問悶紋門匁也冶夜爺耶野弥矢厄役約薬訳躍靖柳薮鑓愉愈油癒'],
        [0x9740, '諭輸唯佑優勇友宥幽悠憂揖有柚湧涌猶猷由祐裕誘遊邑郵雄融夕予余与誉輿預傭幼妖容庸揚揺擁曜楊様洋溶熔用窯羊耀葉蓉要謡踊遥陽養慾抑欲'],
        [0x9780, '沃浴翌翼淀羅螺裸来莱頼雷洛絡落酪乱卵嵐欄濫藍蘭覧利吏履李梨理璃痢裏裡里離陸律率立葎掠略劉流溜琉留硫粒隆竜龍侶慮旅虜了亮僚両凌寮料梁涼猟療瞭稜糧良諒遼量陵領力緑倫厘林淋燐琳臨輪隣鱗麟瑠塁涙累類令伶例冷励嶺怜玲礼苓鈴隷零霊麗齢暦歴列劣烈裂廉恋憐漣煉簾練聯'],
        [0x9840, '蓮連錬呂魯櫓炉賂路露労婁廊弄朗楼榔浪漏牢狼篭老聾蝋郎六麓禄肋録論倭和話歪賄脇惑枠鷲亙亘鰐詫藁蕨椀湾碗腕'],
        [0x989f, '弌丐丕个丱丶丼丿乂乖乘亂亅豫亊舒弍于亞亟亠亢亰亳亶从仍仄仆仂仗仞仭仟价伉佚估佛佝佗佇佶侈侏侘佻佩佰侑佯來侖儘俔俟俎俘俛俑俚俐俤俥倚倨倔倪倥倅伜俶倡倩倬俾俯們倆偃假會偕偐偈做偖偬偸傀傚傅傴傲'],
        [0x9940, '僉僊傳僂僖僞僥僭僣僮價僵儉儁儂儖儕儔儚儡儺儷儼儻儿兀兒兌兔兢竸兩兪兮冀冂囘册冉冏冑冓冕冖冤冦冢冩冪冫决冱冲冰况冽凅凉凛几處凩凭'],
        [0x9980, '凰凵凾刄刋刔刎刧刪刮刳刹剏剄剋剌剞剔剪剴剩剳剿剽劍劔劒剱劈劑辨辧劬劭劼劵勁勍勗勞勣勦飭勠勳勵勸勹匆匈甸匍匐匏匕匚匣匯匱匳匸區卆卅丗卉卍凖卞卩卮夘卻卷厂厖厠厦厥厮厰厶參簒雙叟曼燮叮叨叭叺吁吽呀听吭吼吮吶吩吝呎咏呵咎呟呱呷呰咒呻咀呶咄咐咆哇咢咸咥咬哄哈咨'],
        [0x9a40, '咫哂咤咾咼哘哥哦唏唔哽哮哭哺哢唹啀啣啌售啜啅啖啗唸唳啝喙喀咯喊喟啻啾喘喞單啼喃喩喇喨嗚嗅嗟嗄嗜嗤嗔嘔嗷嘖嗾嗽嘛嗹噎噐營嘴嘶嘲嘸'],
        [0x9a80, '噫噤嘯噬噪嚆嚀嚊嚠嚔嚏嚥嚮嚶嚴囂嚼囁囃囀囈囎囑囓囗囮囹圀囿圄圉圈國圍圓團圖嗇圜圦圷圸坎圻址坏坩埀垈坡坿垉垓垠垳垤垪垰埃埆埔埒埓堊埖埣堋堙堝塲堡塢塋塰毀塒堽塹墅墹墟墫墺壞墻墸墮壅壓壑壗壙壘壥壜壤壟壯壺壹壻壼壽夂夊夐夛梦夥夬夭夲夸夾竒奕奐奎奚奘奢奠奧奬奩'],
        [0x9b40, '奸妁妝佞侫妣妲姆姨姜妍姙姚娥娟娑娜娉娚婀婬婉娵娶婢婪媚媼媾嫋嫂媽嫣嫗嫦嫩嫖嫺嫻嬌嬋嬖嬲嫐嬪嬶嬾孃孅孀孑孕孚孛孥孩孰孳孵學斈孺宀'],
        [0x9b80, '它宦宸寃寇寉寔寐寤實寢寞寥寫寰寶寳尅將專對尓尠尢尨尸尹屁屆屎屓屐屏孱屬屮乢屶屹岌岑岔妛岫岻岶岼岷峅岾峇峙峩峽峺峭嶌峪崋崕崗嵜崟崛崑崔崢崚崙崘嵌嵒嵎嵋嵬嵳嵶嶇嶄嶂嶢嶝嶬嶮嶽嶐嶷嶼巉巍巓巒巖巛巫已巵帋帚帙帑帛帶帷幄幃幀幎幗幔幟幢幤幇幵并幺麼广庠廁廂廈廐廏'],
        [0x9c40, '廖廣廝廚廛廢廡廨廩廬廱廳廰廴廸廾弃弉彝彜弋弑弖弩弭弸彁彈彌彎弯彑彖彗彙彡彭彳彷徃徂彿徊很徑徇從徙徘徠徨徭徼忖忻忤忸忱忝悳忿怡恠'],
        [0x9c80, '怙怐怩怎怱怛怕怫怦怏怺恚恁恪恷恟恊恆恍恣恃恤恂恬恫恙悁悍惧悃悚悄悛悖悗悒悧悋惡悸惠惓悴忰悽惆悵惘慍愕愆惶惷愀惴惺愃愡惻惱愍愎慇愾愨愧慊愿愼愬愴愽慂慄慳慷慘慙慚慫慴慯慥慱慟慝慓慵憙憖憇憬憔憚憊憑憫憮懌懊應懷懈懃懆憺懋罹懍懦懣懶懺懴懿懽懼懾戀戈戉戍戌戔戛'],
        [0x9d40, '戞戡截戮戰戲戳扁扎扞扣扛扠扨扼抂抉找抒抓抖拔抃抔拗拑抻拏拿拆擔拈拜拌拊拂拇抛拉挌拮拱挧挂挈拯拵捐挾捍搜捏掖掎掀掫捶掣掏掉掟掵捫'],
        [0x9d80, '捩掾揩揀揆揣揉插揶揄搖搴搆搓搦搶攝搗搨搏摧摯摶摎攪撕撓撥撩撈撼據擒擅擇撻擘擂擱擧舉擠擡抬擣擯攬擶擴擲擺攀擽攘攜攅攤攣攫攴攵攷收攸畋效敖敕敍敘敞敝敲數斂斃變斛斟斫斷旃旆旁旄旌旒旛旙无旡旱杲昊昃旻杳昵昶昴昜晏晄晉晁晞晝晤晧晨晟晢晰暃暈暎暉暄暘暝曁暹曉暾暼'],
        [0x9e40, '曄暸曖曚曠昿曦曩曰曵曷朏朖朞朦朧霸朮朿朶杁朸朷杆杞杠杙杣杤枉杰枩杼杪枌枋枦枡枅枷柯枴柬枳柩枸柤柞柝柢柮枹柎柆柧檜栞框栩桀桍栲桎'],
        [0x9e80, '梳栫桙档桷桿梟梏梭梔條梛梃檮梹桴梵梠梺椏梍桾椁棊椈棘椢椦棡椌棍棔棧棕椶椒椄棗棣椥棹棠棯椨椪椚椣椡棆楹楷楜楸楫楔楾楮椹楴椽楙椰楡楞楝榁楪榲榮槐榿槁槓榾槎寨槊槝榻槃榧樮榑榠榜榕榴槞槨樂樛槿權槹槲槧樅榱樞槭樔槫樊樒櫁樣樓橄樌橲樶橸橇橢橙橦橈樸樢檐檍檠檄檢檣'],
        [0x9f40, '檗蘗檻櫃櫂檸檳檬櫞櫑櫟檪櫚櫪櫻欅蘖櫺欒欖鬱欟欸欷盜欹飮歇歃歉歐歙歔歛歟歡歸歹歿殀殄殃殍殘殕殞殤殪殫殯殲殱殳殷殼毆毋毓毟毬毫毳毯'],
        [0x9f80, '麾氈氓气氛氤氣汞汕汢汪沂沍沚沁沛汾汨汳沒沐泄泱泓沽泗泅泝沮沱沾沺泛泯泙泪洟衍洶洫洽洸洙洵洳洒洌浣涓浤浚浹浙涎涕濤涅淹渕渊涵淇淦涸淆淬淞淌淨淒淅淺淙淤淕淪淮渭湮渮渙湲湟渾渣湫渫湶湍渟湃渺湎渤滿渝游溂溪溘滉溷滓溽溯滄溲滔滕溏溥滂溟潁漑灌滬滸滾漿滲漱滯漲滌'],
        [0xe040, '漾漓滷澆潺潸澁澀潯潛濳潭澂潼潘澎澑濂潦澳澣澡澤澹濆澪濟濕濬濔濘濱濮濛瀉瀋濺瀑瀁瀏濾瀛瀚潴瀝瀘瀟瀰瀾瀲灑灣炙炒炯烱炬炸炳炮烟烋烝'],
        [0xe080, '烙焉烽焜焙煥煕熈煦煢煌煖煬熏燻熄熕熨熬燗熹熾燒燉燔燎燠燬燧燵燼燹燿爍爐爛爨爭爬爰爲爻爼爿牀牆牋牘牴牾犂犁犇犒犖犢犧犹犲狃狆狄狎狒狢狠狡狹狷倏猗猊猜猖猝猴猯猩猥猾獎獏默獗獪獨獰獸獵獻獺珈玳珎玻珀珥珮珞璢琅瑯琥珸琲琺瑕琿瑟瑙瑁瑜瑩瑰瑣瑪瑶瑾璋璞璧瓊瓏瓔珱'],
        [0xe140, '瓠瓣瓧瓩瓮瓲瓰瓱瓸瓷甄甃甅甌甎甍甕甓甞甦甬甼畄畍畊畉畛畆畚畩畤畧畫畭畸當疆疇畴疊疉疂疔疚疝疥疣痂疳痃疵疽疸疼疱痍痊痒痙痣痞痾痿'],
        [0xe180, '痼瘁痰痺痲痳瘋瘍瘉瘟瘧瘠瘡瘢瘤瘴瘰瘻癇癈癆癜癘癡癢癨癩癪癧癬癰癲癶癸發皀皃皈皋皎皖皓皙皚皰皴皸皹皺盂盍盖盒盞盡盥盧盪蘯盻眈眇眄眩眤眞眥眦眛眷眸睇睚睨睫睛睥睿睾睹瞎瞋瞑瞠瞞瞰瞶瞹瞿瞼瞽瞻矇矍矗矚矜矣矮矼砌砒礦砠礪硅碎硴碆硼碚碌碣碵碪碯磑磆磋磔碾碼磅磊磬'],
        [0xe240, '磧磚磽磴礇礒礑礙礬礫祀祠祗祟祚祕祓祺祿禊禝禧齋禪禮禳禹禺秉秕秧秬秡秣稈稍稘稙稠稟禀稱稻稾稷穃穗穉穡穢穩龝穰穹穽窈窗窕窘窖窩竈窰'],
        [0xe280, '窶竅竄窿邃竇竊竍竏竕竓站竚竝竡竢竦竭竰笂笏笊笆笳笘笙笞笵笨笶筐筺笄筍笋筌筅筵筥筴筧筰筱筬筮箝箘箟箍箜箚箋箒箏筝箙篋篁篌篏箴篆篝篩簑簔篦篥籠簀簇簓篳篷簗簍篶簣簧簪簟簷簫簽籌籃籔籏籀籐籘籟籤籖籥籬籵粃粐粤粭粢粫粡粨粳粲粱粮粹粽糀糅糂糘糒糜糢鬻糯糲糴糶糺紆'],
        [0xe340, '紂紜紕紊絅絋紮紲紿紵絆絳絖絎絲絨絮絏絣經綉絛綏絽綛綺綮綣綵緇綽綫總綢綯緜綸綟綰緘緝緤緞緻緲緡縅縊縣縡縒縱縟縉縋縢繆繦縻縵縹繃縷'],
        [0xe380, '縲縺繧繝繖繞繙繚繹繪繩繼繻纃緕繽辮繿纈纉續纒纐纓纔纖纎纛纜缸缺罅罌罍罎罐网罕罔罘罟罠罨罩罧罸羂羆羃羈羇羌羔羞羝羚羣羯羲羹羮羶羸譱翅翆翊翕翔翡翦翩翳翹飜耆耄耋耒耘耙耜耡耨耿耻聊聆聒聘聚聟聢聨聳聲聰聶聹聽聿肄肆肅肛肓肚肭冐肬胛胥胙胝胄胚胖脉胯胱脛脩脣脯腋'],
        [0xe440, '隋腆脾腓腑胼腱腮腥腦腴膃膈膊膀膂膠膕膤膣腟膓膩膰膵膾膸膽臀臂膺臉臍臑臙臘臈臚臟臠臧臺臻臾舁舂舅與舊舍舐舖舩舫舸舳艀艙艘艝艚艟艤'],
        [0xe480, '艢艨艪艫舮艱艷艸艾芍芒芫芟芻芬苡苣苟苒苴苳苺莓范苻苹苞茆苜茉苙茵茴茖茲茱荀茹荐荅茯茫茗茘莅莚莪莟莢莖茣莎莇莊荼莵荳荵莠莉莨菴萓菫菎菽萃菘萋菁菷萇菠菲萍萢萠莽萸蔆菻葭萪萼蕚蒄葷葫蒭葮蒂葩葆萬葯葹萵蓊葢蒹蒿蒟蓙蓍蒻蓚蓐蓁蓆蓖蒡蔡蓿蓴蔗蔘蔬蔟蔕蔔蓼蕀蕣蕘蕈'],
        [0xe540, '蕁蘂蕋蕕薀薤薈薑薊薨蕭薔薛藪薇薜蕷蕾薐藉薺藏薹藐藕藝藥藜藹蘊蘓蘋藾藺蘆蘢蘚蘰蘿虍乕虔號虧虱蚓蚣蚩蚪蚋蚌蚶蚯蛄蛆蚰蛉蠣蚫蛔蛞蛩蛬'],
        [0xe580, '蛟蛛蛯蜒蜆蜈蜀蜃蛻蜑蜉蜍蛹蜊蜴蜿蜷蜻蜥蜩蜚蝠蝟蝸蝌蝎蝴蝗蝨蝮蝙蝓蝣蝪蠅螢螟螂螯蟋螽蟀蟐雖螫蟄螳蟇蟆螻蟯蟲蟠蠏蠍蟾蟶蟷蠎蟒蠑蠖蠕蠢蠡蠱蠶蠹蠧蠻衄衂衒衙衞衢衫袁衾袞衵衽袵衲袂袗袒袮袙袢袍袤袰袿袱裃裄裔裘裙裝裹褂裼裴裨裲褄褌褊褓襃褞褥褪褫襁襄褻褶褸襌褝襠襞'],
        [0xe640, '襦襤襭襪襯襴襷襾覃覈覊覓覘覡覩覦覬覯覲覺覽覿觀觚觜觝觧觴觸訃訖訐訌訛訝訥訶詁詛詒詆詈詼詭詬詢誅誂誄誨誡誑誥誦誚誣諄諍諂諚諫諳諧'],
        [0xe680, '諤諱謔諠諢諷諞諛謌謇謚諡謖謐謗謠謳鞫謦謫謾謨譁譌譏譎證譖譛譚譫譟譬譯譴譽讀讌讎讒讓讖讙讚谺豁谿豈豌豎豐豕豢豬豸豺貂貉貅貊貍貎貔豼貘戝貭貪貽貲貳貮貶賈賁賤賣賚賽賺賻贄贅贊贇贏贍贐齎贓賍贔贖赧赭赱赳趁趙跂趾趺跏跚跖跌跛跋跪跫跟跣跼踈踉跿踝踞踐踟蹂踵踰踴蹊'],
        [0xe740, '蹇蹉蹌蹐蹈蹙蹤蹠踪蹣蹕蹶蹲蹼躁躇躅躄躋躊躓躑躔躙躪躡躬躰軆躱躾軅軈軋軛軣軼軻軫軾輊輅輕輒輙輓輜輟輛輌輦輳輻輹轅轂輾轌轉轆轎轗轜'],
        [0xe780, '轢轣轤辜辟辣辭辯辷迚迥迢迪迯邇迴逅迹迺逑逕逡逍逞逖逋逧逶逵逹迸遏遐遑遒逎遉逾遖遘遞遨遯遶隨遲邂遽邁邀邊邉邏邨邯邱邵郢郤扈郛鄂鄒鄙鄲鄰酊酖酘酣酥酩酳酲醋醉醂醢醫醯醪醵醴醺釀釁釉釋釐釖釟釡釛釼釵釶鈞釿鈔鈬鈕鈑鉞鉗鉅鉉鉤鉈銕鈿鉋鉐銜銖銓銛鉚鋏銹銷鋩錏鋺鍄錮'],
        [0xe840, '錙錢錚錣錺錵錻鍜鍠鍼鍮鍖鎰鎬鎭鎔鎹鏖鏗鏨鏥鏘鏃鏝鏐鏈鏤鐚鐔鐓鐃鐇鐐鐶鐫鐵鐡鐺鑁鑒鑄鑛鑠鑢鑞鑪鈩鑰鑵鑷鑽鑚鑼鑾钁鑿閂閇閊閔閖閘閙'],
        [0xe880, '閠閨閧閭閼閻閹閾闊濶闃闍闌闕闔闖關闡闥闢阡阨阮阯陂陌陏陋陷陜陞陝陟陦陲陬隍隘隕隗險隧隱隲隰隴隶隸隹雎雋雉雍襍雜霍雕雹霄霆霈霓霎霑霏霖霙霤霪霰霹霽霾靄靆靈靂靉靜靠靤靦靨勒靫靱靹鞅靼鞁靺鞆鞋鞏鞐鞜鞨鞦鞣鞳鞴韃韆韈韋韜韭齏韲竟韶韵頏頌頸頤頡頷頽顆顏顋顫顯顰'],
        [0xe940, '顱顴顳颪颯颱颶飄飃飆飩飫餃餉餒餔餘餡餝餞餤餠餬餮餽餾饂饉饅饐饋饑饒饌饕馗馘馥馭馮馼駟駛駝駘駑駭駮駱駲駻駸騁騏騅駢騙騫騷驅驂驀驃'],
        [0xe980, '騾驕驍驛驗驟驢驥驤驩驫驪骭骰骼髀髏髑髓體髞髟髢髣髦髯髫髮髴髱髷髻鬆鬘鬚鬟鬢鬣鬥鬧鬨鬩鬪鬮鬯鬲魄魃魏魍魎魑魘魴鮓鮃鮑鮖鮗鮟鮠鮨鮴鯀鯊鮹鯆鯏鯑鯒鯣鯢鯤鯔鯡鰺鯲鯱鯰鰕鰔鰉鰓鰌鰆鰈鰒鰊鰄鰮鰛鰥鰤鰡鰰鱇鰲鱆鰾鱚鱠鱧鱶鱸鳧鳬鳰鴉鴈鳫鴃鴆鴪鴦鶯鴣鴟鵄鴕鴒鵁鴿鴾鵆鵈'],
        [0xea40, '鵝鵞鵤鵑鵐鵙鵲鶉鶇鶫鵯鵺鶚鶤鶩鶲鷄鷁鶻鶸鶺鷆鷏鷂鷙鷓鷸鷦鷭鷯鷽鸚鸛鸞鹵鹹鹽麁麈麋麌麒麕麑麝麥麩麸麪麭靡黌黎黏黐黔黜點黝黠黥黨黯'],
        [0xea80, '黴黶黷黹黻黼黽鼇鼈皷鼕鼡鼬鼾齊齒齔齣齟齠齡齦齧齬齪齷齲齶龕龜龠堯槇遙瑤凜熙']
    ];
    var tables;
    /**
     * @function getTables
     * @returns {SJISTables}
     */
    function getTables() {
        if (!tables) {
            var UTF8_TO_SJIS = {};
            var SJIS_TO_UTF8 = {};
            var tLength = SJIS_UTF8_TABLE.length;
            for (var i = 0; i < tLength; i++) {
                var mapItem = SJIS_UTF8_TABLE[i];
                var kanji = mapItem[1];
                var kLength = kanji.length;
                for (var j = 0; j < kLength; j++) {
                    var kCode = mapItem[0] + j;
                    var uCode = kanji.charAt(j).charCodeAt(0);
                    UTF8_TO_SJIS[uCode] = kCode;
                    SJIS_TO_UTF8[kCode] = uCode;
                }
            }
            tables = { UTF8_TO_SJIS: UTF8_TO_SJIS, SJIS_TO_UTF8: SJIS_TO_UTF8 };
        }
        return tables;
    }
    /**
     * @function SJIS
     * @param {string} str
     * @returns {number[]}
     */
    function SJIS(str) {
        var bytes = [];
        var length = str.length;
        var UTF8_TO_SJIS = getTables().UTF8_TO_SJIS;
        for (var i = 0; i < length; i++) {
            var code = str.charCodeAt(i);
            var byte = UTF8_TO_SJIS[code];
            if (byte != null) {
                // 2 bytes
                bytes.push(byte >> 8);
                bytes.push(byte & 0xff);
            }
            else {
                throw "illegal char: " + String.fromCharCode(code);
            }
        }
        return bytes;
    }

    /**
     * @module index
     * @author nuintun
     * @author Cosmo Wolfe
     */
    function decodeNumeric(stream, size) {
        var data = '';
        var bytes = [];
        var characterCountSize = [10, 12, 14][size];
        var length = stream.readBits(characterCountSize);
        // Read digits in groups of 3
        while (length >= 3) {
            var num = stream.readBits(10);
            if (num >= 1000) {
                throw 'invalid numeric value above 999';
            }
            var a = Math.floor(num / 100);
            var b = Math.floor(num / 10) % 10;
            var c = num % 10;
            bytes.push(48 + a, 48 + b, 48 + c);
            data += a.toString() + b.toString() + c.toString();
            length -= 3;
        }
        // If the number of digits aren't a multiple of 3, the remaining digits are special cased.
        if (length === 2) {
            var num = stream.readBits(7);
            if (num >= 100) {
                throw 'invalid numeric value above 99';
            }
            var a = Math.floor(num / 10);
            var b = num % 10;
            bytes.push(48 + a, 48 + b);
            data += a.toString() + b.toString();
        }
        else if (length === 1) {
            var num = stream.readBits(4);
            if (num >= 10) {
                throw 'invalid numeric value above 9';
            }
            bytes.push(48 + num);
            data += num.toString();
        }
        return { bytes: bytes, data: data };
    }
    // prettier-ignore
    var AlphanumericCharacterCodes = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8',
        '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
        'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q',
        'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        ' ', '$', '%', '*', '+', '-', '.', '/', ':'
    ];
    function decodeAlphanumeric(stream, size) {
        var data = '';
        var bytes = [];
        var characterCountSize = [9, 11, 13][size];
        var length = stream.readBits(characterCountSize);
        while (length >= 2) {
            var v = stream.readBits(11);
            var a = Math.floor(v / 45);
            var b = v % 45;
            bytes.push(AlphanumericCharacterCodes[a].charCodeAt(0), AlphanumericCharacterCodes[b].charCodeAt(0));
            data += AlphanumericCharacterCodes[a] + AlphanumericCharacterCodes[b];
            length -= 2;
        }
        if (length === 1) {
            var a = stream.readBits(6);
            bytes.push(AlphanumericCharacterCodes[a].charCodeAt(0));
            data += AlphanumericCharacterCodes[a];
        }
        return { bytes: bytes, data: data };
    }
    /**
     * @function decodeByteAsUTF8
     * @param {number[]} bytes
     * @returns {string}
     * @see https://github.com/google/closure-library/blob/master/closure/goog/crypt/crypt.js
     */
    function decodeByteAsUTF8(bytes) {
        // TODO(user): Use native implementations if/when available
        var pos = 0;
        var output = '';
        var length = bytes.length;
        while (pos < length) {
            var c1 = bytes[pos++];
            if (c1 < 128) {
                output += String.fromCharCode(c1);
            }
            else if (c1 > 191 && c1 < 224) {
                var c2 = bytes[pos++];
                output += String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
            }
            else if (c1 > 239 && c1 < 365) {
                // Surrogate Pair
                var c2 = bytes[pos++];
                var c3 = bytes[pos++];
                var c4 = bytes[pos++];
                var u = (((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) - 0x10000;
                output += String.fromCharCode(0xd800 + (u >> 10));
                output += String.fromCharCode(0xdc00 + (u & 1023));
            }
            else {
                var c2 = bytes[pos++];
                var c3 = bytes[pos++];
                output += String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            }
        }
        return output;
    }
    /**
     * @function decodeByteAsUTF8
     * @param {number[]} bytes
     * @returns {string}
     * @see https://github.com/narirou/jconv/blob/master/jconv.js
     */
    function decodeByteAsSJIS(bytes) {
        var pos = 0;
        var output = '';
        var length = bytes.length;
        var SJIS_TO_UTF8 = getTables().SJIS_TO_UTF8;
        while (pos < length) {
            var byte = bytes[pos++];
            if (byte < 0x80) {
                // ASCII
                output += String.fromCharCode(byte);
            }
            else if (0xa0 <= byte && byte <= 0xdf) {
                // HALFWIDTH_KATAKANA
                output += String.fromCharCode(byte + 0xfec0);
            }
            else {
                // KANJI
                var code = (byte << 8) + bytes[pos++];
                code = SJIS_TO_UTF8[code];
                output += code != null ? String.fromCharCode(code) : '?';
            }
        }
        return output;
    }
    function decodeByte(stream, size, encoding) {
        var bytes = [];
        var characterCountSize = [8, 16, 16][size];
        var length = stream.readBits(characterCountSize);
        for (var i = 0; i < length; i++) {
            bytes.push(stream.readBits(8));
        }
        return { bytes: bytes, data: encoding === 20 /* SJIS */ ? decodeByteAsSJIS(bytes) : decodeByteAsUTF8(bytes) };
    }
    function decodeKanji(stream, size) {
        var data = '';
        var bytes = [];
        var SJIS_TO_UTF8 = getTables().SJIS_TO_UTF8;
        var characterCountSize = [8, 10, 12][size];
        var length = stream.readBits(characterCountSize);
        for (var i = 0; i < length; i++) {
            var k = stream.readBits(13);
            var c = (Math.floor(k / 0xc0) << 8) | k % 0xc0;
            if (c < 0x1f00) {
                c += 0x8140;
            }
            else {
                c += 0xc140;
            }
            bytes.push(c >> 8, c & 0xff);
            var b = SJIS_TO_UTF8[c];
            data += String.fromCharCode(b != null ? b : c);
        }
        return { bytes: bytes, data: data };
    }
    function bytesDecode(data, version, errorCorrectionLevel) {
        var _a, _b, _c, _d;
        var encoding = 26 /* UTF8 */;
        var stream = new BitStream(data);
        // There are 3 'sizes' based on the version. 1-9 is small (0), 10-26 is medium (1) and 27-40 is large (2).
        var size = version <= 9 ? 0 : version <= 26 ? 1 : 2;
        var result = { data: '', bytes: [], chunks: [], version: version, errorCorrectionLevel: errorCorrectionLevel };
        while (stream.available() >= 4) {
            var mode = stream.readBits(4);
            if (mode === exports.Mode.Terminator) {
                return result;
            }
            else if (mode === exports.Mode.ECI) {
                if (stream.readBits(1) === 0) {
                    encoding = stream.readBits(7);
                    result.chunks.push({ mode: exports.Mode.ECI, encoding: encoding });
                }
                else if (stream.readBits(1) === 0) {
                    encoding = stream.readBits(14);
                    result.chunks.push({ mode: exports.Mode.ECI, encoding: encoding });
                }
                else if (stream.readBits(1) === 0) {
                    encoding = stream.readBits(21);
                    result.chunks.push({ mode: exports.Mode.ECI, encoding: encoding });
                }
                else {
                    // ECI data seems corrupted
                    result.chunks.push({ mode: exports.Mode.ECI, encoding: -1 });
                }
            }
            else if (mode === exports.Mode.Numeric) {
                var numericResult = decodeNumeric(stream, size);
                result.data += numericResult.data;
                result.chunks.push({
                    mode: exports.Mode.Numeric,
                    data: numericResult.data,
                    bytes: numericResult.bytes
                });
                (_a = result.bytes).push.apply(_a, numericResult.bytes);
            }
            else if (mode === exports.Mode.Alphanumeric) {
                var alphanumericResult = decodeAlphanumeric(stream, size);
                result.data += alphanumericResult.data;
                result.chunks.push({
                    mode: exports.Mode.Alphanumeric,
                    data: alphanumericResult.data,
                    bytes: alphanumericResult.bytes
                });
                (_b = result.bytes).push.apply(_b, alphanumericResult.bytes);
            }
            else if (mode === exports.Mode.StructuredAppend) {
                // QR Standard section 9.2
                var structuredAppend = {
                    // [current, total]
                    symbols: [stream.readBits(4), stream.readBits(4)],
                    parity: stream.readBits(8)
                };
                result.chunks.push(__assign({ mode: exports.Mode.StructuredAppend }, structuredAppend));
            }
            else if (mode === exports.Mode.Byte) {
                var byteResult = decodeByte(stream, size, encoding);
                result.data += byteResult.data;
                result.chunks.push({
                    mode: exports.Mode.Byte,
                    data: byteResult.data,
                    bytes: byteResult.bytes
                });
                (_c = result.bytes).push.apply(_c, byteResult.bytes);
            }
            else if (mode === exports.Mode.Kanji) {
                var kanjiResult = decodeKanji(stream, size);
                result.data += kanjiResult.data;
                result.chunks.push({
                    mode: exports.Mode.Kanji,
                    data: kanjiResult.data,
                    bytes: kanjiResult.bytes
                });
                (_d = result.bytes).push.apply(_d, kanjiResult.bytes);
            }
        }
        // If there is no data left, or the remaining bits are all 0, then that counts as a termination marker
        if (stream.available() === 0 || stream.readBits(stream.available()) === 0) {
            return result;
        }
    }

    /**
     * @module Version
     * @author nuintun
     * @author Cosmo Wolfe
     */
    var VERSIONS = [
        {
            infoBits: null,
            versionNumber: 1,
            alignmentPatternCenters: [],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 10,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 7,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 19 }]
                },
                {
                    ecCodewordsPerBlock: 17,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 9 }]
                },
                {
                    ecCodewordsPerBlock: 13,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 13 }]
                }
            ]
        },
        {
            infoBits: null,
            versionNumber: 2,
            alignmentPatternCenters: [6, 18],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 16,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 28 }]
                },
                {
                    ecCodewordsPerBlock: 10,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 34 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 22 }]
                }
            ]
        },
        {
            infoBits: null,
            versionNumber: 3,
            alignmentPatternCenters: [6, 22],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 44 }]
                },
                {
                    ecCodewordsPerBlock: 15,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 55 }]
                },
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 13 }]
                },
                {
                    ecCodewordsPerBlock: 18,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 17 }]
                }
            ]
        },
        {
            infoBits: null,
            versionNumber: 4,
            alignmentPatternCenters: [6, 26],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 18,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 32 }]
                },
                {
                    ecCodewordsPerBlock: 20,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 80 }]
                },
                {
                    ecCodewordsPerBlock: 16,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 9 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 24 }]
                }
            ]
        },
        {
            infoBits: null,
            versionNumber: 5,
            alignmentPatternCenters: [6, 30],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 43 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 108 }]
                },
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 11 }, { numBlocks: 2, dataCodewordsPerBlock: 12 }]
                },
                {
                    ecCodewordsPerBlock: 18,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 15 }, { numBlocks: 2, dataCodewordsPerBlock: 16 }]
                }
            ]
        },
        {
            infoBits: null,
            versionNumber: 6,
            alignmentPatternCenters: [6, 34],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 16,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 27 }]
                },
                {
                    ecCodewordsPerBlock: 18,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 68 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 15 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 19 }]
                }
            ]
        },
        {
            infoBits: 0x07c94,
            versionNumber: 7,
            alignmentPatternCenters: [6, 22, 38],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 18,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 31 }]
                },
                {
                    ecCodewordsPerBlock: 20,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 78 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 13 }, { numBlocks: 1, dataCodewordsPerBlock: 14 }]
                },
                {
                    ecCodewordsPerBlock: 18,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 14 }, { numBlocks: 4, dataCodewordsPerBlock: 15 }]
                }
            ]
        },
        {
            infoBits: 0x085bc,
            versionNumber: 8,
            alignmentPatternCenters: [6, 24, 42],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 38 }, { numBlocks: 2, dataCodewordsPerBlock: 39 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 97 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 14 }, { numBlocks: 2, dataCodewordsPerBlock: 15 }]
                },
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 18 }, { numBlocks: 2, dataCodewordsPerBlock: 19 }]
                }
            ]
        },
        {
            infoBits: 0x09a99,
            versionNumber: 9,
            alignmentPatternCenters: [6, 26, 46],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 36 }, { numBlocks: 2, dataCodewordsPerBlock: 37 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 116 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 12 }, { numBlocks: 4, dataCodewordsPerBlock: 13 }]
                },
                {
                    ecCodewordsPerBlock: 20,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 16 }, { numBlocks: 4, dataCodewordsPerBlock: 17 }]
                }
            ]
        },
        {
            infoBits: 0x0a4d3,
            versionNumber: 10,
            alignmentPatternCenters: [6, 28, 50],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 43 }, { numBlocks: 1, dataCodewordsPerBlock: 44 }]
                },
                {
                    ecCodewordsPerBlock: 18,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 68 }, { numBlocks: 2, dataCodewordsPerBlock: 69 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 6, dataCodewordsPerBlock: 15 }, { numBlocks: 2, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 6, dataCodewordsPerBlock: 19 }, { numBlocks: 2, dataCodewordsPerBlock: 20 }]
                }
            ]
        },
        {
            infoBits: 0x0bbf6,
            versionNumber: 11,
            alignmentPatternCenters: [6, 30, 54],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 50 }, { numBlocks: 4, dataCodewordsPerBlock: 51 }]
                },
                {
                    ecCodewordsPerBlock: 20,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 81 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 12 }, { numBlocks: 8, dataCodewordsPerBlock: 13 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 22 }, { numBlocks: 4, dataCodewordsPerBlock: 23 }]
                }
            ]
        },
        {
            infoBits: 0x0c762,
            versionNumber: 12,
            alignmentPatternCenters: [6, 32, 58],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 6, dataCodewordsPerBlock: 36 }, { numBlocks: 2, dataCodewordsPerBlock: 37 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 92 }, { numBlocks: 2, dataCodewordsPerBlock: 93 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 7, dataCodewordsPerBlock: 14 }, { numBlocks: 4, dataCodewordsPerBlock: 15 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 20 }, { numBlocks: 6, dataCodewordsPerBlock: 21 }]
                }
            ]
        },
        {
            infoBits: 0x0d847,
            versionNumber: 13,
            alignmentPatternCenters: [6, 34, 62],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 8, dataCodewordsPerBlock: 37 }, { numBlocks: 1, dataCodewordsPerBlock: 38 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 107 }]
                },
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 12, dataCodewordsPerBlock: 11 }, { numBlocks: 4, dataCodewordsPerBlock: 12 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 8, dataCodewordsPerBlock: 20 }, { numBlocks: 4, dataCodewordsPerBlock: 21 }]
                }
            ]
        },
        {
            infoBits: 0x0e60d,
            versionNumber: 14,
            alignmentPatternCenters: [6, 26, 46, 66],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 40 }, { numBlocks: 5, dataCodewordsPerBlock: 41 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 115 }, { numBlocks: 1, dataCodewordsPerBlock: 116 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 11, dataCodewordsPerBlock: 12 }, { numBlocks: 5, dataCodewordsPerBlock: 13 }]
                },
                {
                    ecCodewordsPerBlock: 20,
                    ecBlocks: [{ numBlocks: 11, dataCodewordsPerBlock: 16 }, { numBlocks: 5, dataCodewordsPerBlock: 17 }]
                }
            ]
        },
        {
            infoBits: 0x0f928,
            versionNumber: 15,
            alignmentPatternCenters: [6, 26, 48, 70],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 5, dataCodewordsPerBlock: 41 }, { numBlocks: 5, dataCodewordsPerBlock: 42 }]
                },
                {
                    ecCodewordsPerBlock: 22,
                    ecBlocks: [{ numBlocks: 5, dataCodewordsPerBlock: 87 }, { numBlocks: 1, dataCodewordsPerBlock: 88 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 11, dataCodewordsPerBlock: 12 }, { numBlocks: 7, dataCodewordsPerBlock: 13 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 5, dataCodewordsPerBlock: 24 }, { numBlocks: 7, dataCodewordsPerBlock: 25 }]
                }
            ]
        },
        {
            infoBits: 0x10b78,
            versionNumber: 16,
            alignmentPatternCenters: [6, 26, 50, 74],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 7, dataCodewordsPerBlock: 45 }, { numBlocks: 3, dataCodewordsPerBlock: 46 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 5, dataCodewordsPerBlock: 98 }, { numBlocks: 1, dataCodewordsPerBlock: 99 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 15 }, { numBlocks: 13, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 15, dataCodewordsPerBlock: 19 }, { numBlocks: 2, dataCodewordsPerBlock: 20 }]
                }
            ]
        },
        {
            infoBits: 0x1145d,
            versionNumber: 17,
            alignmentPatternCenters: [6, 30, 54, 78],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 10, dataCodewordsPerBlock: 46 }, { numBlocks: 1, dataCodewordsPerBlock: 47 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 107 }, { numBlocks: 5, dataCodewordsPerBlock: 108 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 14 }, { numBlocks: 17, dataCodewordsPerBlock: 15 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 22 }, { numBlocks: 15, dataCodewordsPerBlock: 23 }]
                }
            ]
        },
        {
            infoBits: 0x12a17,
            versionNumber: 18,
            alignmentPatternCenters: [6, 30, 56, 82],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 9, dataCodewordsPerBlock: 43 }, { numBlocks: 4, dataCodewordsPerBlock: 44 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 5, dataCodewordsPerBlock: 120 }, { numBlocks: 1, dataCodewordsPerBlock: 121 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 14 }, { numBlocks: 19, dataCodewordsPerBlock: 15 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 22 }, { numBlocks: 1, dataCodewordsPerBlock: 23 }]
                }
            ]
        },
        {
            infoBits: 0x13532,
            versionNumber: 19,
            alignmentPatternCenters: [6, 30, 58, 86],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 44 }, { numBlocks: 11, dataCodewordsPerBlock: 45 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 113 }, { numBlocks: 4, dataCodewordsPerBlock: 114 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 9, dataCodewordsPerBlock: 13 }, { numBlocks: 16, dataCodewordsPerBlock: 14 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 21 }, { numBlocks: 4, dataCodewordsPerBlock: 22 }]
                }
            ]
        },
        {
            infoBits: 0x149a6,
            versionNumber: 20,
            alignmentPatternCenters: [6, 34, 62, 90],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 41 }, { numBlocks: 13, dataCodewordsPerBlock: 42 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 107 }, { numBlocks: 5, dataCodewordsPerBlock: 108 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 15, dataCodewordsPerBlock: 15 }, { numBlocks: 10, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 15, dataCodewordsPerBlock: 24 }, { numBlocks: 5, dataCodewordsPerBlock: 25 }]
                }
            ]
        },
        {
            infoBits: 0x15683,
            versionNumber: 21,
            alignmentPatternCenters: [6, 28, 50, 72, 94],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 42 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 116 }, { numBlocks: 4, dataCodewordsPerBlock: 117 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 19, dataCodewordsPerBlock: 16 }, { numBlocks: 6, dataCodewordsPerBlock: 17 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 22 }, { numBlocks: 6, dataCodewordsPerBlock: 23 }]
                }
            ]
        },
        {
            infoBits: 0x168c9,
            versionNumber: 22,
            alignmentPatternCenters: [6, 26, 50, 74, 98],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 46 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 111 }, { numBlocks: 7, dataCodewordsPerBlock: 112 }]
                },
                {
                    ecCodewordsPerBlock: 24,
                    ecBlocks: [{ numBlocks: 34, dataCodewordsPerBlock: 13 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 7, dataCodewordsPerBlock: 24 }, { numBlocks: 16, dataCodewordsPerBlock: 25 }]
                }
            ]
        },
        {
            infoBits: 0x177ec,
            versionNumber: 23,
            alignmentPatternCenters: [6, 30, 54, 74, 102],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 47 }, { numBlocks: 14, dataCodewordsPerBlock: 48 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 121 }, { numBlocks: 5, dataCodewordsPerBlock: 122 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 16, dataCodewordsPerBlock: 15 }, { numBlocks: 14, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 11, dataCodewordsPerBlock: 24 }, { numBlocks: 14, dataCodewordsPerBlock: 25 }]
                }
            ]
        },
        {
            infoBits: 0x18ec4,
            versionNumber: 24,
            alignmentPatternCenters: [6, 28, 54, 80, 106],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 6, dataCodewordsPerBlock: 45 }, { numBlocks: 14, dataCodewordsPerBlock: 46 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 6, dataCodewordsPerBlock: 117 }, { numBlocks: 4, dataCodewordsPerBlock: 118 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 30, dataCodewordsPerBlock: 16 }, { numBlocks: 2, dataCodewordsPerBlock: 17 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 11, dataCodewordsPerBlock: 24 }, { numBlocks: 16, dataCodewordsPerBlock: 25 }]
                }
            ]
        },
        {
            infoBits: 0x191e1,
            versionNumber: 25,
            alignmentPatternCenters: [6, 32, 58, 84, 110],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 8, dataCodewordsPerBlock: 47 }, { numBlocks: 13, dataCodewordsPerBlock: 48 }]
                },
                {
                    ecCodewordsPerBlock: 26,
                    ecBlocks: [{ numBlocks: 8, dataCodewordsPerBlock: 106 }, { numBlocks: 4, dataCodewordsPerBlock: 107 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 22, dataCodewordsPerBlock: 15 }, { numBlocks: 13, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 7, dataCodewordsPerBlock: 24 }, { numBlocks: 22, dataCodewordsPerBlock: 25 }]
                }
            ]
        },
        {
            infoBits: 0x1afab,
            versionNumber: 26,
            alignmentPatternCenters: [6, 30, 58, 86, 114],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 19, dataCodewordsPerBlock: 46 }, { numBlocks: 4, dataCodewordsPerBlock: 47 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 10, dataCodewordsPerBlock: 114 }, { numBlocks: 2, dataCodewordsPerBlock: 115 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 33, dataCodewordsPerBlock: 16 }, { numBlocks: 4, dataCodewordsPerBlock: 17 }]
                },
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 28, dataCodewordsPerBlock: 22 }, { numBlocks: 6, dataCodewordsPerBlock: 23 }]
                }
            ]
        },
        {
            infoBits: 0x1b08e,
            versionNumber: 27,
            alignmentPatternCenters: [6, 34, 62, 90, 118],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 22, dataCodewordsPerBlock: 45 }, { numBlocks: 3, dataCodewordsPerBlock: 46 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 8, dataCodewordsPerBlock: 122 }, { numBlocks: 4, dataCodewordsPerBlock: 123 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 12, dataCodewordsPerBlock: 15 }, { numBlocks: 28, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 8, dataCodewordsPerBlock: 23 }, { numBlocks: 26, dataCodewordsPerBlock: 24 }]
                }
            ]
        },
        {
            infoBits: 0x1cc1a,
            versionNumber: 28,
            alignmentPatternCenters: [6, 26, 50, 74, 98, 122],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 45 }, { numBlocks: 23, dataCodewordsPerBlock: 46 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 3, dataCodewordsPerBlock: 117 }, { numBlocks: 10, dataCodewordsPerBlock: 118 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 11, dataCodewordsPerBlock: 15 }, { numBlocks: 31, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 24 }, { numBlocks: 31, dataCodewordsPerBlock: 25 }]
                }
            ]
        },
        {
            infoBits: 0x1d33f,
            versionNumber: 29,
            alignmentPatternCenters: [6, 30, 54, 78, 102, 126],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 21, dataCodewordsPerBlock: 45 }, { numBlocks: 7, dataCodewordsPerBlock: 46 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 7, dataCodewordsPerBlock: 116 }, { numBlocks: 7, dataCodewordsPerBlock: 117 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 19, dataCodewordsPerBlock: 15 }, { numBlocks: 26, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 23 }, { numBlocks: 37, dataCodewordsPerBlock: 24 }]
                }
            ]
        },
        {
            infoBits: 0x1ed75,
            versionNumber: 30,
            alignmentPatternCenters: [6, 26, 52, 78, 104, 130],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 19, dataCodewordsPerBlock: 47 }, { numBlocks: 10, dataCodewordsPerBlock: 48 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 5, dataCodewordsPerBlock: 115 }, { numBlocks: 10, dataCodewordsPerBlock: 116 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 23, dataCodewordsPerBlock: 15 }, { numBlocks: 25, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 15, dataCodewordsPerBlock: 24 }, { numBlocks: 25, dataCodewordsPerBlock: 25 }]
                }
            ]
        },
        {
            infoBits: 0x1f250,
            versionNumber: 31,
            alignmentPatternCenters: [6, 30, 56, 82, 108, 134],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 46 }, { numBlocks: 29, dataCodewordsPerBlock: 47 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 13, dataCodewordsPerBlock: 115 }, { numBlocks: 3, dataCodewordsPerBlock: 116 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 23, dataCodewordsPerBlock: 15 }, { numBlocks: 28, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 42, dataCodewordsPerBlock: 24 }, { numBlocks: 1, dataCodewordsPerBlock: 25 }]
                }
            ]
        },
        {
            infoBits: 0x209d5,
            versionNumber: 32,
            alignmentPatternCenters: [6, 34, 60, 86, 112, 138],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 10, dataCodewordsPerBlock: 46 }, { numBlocks: 23, dataCodewordsPerBlock: 47 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 115 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 19, dataCodewordsPerBlock: 15 }, { numBlocks: 35, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 10, dataCodewordsPerBlock: 24 }, { numBlocks: 35, dataCodewordsPerBlock: 25 }]
                }
            ]
        },
        {
            infoBits: 0x216f0,
            versionNumber: 33,
            alignmentPatternCenters: [6, 30, 58, 86, 114, 142],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 14, dataCodewordsPerBlock: 46 }, { numBlocks: 21, dataCodewordsPerBlock: 47 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 115 }, { numBlocks: 1, dataCodewordsPerBlock: 116 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 11, dataCodewordsPerBlock: 15 }, { numBlocks: 46, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 29, dataCodewordsPerBlock: 24 }, { numBlocks: 19, dataCodewordsPerBlock: 25 }]
                }
            ]
        },
        {
            infoBits: 0x228ba,
            versionNumber: 34,
            alignmentPatternCenters: [6, 34, 62, 90, 118, 146],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 14, dataCodewordsPerBlock: 46 }, { numBlocks: 23, dataCodewordsPerBlock: 47 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 13, dataCodewordsPerBlock: 115 }, { numBlocks: 6, dataCodewordsPerBlock: 116 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 59, dataCodewordsPerBlock: 16 }, { numBlocks: 1, dataCodewordsPerBlock: 17 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 44, dataCodewordsPerBlock: 24 }, { numBlocks: 7, dataCodewordsPerBlock: 25 }]
                }
            ]
        },
        {
            infoBits: 0x2379f,
            versionNumber: 35,
            alignmentPatternCenters: [6, 30, 54, 78, 102, 126, 150],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 12, dataCodewordsPerBlock: 47 }, { numBlocks: 26, dataCodewordsPerBlock: 48 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 12, dataCodewordsPerBlock: 121 }, { numBlocks: 7, dataCodewordsPerBlock: 122 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 22, dataCodewordsPerBlock: 15 }, { numBlocks: 41, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 39, dataCodewordsPerBlock: 24 }, { numBlocks: 14, dataCodewordsPerBlock: 25 }]
                }
            ]
        },
        {
            infoBits: 0x24b0b,
            versionNumber: 36,
            alignmentPatternCenters: [6, 24, 50, 76, 102, 128, 154],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 6, dataCodewordsPerBlock: 47 }, { numBlocks: 34, dataCodewordsPerBlock: 48 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 6, dataCodewordsPerBlock: 121 }, { numBlocks: 14, dataCodewordsPerBlock: 122 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 15 }, { numBlocks: 64, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 46, dataCodewordsPerBlock: 24 }, { numBlocks: 10, dataCodewordsPerBlock: 25 }]
                }
            ]
        },
        {
            infoBits: 0x2542e,
            versionNumber: 37,
            alignmentPatternCenters: [6, 28, 54, 80, 106, 132, 158],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 29, dataCodewordsPerBlock: 46 }, { numBlocks: 14, dataCodewordsPerBlock: 47 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 122 }, { numBlocks: 4, dataCodewordsPerBlock: 123 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 24, dataCodewordsPerBlock: 15 }, { numBlocks: 46, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 49, dataCodewordsPerBlock: 24 }, { numBlocks: 10, dataCodewordsPerBlock: 25 }]
                }
            ]
        },
        {
            infoBits: 0x26a64,
            versionNumber: 38,
            alignmentPatternCenters: [6, 32, 58, 84, 110, 136, 162],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 13, dataCodewordsPerBlock: 46 }, { numBlocks: 32, dataCodewordsPerBlock: 47 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 122 }, { numBlocks: 18, dataCodewordsPerBlock: 123 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 42, dataCodewordsPerBlock: 15 }, { numBlocks: 32, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 48, dataCodewordsPerBlock: 24 }, { numBlocks: 14, dataCodewordsPerBlock: 25 }]
                }
            ]
        },
        {
            infoBits: 0x27541,
            versionNumber: 39,
            alignmentPatternCenters: [6, 26, 54, 82, 110, 138, 166],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 40, dataCodewordsPerBlock: 47 }, { numBlocks: 7, dataCodewordsPerBlock: 48 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 20, dataCodewordsPerBlock: 117 }, { numBlocks: 4, dataCodewordsPerBlock: 118 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 10, dataCodewordsPerBlock: 15 }, { numBlocks: 67, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 43, dataCodewordsPerBlock: 24 }, { numBlocks: 22, dataCodewordsPerBlock: 25 }]
                }
            ]
        },
        {
            infoBits: 0x28c69,
            versionNumber: 40,
            alignmentPatternCenters: [6, 30, 58, 86, 114, 142, 170],
            errorCorrectionLevels: [
                {
                    ecCodewordsPerBlock: 28,
                    ecBlocks: [{ numBlocks: 18, dataCodewordsPerBlock: 47 }, { numBlocks: 31, dataCodewordsPerBlock: 48 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 19, dataCodewordsPerBlock: 118 }, { numBlocks: 6, dataCodewordsPerBlock: 119 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 20, dataCodewordsPerBlock: 15 }, { numBlocks: 61, dataCodewordsPerBlock: 16 }]
                },
                {
                    ecCodewordsPerBlock: 30,
                    ecBlocks: [{ numBlocks: 34, dataCodewordsPerBlock: 24 }, { numBlocks: 34, dataCodewordsPerBlock: 25 }]
                }
            ]
        }
    ];

    /**
     * @module index
     * @author nuintun
     * @author Cosmo Wolfe
     */
    function numBitsDiffering(x, y) {
        var z = x ^ y;
        var bitCount = 0;
        while (z) {
            bitCount++;
            z &= z - 1;
        }
        return bitCount;
    }
    function pushBit(bit, byte) {
        return (byte << 1) | bit;
    }
    var FORMAT_INFO_TABLE = [
        { bits: 0x5412, formatInfo: { errorCorrectionLevel: 0, dataMask: 0 } },
        { bits: 0x5125, formatInfo: { errorCorrectionLevel: 0, dataMask: 1 } },
        { bits: 0x5e7c, formatInfo: { errorCorrectionLevel: 0, dataMask: 2 } },
        { bits: 0x5b4b, formatInfo: { errorCorrectionLevel: 0, dataMask: 3 } },
        { bits: 0x45f9, formatInfo: { errorCorrectionLevel: 0, dataMask: 4 } },
        { bits: 0x40ce, formatInfo: { errorCorrectionLevel: 0, dataMask: 5 } },
        { bits: 0x4f97, formatInfo: { errorCorrectionLevel: 0, dataMask: 6 } },
        { bits: 0x4aa0, formatInfo: { errorCorrectionLevel: 0, dataMask: 7 } },
        { bits: 0x77c4, formatInfo: { errorCorrectionLevel: 1, dataMask: 0 } },
        { bits: 0x72f3, formatInfo: { errorCorrectionLevel: 1, dataMask: 1 } },
        { bits: 0x7daa, formatInfo: { errorCorrectionLevel: 1, dataMask: 2 } },
        { bits: 0x789d, formatInfo: { errorCorrectionLevel: 1, dataMask: 3 } },
        { bits: 0x662f, formatInfo: { errorCorrectionLevel: 1, dataMask: 4 } },
        { bits: 0x6318, formatInfo: { errorCorrectionLevel: 1, dataMask: 5 } },
        { bits: 0x6c41, formatInfo: { errorCorrectionLevel: 1, dataMask: 6 } },
        { bits: 0x6976, formatInfo: { errorCorrectionLevel: 1, dataMask: 7 } },
        { bits: 0x1689, formatInfo: { errorCorrectionLevel: 2, dataMask: 0 } },
        { bits: 0x13be, formatInfo: { errorCorrectionLevel: 2, dataMask: 1 } },
        { bits: 0x1ce7, formatInfo: { errorCorrectionLevel: 2, dataMask: 2 } },
        { bits: 0x19d0, formatInfo: { errorCorrectionLevel: 2, dataMask: 3 } },
        { bits: 0x0762, formatInfo: { errorCorrectionLevel: 2, dataMask: 4 } },
        { bits: 0x0255, formatInfo: { errorCorrectionLevel: 2, dataMask: 5 } },
        { bits: 0x0d0c, formatInfo: { errorCorrectionLevel: 2, dataMask: 6 } },
        { bits: 0x083b, formatInfo: { errorCorrectionLevel: 2, dataMask: 7 } },
        { bits: 0x355f, formatInfo: { errorCorrectionLevel: 3, dataMask: 0 } },
        { bits: 0x3068, formatInfo: { errorCorrectionLevel: 3, dataMask: 1 } },
        { bits: 0x3f31, formatInfo: { errorCorrectionLevel: 3, dataMask: 2 } },
        { bits: 0x3a06, formatInfo: { errorCorrectionLevel: 3, dataMask: 3 } },
        { bits: 0x24b4, formatInfo: { errorCorrectionLevel: 3, dataMask: 4 } },
        { bits: 0x2183, formatInfo: { errorCorrectionLevel: 3, dataMask: 5 } },
        { bits: 0x2eda, formatInfo: { errorCorrectionLevel: 3, dataMask: 6 } },
        { bits: 0x2bed, formatInfo: { errorCorrectionLevel: 3, dataMask: 7 } }
    ];
    function buildFunctionPatternMask(version) {
        var dimension = 17 + 4 * version.versionNumber;
        var matrix = BitMatrix.createEmpty(dimension, dimension);
        matrix.setRegion(0, 0, 9, 9, true); // Top left finder pattern + separator + format
        matrix.setRegion(dimension - 8, 0, 8, 9, true); // Top right finder pattern + separator + format
        matrix.setRegion(0, dimension - 8, 9, 8, true); // Bottom left finder pattern + separator + format
        // Alignment patterns
        for (var _i = 0, _a = version.alignmentPatternCenters; _i < _a.length; _i++) {
            var x = _a[_i];
            for (var _b = 0, _c = version.alignmentPatternCenters; _b < _c.length; _b++) {
                var y = _c[_b];
                if (!((x === 6 && y === 6) || (x === 6 && y === dimension - 7) || (x === dimension - 7 && y === 6))) {
                    matrix.setRegion(x - 2, y - 2, 5, 5, true);
                }
            }
        }
        matrix.setRegion(6, 9, 1, dimension - 17, true); // Vertical timing pattern
        matrix.setRegion(9, 6, dimension - 17, 1, true); // Horizontal timing pattern
        if (version.versionNumber > 6) {
            matrix.setRegion(dimension - 11, 0, 3, 6, true); // Version info, top right
            matrix.setRegion(0, dimension - 11, 6, 3, true); // Version info, bottom left
        }
        return matrix;
    }
    function readCodewords(matrix, version, formatInfo) {
        var dimension = matrix.height;
        var maskFunc = getMaskFunc(formatInfo.dataMask);
        var functionPatternMask = buildFunctionPatternMask(version);
        var bitsRead = 0;
        var currentByte = 0;
        var codewords = [];
        // Read columns in pairs, from right to left
        var readingUp = true;
        for (var columnIndex = dimension - 1; columnIndex > 0; columnIndex -= 2) {
            if (columnIndex === 6) {
                // Skip whole column with vertical alignment pattern;
                columnIndex--;
            }
            for (var i = 0; i < dimension; i++) {
                var y = readingUp ? dimension - 1 - i : i;
                for (var columnOffset = 0; columnOffset < 2; columnOffset++) {
                    var x = columnIndex - columnOffset;
                    if (!functionPatternMask.get(x, y)) {
                        bitsRead++;
                        var bit = matrix.get(x, y);
                        if (maskFunc(x, y)) {
                            bit = !bit;
                        }
                        currentByte = pushBit(bit, currentByte);
                        if (bitsRead === 8) {
                            // Whole bytes
                            codewords.push(currentByte);
                            bitsRead = 0;
                            currentByte = 0;
                        }
                    }
                }
            }
            readingUp = !readingUp;
        }
        return codewords;
    }
    function readVersion(matrix) {
        var dimension = matrix.height;
        var provisionalVersion = Math.floor((dimension - 17) / 4);
        if (provisionalVersion <= 6) {
            // 6 and under dont have version info in the QR code
            return VERSIONS[provisionalVersion - 1];
        }
        var topRightVersionBits = 0;
        for (var y = 5; y >= 0; y--) {
            for (var x = dimension - 9; x >= dimension - 11; x--) {
                topRightVersionBits = pushBit(matrix.get(x, y), topRightVersionBits);
            }
        }
        var bottomLeftVersionBits = 0;
        for (var x = 5; x >= 0; x--) {
            for (var y = dimension - 9; y >= dimension - 11; y--) {
                bottomLeftVersionBits = pushBit(matrix.get(x, y), bottomLeftVersionBits);
            }
        }
        var bestVersion;
        var bestDifference = Infinity;
        for (var _i = 0, VERSIONS_1 = VERSIONS; _i < VERSIONS_1.length; _i++) {
            var version = VERSIONS_1[_i];
            if (version.infoBits === topRightVersionBits || version.infoBits === bottomLeftVersionBits) {
                return version;
            }
            var difference = numBitsDiffering(topRightVersionBits, version.infoBits);
            if (difference < bestDifference) {
                bestVersion = version;
                bestDifference = difference;
            }
            difference = numBitsDiffering(bottomLeftVersionBits, version.infoBits);
            if (difference < bestDifference) {
                bestVersion = version;
                bestDifference = difference;
            }
        }
        // We can tolerate up to 3 bits of error since no two version info codewords will
        // differ in less than 8 bits.
        if (bestDifference <= 3) {
            return bestVersion;
        }
    }
    function readFormatInformation(matrix) {
        var topLeftFormatInfoBits = 0;
        for (var x = 0; x <= 8; x++) {
            if (x !== 6) {
                // Skip timing pattern bit
                topLeftFormatInfoBits = pushBit(matrix.get(x, 8), topLeftFormatInfoBits);
            }
        }
        for (var y = 7; y >= 0; y--) {
            if (y !== 6) {
                // Skip timing pattern bit
                topLeftFormatInfoBits = pushBit(matrix.get(8, y), topLeftFormatInfoBits);
            }
        }
        var dimension = matrix.height;
        var topRightBottomRightFormatInfoBits = 0;
        for (var y = dimension - 1; y >= dimension - 7; y--) {
            // bottom left
            topRightBottomRightFormatInfoBits = pushBit(matrix.get(8, y), topRightBottomRightFormatInfoBits);
        }
        for (var x = dimension - 8; x < dimension; x++) {
            // top right
            topRightBottomRightFormatInfoBits = pushBit(matrix.get(x, 8), topRightBottomRightFormatInfoBits);
        }
        var bestDifference = Infinity;
        var bestFormatInfo = null;
        for (var _i = 0, FORMAT_INFO_TABLE_1 = FORMAT_INFO_TABLE; _i < FORMAT_INFO_TABLE_1.length; _i++) {
            var _a = FORMAT_INFO_TABLE_1[_i], bits = _a.bits, formatInfo = _a.formatInfo;
            if (bits === topLeftFormatInfoBits || bits === topRightBottomRightFormatInfoBits) {
                return formatInfo;
            }
            var difference = numBitsDiffering(topLeftFormatInfoBits, bits);
            if (difference < bestDifference) {
                bestFormatInfo = formatInfo;
                bestDifference = difference;
            }
            if (topLeftFormatInfoBits !== topRightBottomRightFormatInfoBits) {
                // also try the other option
                difference = numBitsDiffering(topRightBottomRightFormatInfoBits, bits);
                if (difference < bestDifference) {
                    bestFormatInfo = formatInfo;
                    bestDifference = difference;
                }
            }
        }
        // Hamming distance of the 32 masked codes is 7, by construction, so <= 3 bits differing means we found a match
        if (bestDifference <= 3) {
            return bestFormatInfo;
        }
        return null;
    }
    function getDataBlocks(codewords, version, errorCorrectionLevel) {
        var dataBlocks = [];
        var ecInfo = version.errorCorrectionLevels[errorCorrectionLevel];
        var totalCodewords = 0;
        ecInfo.ecBlocks.forEach(function (block) {
            for (var i = 0; i < block.numBlocks; i++) {
                dataBlocks.push({ numDataCodewords: block.dataCodewordsPerBlock, codewords: [] });
                totalCodewords += block.dataCodewordsPerBlock + ecInfo.ecCodewordsPerBlock;
            }
        });
        // In some cases the QR code will be malformed enough that we pull off more or less than we should.
        // If we pull off less there's nothing we can do.
        // If we pull off more we can safely truncate
        if (codewords.length < totalCodewords) {
            return null;
        }
        codewords = codewords.slice(0, totalCodewords);
        var shortBlockSize = ecInfo.ecBlocks[0].dataCodewordsPerBlock;
        // Pull codewords to fill the blocks up to the minimum size
        for (var i = 0; i < shortBlockSize; i++) {
            for (var _i = 0, dataBlocks_1 = dataBlocks; _i < dataBlocks_1.length; _i++) {
                var dataBlock = dataBlocks_1[_i];
                dataBlock.codewords.push(codewords.shift());
            }
        }
        // If there are any large blocks, pull codewords to fill the last element of those
        if (ecInfo.ecBlocks.length > 1) {
            var smallBlockCount = ecInfo.ecBlocks[0].numBlocks;
            var largeBlockCount = ecInfo.ecBlocks[1].numBlocks;
            for (var i = 0; i < largeBlockCount; i++) {
                dataBlocks[smallBlockCount + i].codewords.push(codewords.shift());
            }
        }
        // Add the rest of the codewords to the blocks. These are the error correction codewords.
        while (codewords.length > 0) {
            for (var _a = 0, dataBlocks_2 = dataBlocks; _a < dataBlocks_2.length; _a++) {
                var dataBlock = dataBlocks_2[_a];
                dataBlock.codewords.push(codewords.shift());
            }
        }
        return dataBlocks;
    }
    function decodeMatrix(matrix) {
        var version = readVersion(matrix);
        if (!version) {
            return null;
        }
        var formatInfo = readFormatInformation(matrix);
        if (!formatInfo) {
            return null;
        }
        var codewords = readCodewords(matrix, version, formatInfo);
        var dataBlocks = getDataBlocks(codewords, version, formatInfo.errorCorrectionLevel);
        if (!dataBlocks) {
            return null;
        }
        // Count total number of data bytes
        var totalBytes = dataBlocks.reduce(function (a, b) { return a + b.numDataCodewords; }, 0);
        var resultBytes = new Uint8ClampedArray(totalBytes);
        var resultIndex = 0;
        for (var _i = 0, dataBlocks_3 = dataBlocks; _i < dataBlocks_3.length; _i++) {
            var dataBlock = dataBlocks_3[_i];
            var correctedBytes = rsDecode(dataBlock.codewords, dataBlock.codewords.length - dataBlock.numDataCodewords);
            if (!correctedBytes) {
                return null;
            }
            for (var i = 0; i < dataBlock.numDataCodewords; i++) {
                resultBytes[resultIndex++] = correctedBytes[i];
            }
        }
        try {
            return bytesDecode(resultBytes, version.versionNumber, formatInfo.errorCorrectionLevel);
        }
        catch (_a) {
            return null;
        }
    }
    function decode(matrix) {
        if (matrix == null) {
            return null;
        }
        var result = decodeMatrix(matrix);
        if (result) {
            return result;
        }
        // Decoding didn't work, try mirroring the QR across the topLeft -> bottomRight line.
        for (var x = 0; x < matrix.width; x++) {
            for (var y = x + 1; y < matrix.height; y++) {
                if (matrix.get(x, y) !== matrix.get(y, x)) {
                    matrix.set(x, y, !matrix.get(x, y));
                    matrix.set(y, x, !matrix.get(y, x));
                }
            }
        }
        return decodeMatrix(matrix);
    }

    /**
     * @module extractor
     * @author nuintun
     * @author Cosmo Wolfe
     */
    function squareToQuadrilateral(p1, p2, p3, p4) {
        var dx3 = p1.x - p2.x + p3.x - p4.x;
        var dy3 = p1.y - p2.y + p3.y - p4.y;
        if (dx3 === 0 && dy3 === 0) {
            // Affine
            return {
                a11: p2.x - p1.x,
                a12: p2.y - p1.y,
                a13: 0,
                a21: p3.x - p2.x,
                a22: p3.y - p2.y,
                a23: 0,
                a31: p1.x,
                a32: p1.y,
                a33: 1
            };
        }
        else {
            var dx1 = p2.x - p3.x;
            var dx2 = p4.x - p3.x;
            var dy1 = p2.y - p3.y;
            var dy2 = p4.y - p3.y;
            var denominator = dx1 * dy2 - dx2 * dy1;
            var a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
            var a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
            return {
                a11: p2.x - p1.x + a13 * p2.x,
                a12: p2.y - p1.y + a13 * p2.y,
                a13: a13,
                a21: p4.x - p1.x + a23 * p4.x,
                a22: p4.y - p1.y + a23 * p4.y,
                a23: a23,
                a31: p1.x,
                a32: p1.y,
                a33: 1
            };
        }
    }
    function quadrilateralToSquare(p1, p2, p3, p4) {
        // Here, the adjoint serves as the inverse:
        var sToQ = squareToQuadrilateral(p1, p2, p3, p4);
        return {
            a11: sToQ.a22 * sToQ.a33 - sToQ.a23 * sToQ.a32,
            a12: sToQ.a13 * sToQ.a32 - sToQ.a12 * sToQ.a33,
            a13: sToQ.a12 * sToQ.a23 - sToQ.a13 * sToQ.a22,
            a21: sToQ.a23 * sToQ.a31 - sToQ.a21 * sToQ.a33,
            a22: sToQ.a11 * sToQ.a33 - sToQ.a13 * sToQ.a31,
            a23: sToQ.a13 * sToQ.a21 - sToQ.a11 * sToQ.a23,
            a31: sToQ.a21 * sToQ.a32 - sToQ.a22 * sToQ.a31,
            a32: sToQ.a12 * sToQ.a31 - sToQ.a11 * sToQ.a32,
            a33: sToQ.a11 * sToQ.a22 - sToQ.a12 * sToQ.a21
        };
    }
    function times(a, b) {
        return {
            a11: a.a11 * b.a11 + a.a21 * b.a12 + a.a31 * b.a13,
            a12: a.a12 * b.a11 + a.a22 * b.a12 + a.a32 * b.a13,
            a13: a.a13 * b.a11 + a.a23 * b.a12 + a.a33 * b.a13,
            a21: a.a11 * b.a21 + a.a21 * b.a22 + a.a31 * b.a23,
            a22: a.a12 * b.a21 + a.a22 * b.a22 + a.a32 * b.a23,
            a23: a.a13 * b.a21 + a.a23 * b.a22 + a.a33 * b.a23,
            a31: a.a11 * b.a31 + a.a21 * b.a32 + a.a31 * b.a33,
            a32: a.a12 * b.a31 + a.a22 * b.a32 + a.a32 * b.a33,
            a33: a.a13 * b.a31 + a.a23 * b.a32 + a.a33 * b.a33
        };
    }
    function extract(image, location) {
        var qToS = quadrilateralToSquare({ x: 3.5, y: 3.5 }, { x: location.dimension - 3.5, y: 3.5 }, { x: location.dimension - 6.5, y: location.dimension - 6.5 }, { x: 3.5, y: location.dimension - 3.5 });
        var sToQ = squareToQuadrilateral(location.topLeft, location.topRight, location.alignmentPattern, location.bottomLeft);
        var transform = times(sToQ, qToS);
        var matrix = BitMatrix.createEmpty(location.dimension, location.dimension);
        var mappingFunction = function (x, y) {
            var denominator = transform.a13 * x + transform.a23 * y + transform.a33;
            return {
                x: Math.max(0, (transform.a11 * x + transform.a21 * y + transform.a31) / denominator),
                y: Math.max(0, (transform.a12 * x + transform.a22 * y + transform.a32) / denominator)
            };
        };
        for (var y = 0; y < location.dimension; y++) {
            for (var x = 0; x < location.dimension; x++) {
                var xValue = x + 0.5;
                var yValue = y + 0.5;
                var sourcePixel = mappingFunction(xValue, yValue);
                matrix.set(x, y, image.get(Math.floor(sourcePixel.x), Math.floor(sourcePixel.y)));
            }
        }
        return {
            matrix: matrix,
            mappingFunction: mappingFunction
        };
    }

    /**
     * @module binarizer
     * @author nuintun
     * @author Cosmo Wolfe
     */
    var REGION_SIZE = 8;
    var MIN_DYNAMIC_RANGE = 24;
    function numBetween(value, min, max) {
        return value < min ? min : value > max ? max : value;
    }
    // Like BitMatrix but accepts arbitry Uint8 values
    var Matrix = /*#__PURE__*/ (function () {
        function Matrix(width, height, buffer) {
            this.width = width;
            var bufferSize = width * height;
            if (buffer && buffer.length !== bufferSize) {
                throw 'wrong buffer size';
            }
            this.data = buffer || new Uint8ClampedArray(bufferSize);
        }
        Matrix.prototype.get = function (x, y) {
            return this.data[y * this.width + x];
        };
        Matrix.prototype.set = function (x, y, value) {
            this.data[y * this.width + x] = value;
        };
        return Matrix;
    }());
    function binarize(data, width, height, returnInverted, greyscaleWeights, canOverwriteImage) {
        var pixelCount = width * height;
        if (data.length !== pixelCount * 4) {
            throw 'malformed data passed to binarizer';
        }
        // Assign the greyscale and binary image within the rgba buffer as the rgba image will not be needed after conversion
        var bufferOffset = 0;
        // Convert image to greyscale
        var greyscaleBuffer;
        if (canOverwriteImage) {
            greyscaleBuffer = new Uint8ClampedArray(data.buffer, bufferOffset, pixelCount);
            bufferOffset += pixelCount;
        }
        var greyscalePixels = new Matrix(width, height, greyscaleBuffer);
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var position = (y * width + x) * 4;
                var r = data[position];
                var g = data[position + 1];
                var b = data[position + 2];
                var value = greyscaleWeights.red * r + greyscaleWeights.green * g + greyscaleWeights.blue * b;
                greyscalePixels.set(x, y, greyscaleWeights.useIntegerApproximation ? (value + 128) >> 8 : value);
            }
        }
        var horizontalRegionCount = Math.ceil(width / REGION_SIZE);
        var verticalRegionCount = Math.ceil(height / REGION_SIZE);
        var blackPointsCount = horizontalRegionCount * verticalRegionCount;
        var blackPointsBuffer;
        if (canOverwriteImage) {
            blackPointsBuffer = new Uint8ClampedArray(data.buffer, bufferOffset, blackPointsCount);
            bufferOffset += blackPointsCount;
        }
        var blackPoints = new Matrix(horizontalRegionCount, verticalRegionCount, blackPointsBuffer);
        for (var verticalRegion = 0; verticalRegion < verticalRegionCount; verticalRegion++) {
            for (var hortizontalRegion = 0; hortizontalRegion < horizontalRegionCount; hortizontalRegion++) {
                var sum = 0;
                var min = Infinity;
                var max = 0;
                for (var y = 0; y < REGION_SIZE; y++) {
                    for (var x = 0; x < REGION_SIZE; x++) {
                        var pixelLumosity = greyscalePixels.get(hortizontalRegion * REGION_SIZE + x, verticalRegion * REGION_SIZE + y);
                        sum += pixelLumosity;
                        min = Math.min(min, pixelLumosity);
                        max = Math.max(max, pixelLumosity);
                    }
                }
                var average = sum / Math.pow(REGION_SIZE, 2);
                if (max - min <= MIN_DYNAMIC_RANGE) {
                    // If variation within the block is low, assume this is a block with only light or only
                    // dark pixels. In that case we do not want to use the average, as it would divide this
                    // low contrast area into black and white pixels, essentially creating data out of noise.
                    //
                    // Default the blackpoint for these blocks to be half the min - effectively white them out
                    average = min / 2;
                    if (verticalRegion > 0 && hortizontalRegion > 0) {
                        // Correct the "white background" assumption for blocks that have neighbors by comparing
                        // the pixels in this block to the previously calculated black points. This is based on
                        // the fact that dark barcode symbology is always surrounded by some amount of light
                        // background for which reasonable black point estimates were made. The bp estimated at
                        // the boundaries is used for the interior.
                        // The (min < bp) is arbitrary but works better than other heuristics that were tried.
                        var averageNeighborBlackPoint = (blackPoints.get(hortizontalRegion, verticalRegion - 1) +
                            2 * blackPoints.get(hortizontalRegion - 1, verticalRegion) +
                            blackPoints.get(hortizontalRegion - 1, verticalRegion - 1)) /
                            4;
                        if (min < averageNeighborBlackPoint) {
                            average = averageNeighborBlackPoint;
                        }
                    }
                }
                blackPoints.set(hortizontalRegion, verticalRegion, average);
            }
        }
        var binarized;
        if (canOverwriteImage) {
            var binarizedBuffer = new Uint8ClampedArray(data.buffer, bufferOffset, pixelCount);
            bufferOffset += pixelCount;
            binarized = new BitMatrix(binarizedBuffer, width);
        }
        else {
            binarized = BitMatrix.createEmpty(width, height);
        }
        var inverted = null;
        if (returnInverted) {
            if (canOverwriteImage) {
                var invertedBuffer = new Uint8ClampedArray(data.buffer, bufferOffset, pixelCount);
                inverted = new BitMatrix(invertedBuffer, width);
            }
            else {
                inverted = BitMatrix.createEmpty(width, height);
            }
        }
        for (var verticalRegion = 0; verticalRegion < verticalRegionCount; verticalRegion++) {
            for (var hortizontalRegion = 0; hortizontalRegion < horizontalRegionCount; hortizontalRegion++) {
                var left = numBetween(hortizontalRegion, 2, horizontalRegionCount - 3);
                var top_1 = numBetween(verticalRegion, 2, verticalRegionCount - 3);
                var sum = 0;
                for (var xRegion = -2; xRegion <= 2; xRegion++) {
                    for (var yRegion = -2; yRegion <= 2; yRegion++) {
                        sum += blackPoints.get(left + xRegion, top_1 + yRegion);
                    }
                }
                var threshold = sum / 25;
                for (var xRegion = 0; xRegion < REGION_SIZE; xRegion++) {
                    for (var yRegion = 0; yRegion < REGION_SIZE; yRegion++) {
                        var x = hortizontalRegion * REGION_SIZE + xRegion;
                        var y = verticalRegion * REGION_SIZE + yRegion;
                        var lum = greyscalePixels.get(x, y);
                        binarized.set(x, y, lum <= threshold);
                        if (returnInverted) {
                            inverted.set(x, y, !(lum <= threshold));
                        }
                    }
                }
            }
        }
        if (returnInverted) {
            return { binarized: binarized, inverted: inverted };
        }
        return { binarized: binarized };
    }

    /**
     * @module QRCode
     * @author nuintun
     * @author Cosmo Wolfe
     */
    function scan(matrix) {
        var location = locate(matrix);
        if (!location) {
            return null;
        }
        var extracted = extract(matrix, location);
        var decoded = decode(extracted.matrix);
        if (!decoded) {
            return null;
        }
        var dimension = location.dimension;
        return __assign({}, decoded, { location: {
                topLeft: extracted.mappingFunction(0, 0),
                topRight: extracted.mappingFunction(dimension, 0),
                bottomLeft: extracted.mappingFunction(0, dimension),
                bottomRight: extracted.mappingFunction(dimension, dimension),
                topLeftFinder: location.topLeft,
                topRightFinder: location.topRight,
                bottomLeftFinder: location.bottomLeft,
                bottomRightAlignment: decoded.version > 1 ? location.alignmentPattern : null
            } });
    }
    var defaultOptions = {
        canOverwriteImage: true,
        greyScaleWeights: {
            red: 0.2126,
            green: 0.7152,
            blue: 0.0722,
            useIntegerApproximation: false
        },
        inversionAttempts: 'attemptBoth'
    };
    function disposeImageEvents(image) {
        image.onload = null;
        image.onerror = null;
    }
    var Decoder = /*#__PURE__*/ (function () {
        function Decoder() {
            this.options = defaultOptions;
        }
        /**
         * @public
         * @method setOptions
         * @param {object} options
         */
        Decoder.prototype.setOptions = function (options) {
            if (options === void 0) { options = {}; }
            options = options || {};
            this.options = __assign({}, defaultOptions, options);
            return this;
        };
        /**
         * @public
         * @method decode
         * @param {Uint8ClampedArray} data
         * @param {number} width
         * @param {number} height
         * @returns {DecoderResult}
         */
        Decoder.prototype.decode = function (data, width, height) {
            var options = this.options;
            var canOverwriteImage = options.canOverwriteImage, greyScaleWeights = options.greyScaleWeights, inversionAttempts = options.inversionAttempts;
            var invert = inversionAttempts === 'attemptBoth' || inversionAttempts === 'invertFirst';
            var tryInvertedFirst = inversionAttempts === 'onlyInvert' || inversionAttempts === 'invertFirst';
            var _a = binarize(data, width, height, invert, greyScaleWeights, canOverwriteImage), binarized = _a.binarized, inverted = _a.inverted;
            var result = scan(tryInvertedFirst ? inverted : binarized);
            if (!result && invert) {
                result = scan(tryInvertedFirst ? binarized : inverted);
            }
            return result;
        };
        /**
         * @public
         * @method scan
         * @param {string} src
         * @returns {Promise}
         */
        Decoder.prototype.scan = function (src) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var image = new Image();
                // Image cross origin
                image.crossOrigin = 'anonymous';
                image.onload = function () {
                    disposeImageEvents(image);
                    var width = image.width;
                    var height = image.height;
                    var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');
                    canvas.width = width;
                    canvas.height = height;
                    context.drawImage(image, 0, 0);
                    var data = context.getImageData(0, 0, width, height).data;
                    var result = _this.decode(data, width, height);
                    if (result) {
                        return resolve(result);
                    }
                    return reject('failed to decode image');
                };
                image.onerror = function () {
                    disposeImageEvents(image);
                    reject("failed to load image: " + src);
                };
                image.src = src;
            });
        };
        return Decoder;
    }());

    /**
     * @module QRKanji
     * @author nuintun
     * @author Kazuhiko Arase
     * @description SJIS only
     */
    var QRKanji = /*#__PURE__*/ (function (_super) {
        __extends(QRKanji, _super);
        /**
         * @constructor
         * @param {string} data
         */
        function QRKanji(data) {
            var _this = _super.call(this, exports.Mode.Kanji, data) || this;
            _this.bytes = SJIS(data);
            return _this;
        }
        /**
         * @public
         * @method write
         * @param {BitBuffer} buffer
         */
        QRKanji.prototype.write = function (buffer) {
            var index = 0;
            var bytes = this.bytes;
            var length = bytes.length;
            while (index + 1 < length) {
                var code = ((0xff & bytes[index]) << 8) | (0xff & bytes[index + 1]);
                if (0x8140 <= code && code <= 0x9ffc) {
                    code -= 0x8140;
                }
                else if (0xe040 <= code && code <= 0xebbf) {
                    code -= 0xc140;
                }
                code = ((code >> 8) & 0xff) * 0xc0 + (code & 0xff);
                buffer.put(code, 13);
                index += 2;
            }
        };
        /**
         * @public
         * @method getLength
         * @returns {number}
         */
        QRKanji.prototype.getLength = function () {
            return Math.floor(this.bytes.length / 2);
        };
        return QRKanji;
    }(QRData));

    /**
     * @module UTF16
     * @author nuintun
     */
    function UTF16(str) {
        var bytes = [];
        var length = str.length;
        for (var i = 0; i < length; i++) {
            bytes.push(str.charCodeAt(i));
        }
        return bytes;
    }

    /**
     * @module QRNumeric
     * @author nuintun
     * @author Kazuhiko Arase
     */
    function getCode(byte) {
        // 0 - 9
        if (0x30 <= byte && byte <= 0x39) {
            return byte - 0x30;
        }
        throw "illegal char: " + String.fromCharCode(byte);
    }
    function getBatchCode(bytes) {
        var num = 0;
        var length = bytes.length;
        for (var i = 0; i < length; i++) {
            num = num * 10 + getCode(bytes[i]);
        }
        return num;
    }
    var QRNumeric = /*#__PURE__*/ (function (_super) {
        __extends(QRNumeric, _super);
        /**
         * @constructor
         * @param {string} data
         */
        function QRNumeric(data) {
            var _this = _super.call(this, exports.Mode.Numeric, data) || this;
            _this.bytes = UTF16(data);
            return _this;
        }
        /**
         * @public
         * @method write
         * @param {BitBuffer} buffer
         */
        QRNumeric.prototype.write = function (buffer) {
            var i = 0;
            var bytes = this.bytes;
            var length = bytes.length;
            while (i + 2 < length) {
                buffer.put(getBatchCode([bytes[i], bytes[i + 1], bytes[i + 2]]), 10);
                i += 3;
            }
            if (i < length) {
                if (length - i === 1) {
                    buffer.put(getBatchCode([bytes[i]]), 4);
                }
                else if (length - i === 2) {
                    buffer.put(getBatchCode([bytes[i], bytes[i + 1]]), 7);
                }
            }
        };
        /**
         * @public
         * @method getLength
         * @returns {number}
         */
        QRNumeric.prototype.getLength = function () {
            return this.bytes.length;
        };
        return QRNumeric;
    }(QRData));

    /**
     * @module QRAlphanumeric
     * @author nuintun
     * @author Kazuhiko Arase
     */
    function getCode$1(byte) {
        if (0x30 <= byte && byte <= 0x39) {
            // 0 - 9
            return byte - 0x30;
        }
        else if (0x41 <= byte && byte <= 0x5a) {
            // A - Z
            return byte - 0x41 + 10;
        }
        else {
            switch (byte) {
                // space
                case 0x20:
                    return 36;
                // $
                case 0x24:
                    return 37;
                // %
                case 0x25:
                    return 38;
                // *
                case 0x2a:
                    return 39;
                // +
                case 0x2b:
                    return 40;
                // -
                case 0x2d:
                    return 41;
                // .
                case 0x2e:
                    return 42;
                // /
                case 0x2f:
                    return 43;
                // :
                case 0x3a:
                    return 44;
                default:
                    throw "illegal char: " + String.fromCharCode(byte);
            }
        }
    }
    var QRAlphanumeric = /*#__PURE__*/ (function (_super) {
        __extends(QRAlphanumeric, _super);
        /**
         * @constructor
         * @param {string} data
         */
        function QRAlphanumeric(data) {
            var _this = _super.call(this, exports.Mode.Alphanumeric, data) || this;
            _this.bytes = UTF16(data);
            return _this;
        }
        /**
         * @public
         * @method write
         * @param {BitBuffer} buffer
         */
        QRAlphanumeric.prototype.write = function (buffer) {
            var i = 0;
            var bytes = this.bytes;
            var length = bytes.length;
            while (i + 1 < length) {
                buffer.put(getCode$1(bytes[i]) * 45 + getCode$1(bytes[i + 1]), 11);
                i += 2;
            }
            if (i < length) {
                buffer.put(getCode$1(bytes[i]), 6);
            }
        };
        /**
         * @public
         * @method getLength
         * @returns {number}
         */
        QRAlphanumeric.prototype.getLength = function () {
            return this.bytes.length;
        };
        return QRAlphanumeric;
    }(QRData));

    /**
     * @module index
     * @author nuintun
     */

    exports.Decoder = Decoder;
    exports.Encoder = Encoder;
    exports.QRAlphanumeric = QRAlphanumeric;
    exports.QRByte = QRByte;
    exports.QRKanji = QRKanji;
    exports.QRNumeric = QRNumeric;

}));
