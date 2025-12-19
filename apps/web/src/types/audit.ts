export interface AuditRisk {
	type: string;
	level: "high" | "medium" | "low";
	comment: string;
	recommendation: string;
}

export interface AuditData {
	risks: AuditRisk[];
	summary: string;
	rate: number;
}
