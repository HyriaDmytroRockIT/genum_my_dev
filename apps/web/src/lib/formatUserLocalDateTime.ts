type DateInput = string | number | Date | null | undefined;

export function formatUserLocalDateTime(value: DateInput, fallback: string = "-") {
	if (value === null || value === undefined) {
		return fallback;
	}

	const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);

	if (Number.isNaN(date.getTime())) {
		return typeof value === "string" ? value : fallback;
	}

	try {
		return Intl.DateTimeFormat(undefined, {
			dateStyle: "medium",
			timeStyle: "medium",
			timeZoneName: "short",
		}).format(date);
	} catch {
		return date.toLocaleString();
	}
}
