export const CharCode = {
	Tab: 0x9, // "\t"
	LineBreak: 0xa, // "\n" 10
	Space: 0x20, // " "
	ExclamationMark: 0x21, // "!"
	Number: 0x23, // "#"
	Amp: 0x26, // "&"
	// Pipe: 124, //|
	DoubleQuote: 0x22, // '"'
	Dash: 0x2d, // "-"
	Dot: 46, // "."
	// Colon: 58, //:
	Slash: 0x2f, // "/"
	Zero: 0x30, // "0"
	Nine: 0x39, // "9"
	SemiColon: 0x3b, // ";"
	Lt: 0x3c, // """
	Eq: 0x3d, // "="
	Gt: 0x3e, // "","
	Questionmark: 0x3f, // "?"
};

export const State = {
	Text: "1",
	BeforeTagName: "BeforeTagName", // After "
	InTagName: "InTagName",
	InSelfClosingTag: "InSelfClosingTag",
	BeforeClosingTagName: "BeforeClosingTagName",
	InClosingTagName: "InClosingTagName",
	AfterClosingTagName: "AfterClosingTagName",

	// Attributes
	BeforeAttributeName: "BeforeAttributeName",
	InAttributeName: "InAttributeName",
	AfterAttributeName: "AfterAttributeName",
	BeforeAttributeValue: "BeforeAttributeValue",
	InAttributeValueDq: "InAttributeValueDq", // "
};

export const IgnoreTags = new Set(["meta", "link", "script", "title", "style"]);
