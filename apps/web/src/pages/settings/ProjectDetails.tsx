import * as React from "react";
import { useParams } from "react-router-dom";

import { useToast } from "@/hooks/useToast";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { projectApi, Project } from "@/api/project";

export default function ProjectDetails() {
	const { toast } = useToast();
	const { orgId, projectId } = useParams();

	const [project, setProject] = React.useState<Project | null>(null);
	const [loading, setLoading] = React.useState(false);
	const [saving, setSaving] = React.useState(false);

	const fetchProject = React.useCallback(async () => {
		if (!orgId || !projectId) return;

		try {
			setLoading(true);
			const data = await projectApi.getProject();
			setProject(data.project);
		} catch {
			toast({
				title: "Error",
				description: "Failed to load project",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	}, [toast, orgId, projectId]);

	React.useEffect(() => {
		fetchProject();
	}, [fetchProject]);

	const [open, setOpen] = React.useState(false);
	const [name, setName] = React.useState("");
	const [desc, setDesc] = React.useState("");

	const openEditor = () => {
		if (!project) return;

		setName(project.name);
		setDesc(project.description);
		setOpen(true);
	};

	const saveChanges = async () => {
		if (!project) return;

		try {
			setSaving(true);
			await projectApi.updateProject({
				name: name.trim(),
				description: desc.trim(),
			});

			toast({ title: "Saved", description: "Project updated" });
			setOpen(false);
			await fetchProject();
		} catch {
			toast({
				title: "Error",
				description: "Could not update project",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	if (loading || !project) return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;

	return (
		<Card className="rounded-md shadow-none">
			<CardContent className="space-y-4 p-6 max-w-[724px]">
				<div className="flex items-start justify-between">
					<CardTitle className="text-[18px] font-medium dark:text-[#fff] text-[#18181B]">
						Project Details
					</CardTitle>
					<Button variant="outline" size="sm" onClick={openEditor}>
						Edit
					</Button>
				</div>
				<div className="space-y-1.5 ">
					<Label className="mb-1 block text-[#18181B] dark:text-[#FAFAFA]">Name</Label>
					<Input disabled value={project.name} />
				</div>
				<div className="space-y-1.5 ">
					<Label className="mb-1 block text-[#18181B] dark:text-[#FAFAFA]">
						Description
					</Label>
					<Input disabled value={project.description} />
				</div>
			</CardContent>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Project Details</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-2">
						<div className="space-y-1">
							<Label>Name</Label>
							<Input value={name} onChange={(e) => setName(e.target.value)} />
						</div>
						<div className="space-y-1">
							<Label>Description</Label>
							<Textarea
								rows={4}
								value={desc}
								onChange={(e) => setDesc(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button onClick={saveChanges} disabled={saving || !name.trim()}>
							Save changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
