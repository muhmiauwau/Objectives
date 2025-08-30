import { extensionName, extensionSettings } from "../index.js";

// Logging functions
export function log(...msg) {
	console.log(`[${extensionName}]`, ...msg);
}

export function warn(...msg) {
	console.warn(`[${extensionName}] Warning`, ...msg);
}

export function error(...msg) {
	console.error(`[${extensionName}] Error`, ...msg);
}

export function debug(...msg) {
	if (extensionSettings.debugMode) {
		console.log(`[${extensionName} debug]`, ...msg);
	}
}



/**
 * Updates a nested property in an object using a path array.
 * @param {object} obj - The object to update.
 * @param {array} path - The path to the property.
 * @param {any} newValue - The new value to set.
 */
export function updatePath(obj, path, newValue) {
	const lastKey = path.pop();
	const target = path.reduce((acc, key) => acc[key], obj);
	target[lastKey] = newValue;
}

export function toTitleCase(str) {
	return str
		.toLowerCase()
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

export function unescapeJsonString(input) {
    const QUOTED_STRING_REGEX = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;

    let result = input.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\\/g, (match, quotedString) => {
        if (quotedString) {
            return quotedString;
        }
        return '';
    });

    const SPECIAL_CHARS_REGEX = /[\\~!@#$%^&*()_+{}|:"<>?\-=\[\];',.\/]/;

    result = result.replace(QUOTED_STRING_REGEX, (quoted) => {
        let inner = quoted;

        inner = inner.replace(/\\u(?![0-9A-Fa-f]{4})/g, '\\\\u');

        inner = inner.replace(/\\([^"\\/bfnrtu])?/g, (match, nextChar) => {
            if (!nextChar) {
                return '\\\\';
            }

            if (SPECIAL_CHARS_REGEX.test(nextChar)) {
                return nextChar;
            } else {
                return '\\\\' + nextChar;
            }
        });

        return inner;
    });

    return result;
}