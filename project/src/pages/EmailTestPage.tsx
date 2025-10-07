import { CheckCircle, Loader2, Mail, XCircle } from "lucide-react";
import React, { useState } from "react";
import { supabase } from "../lib/supabase";

interface TestResult {
	test: string;
	status: "pending" | "testing" | "success" | "error";
	message?: string;
}

const EmailTestPage: React.FC = () => {
	const [testEmail, setTestEmail] = useState("");
	const [results, setResults] = useState<TestResult[]>([]);
	const [testing, setTesting] = useState(false);

	const updateResult = (test: string, status: TestResult["status"], message?: string) => {
		setResults(prev => {
			const existing = prev.find(r => r.test === test);
			if (existing) {
				return prev.map(r =>
					r.test === test ? { ...r, status, message } : r
				);
			}
			return [...prev, { test, status, message }];
		});
	};

	const runEmailTests = async () => {
		if (!testEmail) {
			alert("Please enter a test email address");
			return;
		}

		setTesting(true);
		setResults([]);

		// Test 1: Check Supabase connection
		updateResult("Supabase Connection", "testing");
		try {
			const { data: { session } } = await supabase.auth.getSession();
			updateResult("Supabase Connection", "success", "Connected to Supabase");
		} catch (error: any) {
			updateResult("Supabase Connection", "error", error.message);
		}

		// Test 2: Send Magic Link
		updateResult("Magic Link Email", "testing");
		try {
			const { error } = await supabase.auth.signInWithOtp({
				email: testEmail,
				options: {
					emailRedirectTo: `${window.location.origin}/dashboard`,
				}
			});

			if (error) throw error;
			updateResult("Magic Link Email", "success", `Magic link sent to ${testEmail}`);
		} catch (error: any) {
			updateResult("Magic Link Email", "error", error.message);
		}

		// Test 3: Send Sign Up Confirmation (if email not registered)
		updateResult("Sign Up Email", "testing");
		try {
			const randomPassword = Math.random().toString(36).slice(-8) + "Aa1!";
			const testEmailWithTimestamp = `test+${Date.now()}@${testEmail.split('@')[1]}`;

			const { error } = await supabase.auth.signUp({
				email: testEmailWithTimestamp,
				password: randomPassword,
				options: {
					emailRedirectTo: `${window.location.origin}/dashboard`,
				}
			});

			if (error) throw error;
			updateResult("Sign Up Email", "success", `Sign up email sent to ${testEmailWithTimestamp}`);
		} catch (error: any) {
			updateResult("Sign Up Email", "error", error.message);
		}

		// Test 4: Check Auth Settings
		updateResult("Auth Settings", "testing");
		try {
			const authUrl = import.meta.env.VITE_SUPABASE_URL;
			const authKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

			if (!authUrl || !authKey) {
				throw new Error("Supabase credentials not configured");
			}

			updateResult("Auth Settings", "success", "Supabase credentials configured");
		} catch (error: any) {
			updateResult("Auth Settings", "error", error.message);
		}

		setTesting(false);
	};

	const getStatusIcon = (status: TestResult["status"]) => {
		switch (status) {
			case "testing":
				return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
			case "success":
				return <CheckCircle className="w-5 h-5 text-green-500" />;
			case "error":
				return <XCircle className="w-5 h-5 text-red-500" />;
			default:
				return <div className="w-5 h-5 rounded-full bg-gray-300" />;
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
			<div className="max-w-2xl mx-auto">
				<div className="bg-white rounded-2xl shadow-xl p-8">
					<div className="flex items-center gap-3 mb-8">
						<Mail className="w-8 h-8 text-indigo-600" />
						<h1 className="text-3xl font-bold text-gray-900">
							Email Configuration Test
						</h1>
					</div>

					<div className="mb-8 p-4 bg-blue-50 rounded-lg">
						<h2 className="font-semibold text-blue-900 mb-2">
							Before Testing, Ensure:
						</h2>
						<ul className="text-sm text-blue-800 space-y-1">
							<li>• Resend is configured in Supabase Dashboard → Settings → Auth</li>
							<li>• SMTP settings are enabled (not using Supabase's built-in email)</li>
							<li>• Your Resend API key is added to Supabase</li>
							<li>• Email templates are configured in Supabase</li>
						</ul>
					</div>

					<div className="space-y-4 mb-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Test Email Address
							</label>
							<input
								type="email"
								value={testEmail}
								onChange={(e) => setTestEmail(e.target.value)}
								placeholder="your-email@example.com"
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
								disabled={testing}
							/>
							<p className="text-xs text-gray-500 mt-1">
								Use a real email address you have access to
							</p>
						</div>

						<button
							onClick={runEmailTests}
							disabled={testing || !testEmail}
							className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{testing ? (
								<span className="flex items-center justify-center gap-2">
									<Loader2 className="w-5 h-5 animate-spin" />
									Running Tests...
								</span>
							) : (
								"Run Email Tests"
							)}
						</button>
					</div>

					{results.length > 0 && (
						<div className="space-y-3">
							<h3 className="font-semibold text-gray-900 mb-3">Test Results:</h3>
							{results.map((result, index) => (
								<div
									key={index}
									className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
								>
									{getStatusIcon(result.status)}
									<div className="flex-1">
										<p className="font-medium text-gray-900">
											{result.test}
										</p>
										{result.message && (
											<p className="text-sm text-gray-600 mt-1">
												{result.message}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					)}

					<div className="mt-8 p-4 bg-amber-50 rounded-lg">
						<h3 className="font-semibold text-amber-900 mb-2">
							Common Issues & Solutions:
						</h3>
						<ul className="text-sm text-amber-800 space-y-2">
							<li>
								<strong>Emails not sending:</strong> Check Resend API key in Supabase Dashboard
							</li>
							<li>
								<strong>Wrong sender address:</strong> Update "From" email in Supabase email templates
							</li>
							<li>
								<strong>Links not working:</strong> Verify Site URL in Supabase → Settings → Authentication
							</li>
							<li>
								<strong>Emails in spam:</strong> Add SPF/DKIM records for your domain in Resend
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EmailTestPage;