/**
 * Created by Markus Gierlinger on 16-Jul-17.
 */

const atob = require('atob');
const {PNG} = require('pngjs');   // load the PNG class from the pngjs module to read the obfuscated bytes in the correct order


/**
 * Decode and unescape the underlying data
 * @param {string} data - the snipped which should be decoded
 * @returns {string} the decoded string
 */
function unescapeA2B(data) {
    return unescape(decodeURIComponent(atob(data)))
}

/**
 * Main routine of decoding the obfuscated strings by reading the bytes from an image and converting them into chars.
 * @param {number[]} imgData - buffer of bytes from the image with the source data
 * @param {number[]} nums - array with the numbers marking the range of bytes, which should be decoded
 * @returns {string} the decoded string
 */
function decodeRoutine(imgData, nums) {
    let res = "";

    // iteratively convert bytes into chars
    for(let i = nums[2]; i < imgData.length; i+=4)
        res += (imgData[i] !== nums[1]) ? String.fromCharCode(imgData[i]) : "";
    res = res.trim();

    return unescapeA2B(res);
}

/**
 * Extract and parse the array with obfuscated snippets of reused code blocks from the whole sample code
 * @param {string} str - obfuscated code containing an array with the snippets;
 * @returns {string[]} array with the parsed snippets
 */
function extractSnippets(str) {
    // look for the assignment of the array with the snippets
    let start = str.indexOf('=[ \'') + 3;
    if (start < 3) {
        throw new Error("Couldn't find beginning of snippets!");
    }
    let end = str.indexOf('];', start) - 1;

    let subStr = str.substring(start, end);
    // extract and split the array
    return subStr.split(', ').map((s) => {
        // drop the '' from each snippet
       return s.slice(1, -1);
    });
}

/**
 * Extract the array of 3 integers from the whole sample code
 * @param {string} str - obfuscated code containing an array with the snippets;
 * @returns {[number,number,number]} array with the extracted numbers
 */
function extractMagicNumbers(str) {
    let start = str.indexOf('}];') + 3;  // find end of collection of functions
    if (start < 3) {
        throw new Error("Couldn't find beginning of numbers!");
    }
    start = str.indexOf('=[', start) + 2; // skip the variable name and go to beginning of the array
    let end = str.indexOf('];', start);

    let subStr = str.substring(start, end);

    // extract and split the array
    return subStr.split(',').map((s) => {
        return parseInt(s, 10);
    });
}

/**
 * Decode the obfuscated code by extracting the obfuscated snippets, interpreting the obfuscated target code as image and decoding everything.
 * @param {string} str - sample code which should be decoded.
 * @returns {string} the decoded sample code
 */
function process(str) {
    let snippets = extractSnippets(str);
    let nums = extractMagicNumbers(str);
    // the 9th snippet contains the actual target code, all other snippets are helper blocks
    let imgBuffer = new Buffer(snippets[9], 'base64');
    let img = PNG.sync.read(imgBuffer);

    return decodeRoutine(img.data, nums);
}

/**
 * Deobfuscate the given code
 * @param {string} str - The sample code which shall be processed
 * @returns {Object} an object containing the resulting code of the operation
 */
function decode(str) {
    let code = "";

    try {
        code = process(str) || "";
    } catch (exc) {
        console.warn("[JS2img] Couldn't decode string: " + exc);
    }

    return {
        code: code,
    };
}

module.exports = {
    name: 'JS2Image Decoder',
    decode: decode
};