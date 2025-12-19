import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/useToast";
import { CirclePlus, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { useParams } from "react-router-dom";
import { projectApi, ProjectAPIKey } from "@/api/project";

type SortColumn = "name" | "publicKey" | "author" | "createdAt" | "lastUsed";
type SortDirection = "asc" | "desc";

export default function ProjectAPIKeys() {
	const { orgId, projectId } = useParams();
	const [apiKeys, setApiKeys] = useState<ProjectAPIKey[]>([]);
	const [newKeyName, setNewKeyName] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const { toast } = useToast();
	const [showKey, setShowKey] = useState(false);
	const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

	const [newApiKeyResponse, setNewApiKeyResponse] = useState<null | {
		key: string;
	}>(null);

	useEffect(() => {
		if (!orgId || !projectId) return;

		fetchAPIKeys();
	}, [orgId, projectId]);

	const fetchAPIKeys = async () => {
		try {
			setIsLoading(true);
			const data = await projectApi.getAPIKeys();
			setApiKeys(data.apiKeys || []);
		} catch (error) {
			console.error("Error fetching API keys:", error);
			toast({
				title: "Error",
				description: "Failed to load API keys",
				variant: "destructive",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreateAPIKey = async () => {
		try {
			const data = await projectApi.createAPIKey({ name: newKeyName });

			setNewApiKeyResponse({ key: data.apiKey.key });
			setNewKeyName("");
		} catch (error) {
			console.error("Error creating API key:", error);
			toast({
				title: "Error",
				description: "Failed to create API key",
				variant: "destructive",
				duration: 3000,
			});
		}
	};

	const handleDeleteAPIKey = async (keyId: string | number) => {
		try {
			await projectApi.deleteAPIKey(keyId);

			toast({
				title: "Success",
				description: "API key deleted successfully",
				duration: 3000,
			});

			setApiKeys((prev) => prev.filter((key) => key.id !== keyId));
		} catch (error) {
			console.error("Error deleting API key:", error);
			toast({
				title: "Error",
				description: "Failed to delete API key",
				variant: "destructive",
				duration: 3000,
			});
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				toast({
					title: "Copied",
					description: "API key copied to clipboard",
					duration: 3000,
				});
			})
			.catch((err) => {
				console.error("Could not copy text: ", err);
			});
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

	const sortedApiKeys = useMemo(() => {
		if (!sortColumn) return apiKeys;

		return [...apiKeys].sort((a, b) => {
			let aValue: string | number;
			let bValue: string | number;

			switch (sortColumn) {
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
	}, [apiKeys, sortColumn, sortDirection]);

	return (
		<Card className="rounded-md shadow-none">
			<div className="flex items-center justify-between p-6">
				<CardTitle className="text-[18px] font-medium dark:text-[#fff] text-[#18181B]">
					Project API Keys
				</CardTitle>

				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button size="default">
							<CirclePlus className="h-4 w-4 mr-2" />
							Add API Key
						</Button>
					</DialogTrigger>

					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Add API Key</DialogTitle>
						</DialogHeader>
						{newApiKeyResponse ? (
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="apiKey">API Key</Label>

									<div className="relative">
										<Input
											id="apiKey"
											type={showKey ? "text" : "password"}
											value={newApiKeyResponse.key}
											readOnly
											className="pr-[72px] text-[15px] font-mono h-[40px]"
										/>

										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => setShowKey((v) => !v)}
											className="absolute inset-y-0 top-[4px] right-[36px] h-8 w-8 flex items-center [&_svg]:size-5"
										>
											{showKey ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}{" "}
										</Button>

										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => copyToClipboard(newApiKeyResponse.key)}
											className="absolute inset-y-0 right-0 h-[40px] w-8 bg-black text-white rounded-tr-md rounded-br-md"
										>
											<Copy className="h-4 w-4" />
										</Button>
									</div>
								</div>

								<p className="text-sm text-muted-foreground">
									Your new API key has been created.{" "}
									<span className="font-medium text-zinc-800">
										Please copy it now.
									</span>{" "}
									You won’t be able to see it again!
								</p>

								<DialogFooter>
									<Button
										onClick={() => {
											setNewApiKeyResponse(null);
											setIsDialogOpen(false);
											setShowKey(false);
											fetchAPIKeys();
										}}
									>
										Done
									</Button>
								</DialogFooter>
							</div>
						) : (
							<div className="grid gap-4">
								<div className="space-y-2">
									<Label htmlFor="apiKeyName">Name</Label>
									<Input
										id="apiKeyName"
										placeholder="Enter API Key name"
										value={newKeyName}
										onChange={(e) => setNewKeyName(e.target.value)}
									/>
								</div>

								<DialogFooter>
									<Button
										variant="outline"
										onClick={() => setIsDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button
										onClick={handleCreateAPIKey}
										disabled={!newKeyName.trim()}
									>
										Save
									</Button>
								</DialogFooter>
							</div>
						)}{" "}
					</DialogContent>
				</Dialog>
			</div>

			<div className="px-6 pb-4">
				<p className="text-sm text-muted-foreground">
					API keys are required to enable external prompt execution and integrations.{" "}
					<a
						href="https://docs.genum.ai/Integration/integration-api"
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-600 underline hover:text-blue-800"
					>
						Learn more
					</a>
				</p>
			</div>

			<CardContent>
				<div className="relative overflow-x-auto rounded-md">
					<Table className="rounded-md overflow-hidden">
						<TableHeader className="bg-[#F4F4F5] dark:bg-[#262626] dark:text-[#fff] h-12 font-medium text-muted-foreground text-center">
							<TableRow>
								<TableHead
									onClick={() => handleSort("name")}
									className="cursor-pointer px-4"
								>
									Name
								</TableHead>
								<TableHead
									onClick={() => handleSort("publicKey")}
									className="cursor-pointer px-4"
								>
									Key
								</TableHead>
								<TableHead
									onClick={() => handleSort("author")}
									className="cursor-pointer px-4"
								>
									Created by
								</TableHead>
								<TableHead
									onClick={() => handleSort("createdAt")}
									className="cursor-pointer px-4"
								>
									Created At
								</TableHead>
								<TableHead
									onClick={() => handleSort("lastUsed")}
									className="cursor-pointer px-4"
								>
									Last Used
								</TableHead>
								<TableHead className="px-4">Actions</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{" "}
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={6} className="py-8 text-center">
										<div className="flex items-center justify-center gap-2">
											<div className="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-500" />
											Loading...
										</div>
									</TableCell>
								</TableRow>
							) : apiKeys.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="py-8 text-center text-gray-500"
									>
										No API keys found
									</TableCell>
								</TableRow>
							) : (
								sortedApiKeys.map((apiKey) => (
									<TableRow key={apiKey.id}>
										<TableCell className="text-center px-4 py-3 font-medium">
											{apiKey.name}{" "}
										</TableCell>

										<TableCell className="text-center px-4 py-3">
											<code className="font-mono text-sm">
												{formatAPIKey(apiKey.publicKey)}{" "}
											</code>
										</TableCell>

										<TableCell className="text-center px-4 py-3">
											<div className="flex items-center justify-center gap-2">
												<Avatar className="h-6 w-6">
													<AvatarImage src={apiKey.author?.picture} />
													<AvatarFallback className="text-xs">
														{getUserInitials(
															apiKey.author?.name || "Unknown",
														)}{" "}
													</AvatarFallback>
												</Avatar>
												<span className="text-sm">
													{apiKey.author?.name || "Unknown"}{" "}
												</span>
											</div>
										</TableCell>

										<TableCell className="text-center px-4 py-3">
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<span className="cursor-help text-sm">
															{formatDate(apiKey.createdAt)}{" "}
														</span>
													</TooltipTrigger>
													<TooltipContent>
														{" "}
														{formatFullDate(apiKey.createdAt)}{" "}
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</TableCell>

										<TableCell className="text-center px-4 py-3">
											{apiKey.lastUsed ? (
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<span className="cursor-help text-sm">
																{formatDate(apiKey.lastUsed)}{" "}
															</span>
														</TooltipTrigger>
														<TooltipContent>
															{" "}
															{formatFullDate(apiKey.lastUsed)}{" "}
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											) : (
												<span className="text-sm text-muted-foreground">
													Never
												</span>
											)}{" "}
										</TableCell>

										<TableCell className="text-center px-4 py-3">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDeleteAPIKey(apiKey.id)}
												className="h-8 w-8 p-0"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))
							)}{" "}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
