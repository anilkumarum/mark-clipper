const CharCode = {
	Dot: 46,
	Slash: 47,
	LineBreak: 0xa, // "\n" 10
	Tab: 0x9, // "\t"
};

/** @param {string} data */
export function trimRight(data) {
	const size = data.length;

	//trim right
	let endI = size;
	while (--endI) if (data.charCodeAt(endI) !== CharCode.LineBreak && data.charCodeAt(endI) !== CharCode.Tab) break;
	return data.slice(0, endI + 1); //+1 adjust
}
