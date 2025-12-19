import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface Props {
	models: {
		model: string;
		total_requests: number;
	}[];
}

const COLORS = [
	"#EED0FF",
	"#D7EFEB",
	"#FFE4F2",
	"#B66AD6",
	"#C4EECF",
	"#FFD7D8",
	"#6C98F2",
	"#DEEADE",
	"#FFE6B1",
	"#C1DFF9",
	"#E7F5C8",
	"#F9ECDB",
];

export function ChartApiDistribution({ models }: Props) {
	const total = models.reduce((sum, m) => sum + m.total_requests, 0);

	const chartData = models.map((m) => ({
		name: m.model,
		value: m.total_requests,
	}));

	return (
		<Card className="flex flex-col border-0 shadow-none">
			<CardHeader className="p-0 pb-4">
				<CardTitle>API Calls</CardTitle>
			</CardHeader>
			<CardContent className="h-[100%] flex gap-6 items-center p-0 pr-6">
				<div className="relative w-[160px] h-[160px]">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={chartData}
								cx="50%"
								cy="50%"
								innerRadius={45}
								outerRadius={80}
								dataKey="value"
								strokeWidth={2}
							>
								{chartData.map((_, i) => (
									<Cell key={i} fill={COLORS[i % COLORS.length]} />
								))}
							</Pie>
						</PieChart>
					</ResponsiveContainer>
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="text-2xl font-bold">{total}</div>
					</div>
				</div>

				<div className="flex flex-col gap-3">
					{chartData.map((entry, i) => (
						<div key={i} className="flex items-center gap-2 h-4">
							<span
								className="h-2 w-2 rounded-[2px]"
								style={{ backgroundColor: COLORS[i % COLORS.length] }}
							/>
							<span className="text-[12px] text-[#18181B]">{entry.name}</span>
							<span className="ml-auto font-semibold text-[#18181B] bg-[#F4F4F5] px-[3px] min-w-[23px] text-center rounded-md text-[10px]">
								{entry.value}
							</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
