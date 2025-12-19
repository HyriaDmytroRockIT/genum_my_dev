type Role = "agent";

type RiskLevel = "low" | "medium" | "high";

interface Risk {
	type: string;
	comment: string;
	recommendation: string;
	level: RiskLevel;
}

export interface AuditPromptValue {
	summary: string;
	risks: Risk[];
	rate: number;
}

export type Action =
	| {
			type: "audit_prompt";
			value: AuditPromptValue;
	  }
	| {
			type: "edit_prompt";
			value: string;
			chainOfThoughts: string;
	  };

type ActionResponse = { role: Role; message: string } & (
	| {
			type: "action";
			action: Action;
	  }
	| {
			type: "text";
	  }
);

type ResponseType = ActionResponse["type"];

interface TextResponse {
	role: Role;
	type: "text";
	message: string;
}

type AgentResponse = ActionResponse | TextResponse;

export interface SendMessageAgentResponse {
	response: AgentResponse[] | AgentResponse;
}

export interface Message {
	message: string;
	role: "user" | "agent";
	type: "action" | "text";
	id?: string;
	timestamp?: Date;
	action?: {
		type: "edit_prompt" | "audit_prompt";
		value: string;
	};
}

export interface GetMessageResponse {
	messages: Message[];
}
