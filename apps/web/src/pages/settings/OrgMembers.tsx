import * as React from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { organizationApi, Member, Invite } from "@/api/organization";

export default function OrgMembers() {
	const { toast } = useToast();

	const [members, setMembers] = React.useState<Member[]>([]);
	const [invites, setInvites] = React.useState<Invite[]>([]);
	const [loadingMembers, setLoadingMembers] = React.useState(false);
	const [loadingInvites, setLoadingInvites] = React.useState(false);
	const [deletingInvites, setDeletingInvites] = React.useState<Set<number>>(new Set());

	const [openAdd, setOpenAdd] = React.useState(false);
	const [inviteEmail, setInviteEmail] = React.useState("");
	const [inviting, setInviting] = React.useState(false);

	const fetchMembers = React.useCallback(async () => {
		try {
			setLoadingMembers(true);
			const response = await organizationApi.getMembers();
			setMembers(response.members.members ?? []);
		} catch (e) {
			console.error(e);
			toast({
				title: "Error",
				description: "Failed to load members",
				variant: "destructive",
			});
		} finally {
			setLoadingMembers(false);
		}
	}, [toast]);

	const fetchInvites = React.useCallback(async () => {
		try {
			setLoadingInvites(true);
			const data = await organizationApi.getInvites();
			setInvites(data.invites ?? []);
		} catch (e) {
			console.error(e);
			toast({
				title: "Error",
				description: "Failed to load invites",
				variant: "destructive",
			});
		} finally {
			setLoadingInvites(false);
		}
	}, [toast]);

	React.useEffect(() => {
		fetchMembers();
		fetchInvites();
	}, [fetchMembers, fetchInvites]);

	const handleInvite = async () => {
		const email = inviteEmail.trim();
		if (!email) return;

		try {
			setInviting(true);

			await organizationApi.inviteMember({ email });

			toast({ title: "Sent", description: "Invitation email sent" });
			setOpenAdd(false);
			setInviteEmail("");
			await fetchInvites();
		} catch (e) {
			console.error(e);
			toast({ title: "Error", description: "Could not send invite", variant: "destructive" });
		} finally {
			setInviting(false);
		}
	};

	const handleDeleteInvite = async (invite: Invite) => {
		try {
			setDeletingInvites((prev) => new Set(prev).add(invite.id));

			await organizationApi.deleteInvite(invite.token);

			toast({ title: "Success", description: "Invite deleted successfully" });
			await fetchInvites();
		} catch (e) {
			console.error(e);
			toast({
				title: "Error",
				description: "Failed to delete invite",
				variant: "destructive",
			});
		} finally {
			setDeletingInvites((prev) => {
				const next = new Set(prev);
				next.delete(invite.id);
				return next;
			});
		}
	};

	return (
		<Card className="rounded-md shadow-none">
			<CardContent className="p-0">
				<Tabs defaultValue="members">
					<TabsList className="m-6 mb-0">
						<TabsTrigger className="flex-1" value="members">
							Organization Members
						</TabsTrigger>
						<TabsTrigger className="flex-1" value="invites">
							Pending Invites
						</TabsTrigger>
					</TabsList>

					<TabsContent value="members" className="px-6 py-6 pt-0 mt-0">
						<CardHeader className="flex items-center justify-between flex-row py-6 px-0 space-y-0">
							<CardTitle className="text-[18px] font-medium dark:text-[#fff] text-[#18181B]">
								Organization Members
							</CardTitle>
							<div className="flex gap-2">
								<Dialog open={openAdd} onOpenChange={setOpenAdd}>
									<DialogTrigger asChild>
										<Button className="min-w-[175px]">
											<PlusCircle className="mr-2 h-4 w-4" /> Add Member
										</Button>
									</DialogTrigger>
									<DialogContent className="sm:max-w-[420px]">
										<DialogHeader>
											<DialogTitle>Invite Member</DialogTitle>
										</DialogHeader>
										<div className="space-y-4 py-2">
											<div className="space-y-2">
												<Label>Email</Label>
												<Input
													type="email"
													value={inviteEmail}
													onChange={(e) => setInviteEmail(e.target.value)}
													placeholder="name@example.com"
												/>
												<p className="text-xs text-muted-foreground">
													At the moment, all team members will have admin
													permissions.
												</p>
											</div>
										</div>
										<DialogFooter>
											<Button
												onClick={handleInvite}
												disabled={inviting || !inviteEmail.trim()}
											>
												Send Invite
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
						</CardHeader>

						<div className="pb-4">
							<p className="text-sm text-muted-foreground">
								Invite team members to collaborate on prompts and projects. All
								members have equal access to organization features.{" "}
								<a
									href="https://docs.genum.ai/teamwork"
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:text-blue-800 underline"
								>
									Learn more
								</a>
							</p>
						</div>

						{loadingMembers ? (
							<p className="text-sm text-muted-foreground">Loading…</p>
						) : members.length === 0 ? (
							<p className="text-sm text-muted-foreground">No members</p>
						) : (
							<div className="relative overflow-x-auto rounded-md border-0">
								<Table className="rounded-md overflow-hidden">
									<TableHeader className="bg-[#F4F4F5] dark:bg-[#262626] dark:text-[#fff] h-12">
										<TableRow>
											<TableHead className="p-4 text-left">Email</TableHead>
											<TableHead className="p-4 text-left">Name</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{members.map((m) => (
											<TableRow key={m.id}>
												<TableCell>{m.user.email}</TableCell>
												<TableCell>{m.user.name}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</TabsContent>

					<TabsContent value="invites" className="p-6 pt-0 mt-0">
						<CardHeader className="flex items-start justify-between px-0">
							<CardTitle className="text-[18px] font-medium dark:text-[#fff] text-[#18181B]">
								Pending Invites
							</CardTitle>
						</CardHeader>

						{loadingInvites ? (
							<p className="text-sm text-muted-foreground">Loading…</p>
						) : invites.length === 0 ? (
							<p className="text-sm text-muted-foreground">No pending invites</p>
						) : (
							<div className="relative overflow-x-auto rounded-md">
								<Table className="rounded-md overflow-hidden">
									<TableHeader className="bg-[#F4F4F5] dark:bg-[#262626] dark:text-[#fff] h-12">
										<TableRow>
											<TableHead className="p-4 text-left">Email</TableHead>
											<TableHead className="p-4 text-left">
												Invited At
											</TableHead>
											<TableHead className="p-4 text-center w-[100px]">
												Actions
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{invites.map((inv) => (
											<TableRow key={inv.id}>
												<TableCell>{inv.email}</TableCell>
												<TableCell>
													{new Date(inv.createdAt).toLocaleString()}
												</TableCell>
												<TableCell className="text-center">
													<Button
														size="icon"
														variant="ghost"
														onClick={() => handleDeleteInvite(inv)}
														disabled={deletingInvites.has(inv.id)}
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
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
