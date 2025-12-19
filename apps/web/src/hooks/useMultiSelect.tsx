import { useMemo, useState } from "react";
import { Option } from "@/components/ui/MultiSelect";
import { TestStatus } from "@/types/TestСase";

type SelectedValue = TestStatus | "_all";

export const useMultiSelect = (
	defaultOptions: Option[] = [],
	defaultValue: SelectedValue[] = ["_all", "OK", "NOK", "NEED_RUN"],
) => {
	const [selectedValues, setSelectedValues] = useState<SelectedValue[]>(defaultValue);

	const options = useMemo(() => {
		return [{ label: "All Testcases", value: "_all", icon: null }, ...defaultOptions];
	}, [defaultOptions]);

	const onChange = (value: SelectedValue) => {
		if (value === "_all") {
			if (selectedValues.includes("_all")) {
				// If "all" is already selected – reset all selections
				setSelectedValues([]);
			} else {
				// We select all options
				setSelectedValues(options.map((option) => option.value) as SelectedValue[]);
			}
		} else {
			if (selectedValues.includes(value)) {
				// Deselecting an individual option
				let newSelection = selectedValues.filter((v) => v !== value);
				// If "all" was selected, we remove it too.
				if (newSelection.includes("_all")) {
					newSelection = newSelection.filter((v) => v !== "_all");
				}
				setSelectedValues(newSelection);
			} else {
				// We choose a separate option
				const newSelection = [...selectedValues, value];
				// If all individual options are selected after this, we add "all" automatically
				const individualOptions = options
					.filter((option) => option.value !== "_all")
					.map((o) => o.value as SelectedValue);
				if (
					individualOptions.every((opt) => newSelection.includes(opt)) &&
					!newSelection.includes("_all")
				) {
					newSelection.push("_all" as SelectedValue);
				}
				setSelectedValues(newSelection);
			}
		}
	};

	return {
		setSelectedValues,
		selectedValues,
		options,
		onChange,
	};
};
