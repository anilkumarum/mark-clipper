const utf8encoder = new TextEncoder();
/** @param {String} data */
export const encode = (data) => utf8encoder.encode(data);

export const getBlob = async (srcUrl) => await (await fetch(srcUrl)).blob();
