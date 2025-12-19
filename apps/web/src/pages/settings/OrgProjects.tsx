import * as React from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
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
import { useParams, useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/stores/user.store";
import { organizationApi } from "@/api/organization";
import { userApi } from "@/api/user";

interface Project {
	id: number;
	name: string;
	description: string;
	initial: boolean;
	organizationId: number;
	_count: {
		members: number;
		Prompts: number;
	};
}

export default function OrgProjects() {
	const { toast } = useToast();
	const { orgId, projectId } = useParams<{
		orgId: string;
		projectId: string;
	}>();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const [projects, setProjects] = React.useState<Project[]>([]);
	const [isLoading, setIsLoading] = React.useState(false);

	const currentProjectId = React.useMemo(() => {
		if (!projectId) return null;

		const n = Number(projectId);
		return Number.isFinite(n) ? n : null;
	}, [projectId]);

	const [openCreate, setOpenCreate] = React.useState(false);
	const [newName, setNewName] = React.useState("");
	const [newDescription, setNewDescription] = React.useState("");

	const [deletingId, setDeletingId] = React.useState<number | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null);

	const invalidateUserData = React.useCallback(async () => {
		await queryClient.invalidateQueries({ queryKey: ["userData"] });
		await queryClient.refetchQueries({ queryKey: ["userData"] });
	}, [queryClient]);

	const fetchProjects = React.useCallback(async () => {
		try {
			setIsLoading(true);
			const data = await organizationApi.getProjects();
			setProjects(data.projects ?? []);
		} catch (e) {
			console.error(e);
			toast({
				title: "Error",
				description: "Failed to load projects",
				variant: "destructive",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	}, [toast]);

	React.useEffect(() => {
		fetchProjects();
	}, [fetchProjects]);

	const handleCreate = async () => {
		if (!newName.trim()) return;

		try {
			await organizationApi.createProject({
				name: newName.trim(),
				description: newDescription.trim() || undefined,
			});

			toast({ title: "Success", description: "Project created", duration: 3000 });
			setOpenCreate(false);
			setNewName("");
			setNewDescription("");

			const { setUserData, setUser } = useUserStore.getState();
			try {
				const currentUser = await userApi.getCurrentUser();
				setUserData(currentUser);
				setUser({
					name: currentUser.name || "",
					email: currentUser.email || "",
					avatar: currentUser.avatar,
				});
			} catch (err) {
				console.error("Error refreshing user data:", err);
			}

			await Promise.all([fetchProjects(), invalidateUserData()]);
		} catch (e) {
			console.error(e);
			toast({
				title: "Error",
				description: "Project creation failed",
				variant: "destructive",
				duration: 3000,
			});
		}
	};

	const openDeleteDialog = (project: Project) => {
		setProjectToDelete(project);
		setDeleteDialogOpen(true);
	};

	const deleteProject = async (project: Project) => {
		try {
			setDeletingId(project.id);

			const isCurrentProject = projectId && project.id.toString() === projectId;

			let targetProjectId: string | null = null;
			let targetProject: Project | undefined = undefined;
			if (isCurrentProject) {
				const initialProject = projects.find((p) => p.initial && p.id !== project.id);
				if (initialProject) {
					targetProject = initialProject;
					targetProjectId = initialProject.id.toString();
				} else if (projects.length > 1) {
					const firstAvailableProject = projects.find((p) => p.id !== project.id);
					if (firstAvailableProject) {
						targetProject = firstAvailableProject;
						targetProjectId = firstAvailableProject.id.toString();
					}
				}
			}

			setProjects((prev) => prev.filter((p) => p.id !== project.id));

			await organizationApi.deleteProject(project.id);

			toast({ title: "Deleted", description: "Project removed", duration: 3000 });

			setDeleteDialogOpen(false);
			setProjectToDelete(null);

			if (isCurrentProject && orgId) {
				if (targetProjectId && targetProject) {
					if (targetProject.organizationId.toString() === orgId) {
						navigate(`/${orgId}/${targetProjectId}/settings/org/projects`);
					}
				} else {
					navigate(`/${orgId}/settings/org/details`);
				}
			}

			const { setUserData, setUser, setLoading } = useUserStore.getState();
			if (isCurrentProject) {
				setLoading(true);
				setUserData(null);
				return;
			}

			try {
				const currentUser = await userApi.getCurrentUser();
				setUserData(currentUser);
				setUser({
					name: currentUser.name || "",
					email: currentUser.email || "",
					avatar: currentUser.avatar,
				});
			} catch (err) {
				console.error("Error refreshing user data:", err);
			}

			await invalidateUserData();
		} catch (e) {
			console.error(e);
			setProjects((prev) => [...prev, project]);
			toast({
				title: "Error",
				description: "Deletion failed",
				variant: "destructive",
				duration: 3000,
			});
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<Card className="rounded-md shadow-none">
			<CardHeader className="flex items-center justify-between flex-row">
				<CardTitle className="text-[18px] font-medium dark:text-[#fff] text-[#18181B]">
					Projects
				</CardTitle>
				<div className="flex gap-2">
					<Dialog open={openCreate} onOpenChange={setOpenCreate}>
						<DialogTrigger asChild>
							<Button size="default">
								<PlusCircle className="mr-2 h-4 w-4" />
								Create Project
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create New Project</DialogTitle>
							</DialogHeader>
							<div className="flex flex-col gap-3 py-2">
								<div>
									<Label htmlFor="project-name">Project Name</Label>
									<Input
										id="project-name"
										value={newName}
										onChange={(e) => setNewName(e.target.value)}
										placeholder="Awesome project"
									/>
								</div>
								<div>
									<Label className="mt-3" htmlFor="project-description">
										Description
									</Label>
									<Textarea
										id="project-description"
										rows={4}
										value={newDescription}
										onChange={(e) => setNewDescription(e.target.value)}
										placeholder="Enter project description"
									/>
								</div>
							</div>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => setOpenCreate(false)}
								>
									Cancel
								</Button>
								<Button onClick={handleCreate} disabled={!newName.trim()}>
									Create
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>

			<CardContent className="p-6 pt-0">
				{isLoading ? (
					<div className="p-6 text-sm text-muted-foreground">Loading…</div>
				) : projects.length === 0 ? (
					<div className="p-6 text-sm text-muted-foreground">No projects</div>
				) : (
					<div className="relative overflow-x-auto rounded-md border-0">
						<Table className="rounded-md overflow-hidden">
							<TableHeader className="bg-[#F4F4F5] text-[#71717A] dark:bg-[#262626] dark:text-[#fff] h-12 font-medium text-muted-foreground">
								<TableRow>
									<TableHead className="text-left p-4">Project Name</TableHead>
									<TableHead className="text-left p-4">Description</TableHead>
									<TableHead className="text-left p-4">Members</TableHead>
									<TableHead className="text-left p-4">Prompts</TableHead>
									<TableHead className="w-[140px] text-center p-4">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{" "}
								{projects.map((p) => (
									<TableRow
										key={p.id}
										className={
											currentProjectId === p.id
												? "hover:bg-[#F4F4F5] dark:hover:bg-[#1f1f22]"
												: undefined
										}
									>
										<TableCell className="align-middle">
											<div className="flex items-center gap-2">
												<span>{p.name}</span>
												{p.initial && (
													<span className="rounded bg-[#E4E4E7] px-2 py-0.5 text-[11px] font-medium text-[#3f3f46] dark:bg-[#3f3f46] dark:text-[#fafafa]">
														Default
													</span>
												)}{" "}
											</div>
										</TableCell>
										<TableCell
											className="align-middle truncate max-w-xs"
											title={p.description}
										>
											{p.description}{" "}
										</TableCell>
										<TableCell className="align-middle text-left">
											{p._count.members}
										</TableCell>
										<TableCell className="align-middle text-left">
											{p._count.Prompts}
										</TableCell>
										<TableCell className="align-middle text-center">
											<Button
												variant="ghost"
												size="sm"
												aria-label="Delete project"
												onClick={() => openDeleteDialog(p)}
												disabled={deletingId === p.id || p.initial}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}{" "}
							</TableBody>
						</Table>
					</div>
				)}{" "}
			</CardContent>

			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Delete Project</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete the project
							<strong>"{projectToDelete?.name}"</strong>? This action cannot be undone
							and will remove all associated data.
						</DialogDescription>
					</DialogHeader>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setDeleteDialogOpen(false);
								setProjectToDelete(null);
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={() => projectToDelete && deleteProject(projectToDelete)}
							disabled={!projectToDelete || deletingId !== null}
							className="bg-red-600 hover:bg-red-700 text-white"
						>
							{deletingId === projectToDelete?.id
								? "Deleting..."
								: "Delete Project"}{" "}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
