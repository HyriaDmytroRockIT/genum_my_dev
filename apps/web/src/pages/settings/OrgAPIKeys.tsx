import * as React from "react";
import { Trash2 } from "lucide-react";

import { useToast } from "@/hooks/useToast";
import { organizationApi } from "@/api/organization";
import { projectApi } from "@/api/project";

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
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OrgKey {
	id: number;
	name: string;
	publicKey: string;
	createdAt: string;
	lastUsed?: string;
	project: {
		id: number;
		name: string;
	};
	author: {
		id: number;
		name: string;
		email: string;
		picture?: string;
	};
}

interface KeysResponse {
	keys: OrgKey[];
}

export default function OrgAPIKeys() {
	const { toast } = useToast();

	type SortColumn = "projectName" | "name" | "publicKey" | "author" | "createdAt" | "lastUsed";

	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [keyToDelete, setKeyToDelete] = React.useState<OrgKey | null>(null);
	const [sortColumn, setSortColumn] = React.useState<SortColumn | null>(null);
	const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

	const [keys, setKeys] = React.useState<OrgKey[]>([]);
	const [isLoading, setIsLoading] = React.useState(false);
	const [isDeleting, setIsDeleting] = React.useState(false);

	const fetchKeys = React.useCallback(async () => {
		try {
			setIsLoading(true);
			const data: KeysResponse = await organizationApi.getProjectKeys();
			setKeys(data?.keys ?? []);
		} catch (err) {
			console.error(err);
			toast({
				title: "Error",
				description: "Failed to load API keys",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}, [toast]);

	React.useEffect(() => {
		fetchKeys();
	}, [fetchKeys]);

	const handleDeleteClick = (key: OrgKey) => {
		setKeyToDelete(key);
		setDeleteDialogOpen(true);
	};

	const deleteKey = async (key: OrgKey) => {
		try {
			setIsDeleting(true);
			await projectApi.deleteAPIKey(key.id);
			toast({ title: "Deleted", description: "Key removed" });
			await fetchKeys();
		} catch (err) {
			console.error(err);
			toast({
				title: "Error",
				description: "Cannot delete key",
				variant: "destructive",
			});
		} finally {
			setIsDeleting(false);
			setDeleteDialogOpen(false);
			setKeyToDelete(null);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

		if (diffInHours < 1) {
			return "Just now";
		} else if (diffInHours < 24) {
			return `${diffInHours}h ago`;
		} else if (diffInHours < 48) {
			return "1d ago";
		} else {
			const diffInDays = Math.floor(diffInHours / 24);
			return `${diffInDays}d ago`;
		}
	};

	const formatFullDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("en-GB", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	};

	const formatAPIKey = (key: string) => {
		if (!key) return "";
		const start = key.substring(0, 8);
		const end = key.substring(key.length - 8);
		return `${start}...${end}`;
	};

	const getUserInitials = (name: string) => {
		return name
			.split(" ")
			.map((word) => word.charAt(0))
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	const handleSort = (column: SortColumn) => {
		if (sortColumn === column) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortColumn(column);
			setSortDirection("asc");
		}
	};

	const sortedKeys = React.useMemo(() => {
		if (!sortColumn) return keys;

		return [...keys].sort((a, b) => {
			let aValue: string | number;
			let bValue: string | number;

			switch (sortColumn) {
				case "projectName":
					aValue = a.project.name.toLowerCase();
					bValue = b.project.name.toLowerCase();
					break;
				case "name":
					aValue = a.name.toLowerCase();
					bValue = b.name.toLowerCase();
					break;
				case "publicKey":
					aValue = a.publicKey.toLowerCase();
					bValue = b.publicKey.toLowerCase();
					break;
				case "author":
					aValue = (a.author?.name || "").toLowerCase();
					bValue = (b.author?.name || "").toLowerCase();
					break;
				case "createdAt":
					aValue = new Date(a.createdAt).getTime();
					bValue = new Date(b.createdAt).getTime();
					break;
				case "lastUsed":
					aValue = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
					bValue = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
					break;
				default:
					return 0;
			}

			if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
			if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
			return 0;
		});
	}, [keys, sortColumn, sortDirection]);

	return (
		<Card className="rounded-md shadow-none">
			<CardHeader className="flex items-center justify-between flex-row">
				<CardTitle className="text-[18px] font-medium dark:text-[#fff] text-[#18181B]">
					Organization API Keys
				</CardTitle>
			</CardHeader>

			<div className="px-6 pb-4">
				<p className="text-sm text-muted-foreground">
					API keys are required to enable external prompt execution and integrations.{" "}
					<a
						href="https://docs.genum.ai/Integration/integration-api"
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-600 hover:text-blue-800 underline"
					>
						Learn more
					</a>
				</p>
			</div>

			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Delete API Key</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete the API key{" "}
							<strong>"{keyToDelete?.name}"</strong> from project{" "}
							<strong>{keyToDelete?.project.name}</strong>? This action cannot be
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
							disabled={isDeleting}
						>
							Cancel
						</Button>
						<Button
							onClick={() => keyToDelete && deleteKey(keyToDelete)}
							disabled={!keyToDelete || isDeleting}
							className="bg-red-600 hover:bg-red-700 text-white"
						>
							{isDeleting ? "Deleting..." : "Delete Key"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<CardContent className="p-6 pt-0">
				{isLoading ? (
					<div className="p-6 text-sm text-muted-foreground">Loading…</div>
				) : keys.length === 0 ? (
					<div className="p-6 text-sm text-muted-foreground">No keys</div>
				) : (
					<div className="relative overflow-x-auto rounded-md border-0">
						<Table className="rounded-md overflow-hidden">
							<TableHeader className="bg-[#F4F4F5] dark:bg-[#262626] dark:text-[#fff] h-12 font-medium text-muted-foreground">
								<TableRow>
									<TableHead
										className="text-center p-4 cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#3A3A3A] transition-colors"
										onClick={() => handleSort("projectName")}
									>
										Project Name
									</TableHead>
									<TableHead
										className="text-center p-4 cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#3A3A3A] transition-colors"
										onClick={() => handleSort("name")}
									>
										Key Name
									</TableHead>
									<TableHead
										className="text-center p-4 cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#3A3A3A] transition-colors"
										onClick={() => handleSort("publicKey")}
									>
										Key
									</TableHead>
									<TableHead
										className="text-center p-4 cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#3A3A3A] transition-colors"
										onClick={() => handleSort("author")}
									>
										Created by
									</TableHead>
									<TableHead
										className="text-center p-4 cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#3A3A3A] transition-colors"
										onClick={() => handleSort("createdAt")}
									>
										Created At
									</TableHead>
									<TableHead
										className="text-center p-4 cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#3A3A3A] transition-colors"
										onClick={() => handleSort("lastUsed")}
									>
										Last Used
									</TableHead>
									<TableHead className="w-[120px] text-center p-4">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sortedKeys.map((k) => (
									<TableRow key={k.id}>
										<TableCell className="px-4 py-3 text-center">
											<div className="font-medium">{k.project.name}</div>
										</TableCell>
										<TableCell className="px-4 py-3 text-center">
											<div className="font-medium">{k.name}</div>
										</TableCell>
										<TableCell className="px-4 py-3 text-center">
											<code className="font-mono text-sm">
												{formatAPIKey(k.publicKey)}
											</code>
										</TableCell>
										<TableCell className="px-4 py-3 text-center">
											<div className="flex items-center justify-center gap-2">
												<Avatar className="h-6 w-6">
													<AvatarImage src={k.author?.picture} />
													<AvatarFallback className="text-xs">
														{getUserInitials(
															k.author?.name || "Unknown",
														)}
													</AvatarFallback>
												</Avatar>
												<span className="text-sm">
													{k.author?.name || "Unknown"}
												</span>
											</div>
										</TableCell>
										<TableCell className="px-4 py-3 text-center">
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<span className="text-sm cursor-help">
															{formatDate(k.createdAt)}
														</span>
													</TooltipTrigger>
													<TooltipContent>
														<p>{formatFullDate(k.createdAt)}</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</TableCell>
										<TableCell className="px-4 py-3 text-center">
											{k.lastUsed ? (
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<span className="text-sm cursor-help">
																{formatDate(k.lastUsed)}
															</span>
														</TooltipTrigger>
														<TooltipContent>
															<p>{formatFullDate(k.lastUsed)}</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											) : (
												<span className="text-sm text-muted-foreground">
													Never
												</span>
											)}
										</TableCell>
										<TableCell className="text-center px-4 py-3">
											<div className="flex gap-1 justify-center">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDeleteClick(k)}
													disabled={isDeleting}
													className="h-8 w-8 p-0"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
