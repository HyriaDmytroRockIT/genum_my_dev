import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useLocalAuth } from "@/contexts/LocalAuthContext";
import { useAuth } from "@/hooks/useAuth";
import { isCloudAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface SignupFormData {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export default function Signup() {
	const navigate = useNavigate();
	const isCloud = isCloudAuth();
	const { signup, isAuthenticated: localIsAuthenticated } = useLocalAuth();
	const { loginWithRedirect } = useAuth();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isCloud) {
			loginWithRedirect({ appState: { returnTo: "/" } });
		}
	}, [isCloud, loginWithRedirect]);

	if (isCloud) {
		return null;
	}

	const isAuthenticated = localIsAuthenticated;

	const form = useForm<SignupFormData>({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	// Redirect if already authenticated
	if (isAuthenticated) {
		navigate("/");
		return null;
	}

	const onSubmit = async (data: SignupFormData) => {
		if (data.password !== data.confirmPassword) {
			toast({
				title: "Error",
				description: "Passwords do not match.",
				variant: "destructive",
			});
			return;
		}

		try {
			setIsLoading(true);
			await signup(data.email, data.password, data.name);

			toast({
				title: "Success",
				description: "Account created successfully. You are now logged in.",
			});

			navigate("/");
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message || "Failed to create account. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 w-full h-full bg-[url('https://cdn.genum.ai/background/auth_background.png?=1')] bg-cover bg-center bg-no-repeat flex items-center justify-center">
			<div className="flex flex-col gap-6 w-[400px] shadow-[0_4px_16px_#00000014] rounded-[24px] p-[52px] bg-white max-h-[90vh] overflow-y-auto">
				<div className="text-center">
					<img
						src="https://cdn.genum.ai/logo/ai_logo.png"
						alt="Logo"
						className="w-[120px] h-[23px] mx-auto"
					/>
					<h1 className="text-[24px] font-bold text-gray-900 mb-[16px] mt-[24px]">
						Sign Up
					</h1>
					<p className="text-gray-800 text-[14px]">Create a new account to get started</p>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							rules={{
								required: "Name is required",
								minLength: {
									value: 2,
									message: "Name must be at least 2 characters",
								},
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input
											type="text"
											placeholder="Your name"
											{...field}
											disabled={isLoading}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							rules={{
								required: "Email is required",
								pattern: {
									value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
									message: "Invalid email address",
								},
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="your.email@example.com"
											{...field}
											disabled={isLoading}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							rules={{
								required: "Password is required",
								minLength: {
									value: 6,
									message: "Password must be at least 6 characters",
								},
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="Enter your password"
											{...field}
											disabled={isLoading}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="confirmPassword"
							rules={{
								required: "Please confirm your password",
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Confirm Password</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="Confirm your password"
											{...field}
											disabled={isLoading}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" className="w-full min-h-[40px]" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating account...
								</>
							) : (
								"Sign Up"
							)}
						</Button>
					</form>
				</Form>

				<div className="text-center">
					<p className="text-sm text-gray-600">
						Already have an account?{" "}
						<button
							type="button"
							onClick={() => navigate("/login")}
							className="text-blue-600 hover:underline font-medium"
						>
							Log in
						</button>
					</p>
				</div>
			</div>
		</div>
	);
}
