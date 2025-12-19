import * as React from "react";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { organizationApi, Organization } from "@/api/organization";

const organizationFormSchema = z.object({
	name: z.string().min(1, { message: "Organization name is required" }),
	description: z.string().optional(),
});

type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

interface EditOrganizationFormProps {
	organization: Organization;
	onClose: () => void;
	onSuccess: () => void;
}

function EditOrganizationForm({ organization, onClose, onSuccess }: EditOrganizationFormProps) {
	const { toast } = useToast();
	const [isSaving, setIsSaving] = React.useState(false);

	const form = useForm<OrganizationFormValues>({
		resolver: zodResolver(organizationFormSchema as any),
		defaultValues: {
			name: organization.name,
			description: organization.description || "",
		},
	});

	const onSubmit = async (values: OrganizationFormValues) => {
		setIsSaving(true);

		const payload = {
			name: values.name.trim(),
			description: values.description?.trim() || "",
		};

		try {
			await organizationApi.updateOrganization(payload);

			toast({
				title: "Success",
				description: "Organization details updated successfully",
			});

			onSuccess();
		} catch (error) {
			console.error("Error updating organization:", error);
			toast({
				title: "Error",
				description: "Failed to update organization details",
				variant: "destructive",
			});
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
			<div className="space-y-1">
				<Label htmlFor="edit-name">Organization Name</Label>
				<Input
					id="edit-name"
					{...form.register("name")}
					placeholder="Enter organization name"
				/>
				{form.formState.errors.name && (
					<p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
				)}
			</div>
			<div className="space-y-1">
				<Label htmlFor="edit-description">Description</Label>
				<Textarea
					id="edit-description"
					rows={4}
					{...form.register("description")}
					placeholder="Enter organization description"
				/>
				{form.formState.errors.description && (
					<p className="text-sm text-red-500">
						{form.formState.errors.description.message}
					</p>
				)}
			</div>
			<DialogFooter className="gap-2 pt-4">
				<Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSaving || !form.formState.isValid}>
					{isSaving ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Saving...
						</>
					) : (
						"Save changes"
					)}
				</Button>
			</DialogFooter>
		</form>
	);
}

export default function OrgGeneral() {
	const { toast } = useToast();
	const [isOpenEdit, setIsOpenEdit] = React.useState(false);
	const [organization, setOrganization] = React.useState<Organization | null>(null);
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => {
		const fetchOrganization = async () => {
			try {
				setIsLoading(true);
				const response = await organizationApi.getOrganization();
				setOrganization(response.organization);
			} catch (err) {
				console.error("Error fetching org:", err);
				toast({
					title: "Error",
					description: "Failed to load organization",
					variant: "destructive",
					duration: 3000,
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchOrganization();
	}, [toast]);

	const onChangeEditMode = () => {
		setIsOpenEdit((prevState) => !prevState);
	};

	const handleUpdateSuccess = async () => {
		setIsOpenEdit(false);
		try {
			const response = await organizationApi.getOrganization();
			setOrganization(response.organization);
		} catch (err) {
			console.error("Error refreshing organization:", err);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-6">
				<div className="h-6 w-6 animate-spin text-gray-500" />
				<span className="ml-2 text-sm text-gray-500">Loading organization data...</span>
			</div>
		);
	}

	const org = organization;
	if (!org) {
		return (
			<div className="flex items-center justify-center p-6">
				<div className="h-6 w-6 animate-spin text-gray-500" />
				<div className="text-sm text-muted-foreground">No organization available</div>
			</div>
		);
	}

	return (
		<>
			<Card className="rounded-md shadow-none">
				<CardHeader className="max-w-[724px] flex justify-between items-start flex-row pb-4">
					<CardTitle className="font-medium text-[18px] dark:text-[#fff] leading-[28px]">
						Organization Details
					</CardTitle>
					<Button
						variant="outline"
						size="sm"
						className="!mt-0"
						onClick={onChangeEditMode}
					>
						Edit
					</Button>
				</CardHeader>
				<CardContent className="space-y-4 max-w-[724px]">
					<div className="space-y-1.5">
						<Label
							htmlFor="name"
							className="mb-1 block text-sm text-[#18181B] dark:text-[#FAFAFA]"
						>
							Name
						</Label>
						<Input
							id="name"
							placeholder="Organization Name"
							value={org.name}
							disabled
						/>
					</div>

					<div className="space-y-1.5">
						<Label
							htmlFor="description"
							className="mb-1 block text-sm text-[#18181B] dark:text-[#FAFAFA]"
						>
							Description
						</Label>
						<Input
							id="description"
							placeholder="Organization Description"
							value={org.description}
							disabled
						/>
					</div>

					{/* <div className="space-y-1 flex flex-col gap-2 items-start !mt-6">
            <Label>Created by</Label>
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-[#83ABFF80] font-bold text-[18px]">
                  M
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="text-[14px] font-semibold">Mark Preston</span>
                <span className="truncate text-xs">mark@genum.ai</span>
              </div>
            </div>
          </div>

          <div className="space-y-1 flex flex-col gap-2 items-start !mt-6">
            <Label>Created at</Label>
            <p className="flex flex-col gap-1">
              <span className="text-[14px] leading-[20px]">11.04.2025</span>
              <span className="text-[14px] leading-[20px]">12:07:56</span>
            </p>
          </div> */}

					{/* <div className="space-y-2">
            <Label htmlFor="organizationId" className="text-sm text-zinc-900">
              Organization ID
            </Label>
            <Input id="organizationId" placeholder="Organization ID" value={org.id} disabled />
            <p className="text-sm text-muted-foreground">
              Unique identifier for this organisation, occasionally required in API requests
            </p>
          </div> */}
				</CardContent>

				{/* <CardContent className="space-y-2">
          <p className="text-sm font-bold text-zinc-500 mb-2">Verification</p>
          <p className="text-sm text-zinc-500 mb-4">
            Verify your organisation to enable access to secured models
          </p>
          <p className="text-sm font-bold text-[#437BEF] mb-2">Coming soon</p>
        </CardContent> */}
			</Card>

			<Dialog open={isOpenEdit} onOpenChange={onChangeEditMode}>
				<DialogContent
					className="sm:max-w-[500px]"
					onOpenAutoFocus={(e) => e.preventDefault()}
				>
					<DialogHeader>
						<DialogTitle>Edit Organization</DialogTitle>
					</DialogHeader>
					{org && (
						<EditOrganizationForm
							organization={org}
							onClose={onChangeEditMode}
							onSuccess={handleUpdateSuccess}
						/>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
