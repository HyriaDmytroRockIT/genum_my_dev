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
	Select,
	SelectTrigger,
	SelectContent,
	SelectValue,
	SelectItem,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useParams } from "react-router-dom";
import { useUserStore } from "@/stores/user.store";
import { organizationApi } from "@/api/organization";
import { projectApi, ProjectMember } from "@/api/project";

interface User {
	id: number;
	email: string;
	name: string;
	picture?: string;
}

export default function ProjectMembers() {
	const { toast } = useToast();
	const { orgId, projectId } = useParams();

	const userData = useUserStore((state) => state.userData);

	const [members, setMembers] = React.useState<ProjectMember[]>([]);
	const [availableUsers, setAvailableUsers] = React.useState<User[]>([]);
	const [hasAvailableUsersEndpoint, setHasAvailableUsersEndpoint] = React.useState(true);
	const [loading, setLoading] = React.useState(false);
	const [dialogOpen, setDialogOpen] = React.useState(false);
	const [selectedUserId, setSelectedUserId] = React.useState<string>("");
	const [selectedRole, setSelectedRole] = React.useState<string>("MEMBER");
	const [deletingMember, setDeletingMember] = React.useState<number | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [memberToDelete, setMemberToDelete] = React.useState<ProjectMember | null>(null);
	const [updatingRole, setUpdatingRole] = React.useState<number | null>(null);
	const [addingMember, setAddingMember] = React.useState(false);

	const fetchMembers = React.useCallback(async () => {
		if (!orgId || !projectId) return;

		try {
			setLoading(true);
			const data = await projectApi.getMembers();
			setMembers(data.members ?? []);
		} catch {
			toast({
				title: "Error",
				description: "Failed to load members",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	}, [toast, orgId, projectId]);

	const fetchAvailableUsers = React.useCallback(async () => {
		try {
			const data = await organizationApi.getMembersNotInProject();

			const allUsers = (data.members ?? []).map((m) => m.user);
			setAvailableUsers(allUsers);
			setHasAvailableUsersEndpoint(true);
		} catch (e) {
			console.error(e);
			setHasAvailableUsersEndpoint(false);
			setAvailableUsers([]);
		}
	}, []);

	const addMember = async () => {
		if (!selectedUserId || !selectedRole) {
			toast({
				title: "Error",
				description: "Please select user and role",
				variant: "destructive",
			});
			return;
		}

		try {
			setAddingMember(true);
			await projectApi.addMember({
				userId: parseInt(selectedUserId),
				role: selectedRole,
			});

			toast({ title: "Success", description: "Member added successfully" });

			setSelectedUserId("");
			setSelectedRole("MEMBER");
			setDialogOpen(false);

			await fetchMembers();
		} catch {
			toast({
				title: "Error",
				description: "Failed to add member",
				variant: "destructive",
			});
		} finally {
			setAddingMember(false);
		}
	};

	const updateRole = async (id: number, role: string) => {
		try {
			setUpdatingRole(id);

			await projectApi.updateMemberRole(id, { role });

			setMembers((prev) =>
				prev.map((m) =>
					m.id === id
						? {
								...m,
								role,
							}
						: m,
				),
			);
			toast({ title: "Success", description: "Role updated successfully" });
		} catch {
			toast({
				title: "Error",
				description: "Failed to update role",
				variant: "destructive",
			});
		} finally {
			setUpdatingRole(null);
		}
	};

	const deleteMember = async (member: ProjectMember) => {
		try {
			setDeletingMember(member.id);

			await projectApi.deleteMember(member.id);

			toast({ title: "Success", description: "Member removed successfully" });

			await fetchMembers();
			setDeleteDialogOpen(false);
			setMemberToDelete(null);
		} catch {
			toast({
				title: "Error",
				description: "Failed to remove member",
				variant: "destructive",
			});
		} finally {
			setDeletingMember(null);
		}
	};

	const handleDeleteClick = (member: ProjectMember) => {
		setMemberToDelete(member);
		setDeleteDialogOpen(true);
	};

	React.useEffect(() => {
		fetchMembers();
	}, [fetchMembers]);

	React.useEffect(() => {
		if (dialogOpen) {
			fetchAvailableUsers();
		}
	}, [dialogOpen, fetchAvailableUsers]);

	return (
		<Card className="rounded-md shadow-none">
			<CardHeader className="flex items-center justify-between flex-row space-y-0">
				<CardTitle className="text-[18px] font-medium dark:text-[#fff] text-[#18181B]">
					Project Members
				</CardTitle>
				<div className="flex gap-2">
					<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
						<DialogTrigger asChild>
							<Button size="default">
								<PlusCircle className="mr-2 h-4 w-4" />
								Add Member
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Add New Member</DialogTitle>
								<DialogDescription>
									{" "}
									{hasAvailableUsersEndpoint && availableUsers.length > 0
										? "Select a user and assign them a role in the project."
										: hasAvailableUsersEndpoint && availableUsers.length === 0
											? "All organization members are already part of this project."
											: "Enter user details and assign them a role in the project."}{" "}
								</DialogDescription>
							</DialogHeader>

							<div className="grid gap-4 py-0">
								{hasAvailableUsersEndpoint && availableUsers.length > 0 && (
									<div className="grid gap-2">
										<label
											htmlFor="user-select"
											className="text-sm font-medium"
										>
											User
										</label>
										<Select
											value={selectedUserId}
											onValueChange={setSelectedUserId}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select user..." />
											</SelectTrigger>
											<SelectContent>
												{" "}
												{availableUsers.map((user) => (
													<SelectItem
														key={user.id}
														value={user.id.toString()}
													>
														<div className="flex flex-col">
															<span>{user.email}</span>
															<span className="text-xs text-muted-foreground">
																{user.name}
															</span>
														</div>
													</SelectItem>
												))}{" "}
											</SelectContent>
										</Select>
									</div>
								)}

								{hasAvailableUsersEndpoint && availableUsers.length === 0 && (
									<div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
										<p className="text-sm text-gray-800">
											All organization members are already part of this
											project.
										</p>
									</div>
								)}

								{!hasAvailableUsersEndpoint && (
									<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
										<p className="text-sm text-yellow-800">
											User selection is not available. Please contact an
											administrator to add members to this project.
										</p>
									</div>
								)}

								<div className="grid gap-2">
									<label htmlFor="role-select" className="text-sm font-medium">
										Role
									</label>
									<Select value={selectedRole} onValueChange={setSelectedRole}>
										<SelectTrigger>
											<SelectValue placeholder="Select role..." />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="MEMBER">Member</SelectItem>
											<SelectItem value="OWNER">Owner</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => {
										setDialogOpen(false);
										setSelectedUserId("");
										setSelectedRole("MEMBER");
									}}
								>
									Cancel
								</Button>
								<Button
									onClick={addMember}
									disabled={
										!hasAvailableUsersEndpoint ||
										availableUsers.length === 0 ||
										!selectedUserId ||
										!selectedRole ||
										addingMember
									}
								>
									{addingMember ? "Adding..." : "Add Member"}{" "}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>

			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Remove Member</DialogTitle>
						<DialogDescription>
							Are you sure you want to remove
							<strong>{memberToDelete?.user.name}</strong>(
							{memberToDelete?.user.email}) from this project? This action cannot be
							undone.
						</DialogDescription>
					</DialogHeader>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setDeleteDialogOpen(false);
								setMemberToDelete(null);
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={() => memberToDelete && deleteMember(memberToDelete)}
							disabled={!memberToDelete || deletingMember !== null}
							className="bg-red-600 hover:bg-red-700 text-white"
						>
							{deletingMember === memberToDelete?.id
								? "Removing..."
								: "Remove Member"}{" "}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<CardContent className="p-6 pt-0">
				{loading ? (
					<div className="p-6 text-sm text-muted-foreground">Loading…</div>
				) : members.length === 0 ? (
					<div className="p-6 text-sm text-muted-foreground">No members</div>
				) : (
					<div className="relative overflow-x-auto rounded-md border-0">
						<Table className="rounded-md overflow-hidden">
							<TableHeader className="bg-[#F4F4F5] dark:bg-[#262626] dark:text-[#fff] h-12 font-medium text-muted-foreground">
								<TableRow>
									<TableHead className="text-left p-4">User Email</TableHead>
									<TableHead className="text-left p-4">User Name</TableHead>
									<TableHead className="text-left p-4">Role</TableHead>
									<TableHead className="w-[100px] text-center p-4">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{" "}
								{members.map((m) => (
									<TableRow key={m.id}>
										<TableCell>{m.user.email}</TableCell>
										<TableCell>{m.user.name}</TableCell>
										<TableCell>
											<Select
												value={m.role}
												onValueChange={(v) => updateRole(m.id, v)}
												disabled={updatingRole === m.id}
											>
												<SelectTrigger className="w-[120px] text-[14px] h-[30px]">
													<SelectValue placeholder={m.role} />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="OWNER">Owner</SelectItem>
													<SelectItem value="MEMBER">Member</SelectItem>
												</SelectContent>
											</Select>
										</TableCell>
										<TableCell className="text-center">
											<Button
												variant="ghost"
												onClick={() => handleDeleteClick(m)}
												disabled={
													deletingMember === m.id ||
													userData?.email === m.user.email
												}
												size="sm"
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
		</Card>
	);
}
