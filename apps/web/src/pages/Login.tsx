import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

interface LoginFormData {
	email: string;
	password: string;
}

export default function Login() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const isCloud = isCloudAuth();
	const { login, isAuthenticated: localIsAuthenticated } = useLocalAuth();
	const { isAuthenticated: authIsAuthenticated, loginWithRedirect } = useAuth();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isCloud) {
			const returnTo = searchParams.get("returnTo") || "/";
			loginWithRedirect({ appState: { returnTo } });
		}
	}, [isCloud, loginWithRedirect, searchParams]);

	if (isCloud) {
		return null;
	}

	const isAuthenticated = localIsAuthenticated;

	const form = useForm<LoginFormData>({
		defaultValues: {
			email: "",
			password: "",
		},
	});

	useEffect(() => {
		if (isAuthenticated) {
			const returnTo = searchParams.get("returnTo") || "/";
			navigate(returnTo, { replace: true });
		}
	}, [isAuthenticated, navigate, searchParams]);

	if (isAuthenticated) {
		return null;
	}

	const onSubmit = async (data: LoginFormData) => {
		try {
			setIsLoading(true);
			await login(data.email, data.password);

			toast({
				title: "Success",
				description: "You have been logged in successfully.",
			});

			const returnTo = searchParams.get("returnTo") || "/";
			navigate(returnTo);
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message || "Failed to log in. Please check your credentials.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 w-full h-full bg-[url('https://cdn.genum.ai/background/auth_background.png?=1')] bg-cover bg-center bg-no-repeat flex items-center justify-center">
			<div className="flex flex-col gap-6 w-[400px] shadow-[0_4px_16px_#00000014] rounded-[24px] p-[52px] bg-white">
				<div className="text-center">
					<img
						src="https://cdn.genum.ai/logo/ai_logo.png"
						alt="Logo"
						className="w-[120px] h-[23px] mx-auto"
					/>
					<h1 className="text-[24px] font-bold text-gray-900 mb-[16px] mt-[24px]">
						Log In
					</h1>
					<p className="text-gray-800 text-[14px]">
						Enter your credentials to access your account
					</p>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

						<Button type="submit" className="w-full min-h-[40px]" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Logging in...
								</>
							) : (
								"Log In"
							)}
						</Button>
					</form>
				</Form>

				<div className="text-center">
					<p className="text-sm text-gray-600">
						Don't have an account?{" "}
						<button
							type="button"
							onClick={() => navigate("/signup")}
							className="text-blue-600 hover:underline font-medium"
						>
							Sign up
						</button>
					</p>
				</div>
			</div>
		</div>
	);
}
