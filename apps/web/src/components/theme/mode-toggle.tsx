import { Monitor, Moon, Sun } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/components/theme/theme-provider";

export function ModeToggle() {
	const { theme, setTheme } = useTheme();
	const value = theme ?? "system";

	return (
		<Tabs
			value={value}
			onValueChange={(v) => v && setTheme(v as "light" | "dark" | "system")}
			className="w-fit"
		>
			<TabsList className="bg-muted rounded-xl p-1 gap-1">
				<TabsTrigger
					value="system"
					aria-label="System theme"
					className="h-7 w-[74px] rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
				>
					<Monitor className="h-4 w-4" />
					<span className="sr-only">System</span>
				</TabsTrigger>

				<TabsTrigger
					value="light"
					aria-label="Light theme"
					className="h-7 w-[74px] rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
				>
					<Sun className="h-4 w-4" />
					<span className="sr-only">Light</span>
				</TabsTrigger>

				<TabsTrigger
					value="dark"
					aria-label="Dark theme"
					className="h-7 w-[74px] rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
				>
					<Moon className="h-4 w-4" />
					<span className="sr-only">Dark</span>
				</TabsTrigger>
			</TabsList>
		</Tabs>
	);
}

export default ModeToggle;
