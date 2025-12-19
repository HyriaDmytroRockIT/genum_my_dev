import * as React from "react";
import { useParams } from "react-router-dom";
import { PlusCircle, Trash2, Eye, EyeOff } from "lucide-react";

import { useToast } from "@/hooks/useToast";
import { organizationApi } from "@/api/organization";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
	Table,
	TableHeader,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogTrigger,
	DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type Vendor = "OPENAI" | "GOOGLE" | "ANTHROPIC";

interface AIKey {
	id: number;
	vendor: string;
	createdAt: string;
	publicKey: string;
}

export default function OrgAIKeys() {
	const { toast } = useToast();
	const { orgId } = useParams<{ orgId: string; projectId: string }>();

	const [keys, setKeys] = React.useState<AIKey[]>([]);
	const [isLoadingKeys, setIsLoadingKeys] = React.useState(false);

	const [quota, setQuota] = React.useState<number | null>(null);
	const [isLoadingQuota, setIsLoadingQuota] = React.useState(false);

	const [openAdd, setOpenAdd] = React.useState(false);
	const [vendor, setVendor] = React.useState<Vendor>("OPENAI");
	const [secret, setSecret] = React.useState("");
	const [showSecret, setShowSecret] = React.useState(false);
	const [isCreating, setIsCreating] = React.useState(false);

	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [keyToDelete, setKeyToDelete] = React.useState<AIKey | null>(null);
	const [deletingKeyId, setDeletingKeyId] = React.useState<number | null>(null);

	const fetchQuota = React.useCallback(async () => {
		try {
			setIsLoadingQuota(true);
			const data = await organizationApi.getQuota();
			setQuota(data?.quota?.balance ?? null);
		} catch (e) {
			console.error(e);
			toast({ title: "Error", description: "Failed to load quota", variant: "destructive" });
			setQuota(null);
		} finally {
			setIsLoadingQuota(false);
		}
	}, [toast]);

	const fetchKeys = React.useCallback(async () => {
		try {
			setIsLoadingKeys(true);
			const data = await organizationApi.getAIKeys();
			setKeys(data?.keys ?? []);
		} catch (e) {
			console.error(e);
			toast({ title: "Error", description: "Failed to load keys", variant: "destructive" });
			setKeys([]);
		} finally {
			setIsLoadingKeys(false);
		}
	}, [toast]);

	React.useEffect(() => {
		fetchKeys();
		fetchQuota();
	}, []);

	const handleAdd = async () => {
		const trimmed = secret.trim();
		if (!trimmed || isCreating) return;

		try {
			setIsCreating(true);
			await organizationApi.createAIKey({ key: trimmed, vendor });
			toast({ title: "Success", description: "Key added" });

			setOpenAdd(false);
			setSecret("");
			setShowSecret(false);

			await fetchKeys();
		} catch (e) {
			console.error(e);
			toast({ title: "Error", description: "Cannot add key", variant: "destructive" });
		} finally {
			setIsCreating(false);
		}
	};

	const openDeleteDialog = (key: AIKey) => {
		setKeyToDelete(key);
		setDeleteDialogOpen(true);
	};

	const deleteKey = async () => {
		if (!keyToDelete || deletingKeyId !== null) return;

		try {
			setDeletingKeyId(keyToDelete.id);
			await organizationApi.deleteAIKey(keyToDelete.id);

			toast({ title: "Deleted", description: "Key removed" });

			setDeleteDialogOpen(false);
			setKeyToDelete(null);

			await fetchKeys();
		} catch (e) {
			console.error(e);
			toast({ title: "Error", description: "Cannot delete key", variant: "destructive" });
		} finally {
			setDeletingKeyId(null);
		}
	};

	const formatBalance = (balance: number | null) => {
		if (balance === null) return "--";
		return `$${balance.toFixed(2)}`;
	};

	return (
		<Card className="rounded-md shadow-none">
			<Card className="w-auto rounded-md shadow-[0px_1px_2px_0px_#0000000D] mx-6 mt-6 p-6">
				<CardContent className="p-0">
					<p className="text-[14px] leading-[20px] font-medium mb-2">Balance:</p>
					<p className="text-[24px] leading-[32px] font-bold">
						{isLoadingQuota ? "Loading..." : formatBalance(quota)}
					</p>
					<p className="text-[12px] leading-[16px] text-[#71717A]">
						While your organization has quota, it will be used for AI requests. Once the
						quota is exhausted, user-provided API keys will be used instead.
					</p>
				</CardContent>
			</Card>

			<CardHeader className="flex items-center justify-between flex-row">
				<CardTitle className="text-[18px] font-medium dark:text-[#fff] text-[#18181B]">
					LLM Provider Keys
				</CardTitle>

				<Dialog open={openAdd} onOpenChange={setOpenAdd}>
					<DialogTrigger asChild>
						<Button size="default" className="w-[144px]">
							<PlusCircle className="mr-2 h-4 w-4" /> Add Key
						</Button>
					</DialogTrigger>

					<DialogContent className="sm:max-w-[420px]">
						<DialogHeader>
							<DialogTitle>Add LLM Provider Key</DialogTitle>
						</DialogHeader>

						<div className="space-y-4 py-2">
							<div className="space-y-1">
								<Label>Vendor</Label>
								<Select
									value={vendor}
									onValueChange={(v) => setVendor(v as Vendor)}
								>
									<SelectTrigger className="text-[14px]">
										<SelectValue placeholder="Select vendor" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="OPENAI">Open AI</SelectItem>
										<SelectItem value="GOOGLE">Google</SelectItem>
										<SelectItem value="ANTHROPIC">Anthropic</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-1">
								<Label>API Key</Label>
								<div className="relative">
									<Input
										type={showSecret ? "text" : "password"}
										value={secret}
										onChange={(e) => setSecret(e.target.value)}
										className="pr-10"
										placeholder="Enter API key"
									/>
									<button
										type="button"
										className="absolute right-2 top-2 text-zinc-500 [&_svg]:size-5"
										onClick={() => setShowSecret((s) => !s)}
									>
										{showSecret ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>
						</div>

						<DialogFooter>
							<Button onClick={handleAdd} disabled={!secret.trim() || isCreating}>
								{isCreating ? "Adding..." : "OK"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</CardHeader>

			<CardContent className="p-6 pt-0">
				{isLoadingKeys ? (
					<div className="p-6 text-sm text-muted-foreground">Loading…</div>
				) : keys.length === 0 ? (
					<div className="p-6 text-sm text-muted-foreground">No keys</div>
				) : (
					<div className="relative overflow-x-auto rounded-md border-0">
						<Table className="rounded-md overflow-hidden">
							<TableHeader className="bg-[#F4F4F5] dark:bg-[#262626] dark:text-[#fff] h-12 font-medium text-muted-foreground">
								<TableRow>
									<TableHead className="text-left p-4">Vendor</TableHead>
									<TableHead className="text-left p-4">API Key</TableHead>
									<TableHead className="text-left p-4">Created At</TableHead>
									<TableHead className="w-[100px] text-center p-4">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{keys.map((k) => (
									<TableRow key={k.id}>
										<TableCell>{k.vendor}</TableCell>
										<TableCell>{k.publicKey}</TableCell>
										<TableCell>
											{new Date(k.createdAt).toLocaleString()}
										</TableCell>
										<TableCell className="text-center">
											<Button
												variant="ghost"
												className="size-8"
												onClick={() => openDeleteDialog(k)}
												disabled={deletingKeyId === k.id}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>

			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Delete API Key</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete the{" "}
							<strong>{keyToDelete?.vendor}</strong> API key{" "}
							<strong>"{keyToDelete?.publicKey}"</strong>? This action cannot be
							undone.
						</DialogDescription>
					</DialogHeader>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setDeleteDialogOpen(false);
								setKeyToDelete(null);
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={deleteKey}
							disabled={!keyToDelete || deletingKeyId !== null}
							className="bg-red-600 hover:bg-red-700 text-white"
						>
							{deletingKeyId === keyToDelete?.id ? "Deleting..." : "Delete Key"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
