export const checkIsJson = (text: string) => {
	try {
		JSON.parse(text);
		return true;
	} catch {
		return false;
	}
};

export const parseJson = (text: string) => {
	if (checkIsJson(text)) {
		const parsedJson = JSON.parse(text);
		return JSON.stringify(parsedJson, null, 2);
	} else {
		return text;
	}
};
