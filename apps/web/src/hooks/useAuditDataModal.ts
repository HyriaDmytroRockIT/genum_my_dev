import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuditPromptValue } from "@/types/Canvas";
import { useMutation } from "@tanstack/react-query";
import { promptApi } from "@/api/prompt";

const AUDIT_DATA_MODAL_QUERY_KEY = ["auditDataModal"];

function useAuditDataModal() {
	const queryClient = useQueryClient();

	const auditMutation = useMutation({
		mutationFn: async (promptId: string | number) => {
			return await promptApi.auditPrompt(promptId);
		},
	});

	const { data: auditDataModal } = useQuery<AuditPromptValue | null, Error>({
		queryKey: AUDIT_DATA_MODAL_QUERY_KEY,
		initialData: null,
		queryFn: async () => {
			return null;
		},
		staleTime: Infinity,
		gcTime: Infinity,
	});

	const setAuditDataModal = (value: AuditPromptValue | null) => {
		queryClient.setQueryData<AuditPromptValue | null>(AUDIT_DATA_MODAL_QUERY_KEY, value);
	};

	const runAudit = (promptId: string | number) => {
		auditMutation.mutate(promptId, {
			onSuccess: (data) => {
				setAuditDataModal(data.audit);
			},
			onError: (err) => {
				console.error("Помилка мутації аудиту:", err.message);
			},
		});
	};

	return {
		auditDataModal,
		setAuditDataModal,
		runAudit: runAudit,
		isAuditApiLoading: auditMutation.isPending,
		auditApiError: auditMutation.error,
	};
}

export default useAuditDataModal;
