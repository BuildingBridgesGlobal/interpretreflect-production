import {
	Calendar,
	ChevronLeft,
	ChevronRight,
	Eye,
	Search,
	Trash2,
	X,
} from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";

import { getDisplayName } from "../config/reflectionTypes";

import { ConfirmationModal } from "./ConfirmationModal";
import { ReflectionDetailView } from "./ReflectionDetailView";

interface Reflection {
	id: string;
	user_id: string;
	reflection_id: string;
	entry_kind: string;
	data: any;
	created_at: string;
	updated_at: string;
}

interface AllReflectionsViewProps {
	userId: string;
	onClose: () => void;
	initialReflections?: Reflection[];
	onReflectionDeleted?: (reflectionId: string) => void;
}

export const AllReflectionsView: React.FC<AllReflectionsViewProps> = ({
	userId,
	onClose,
	initialReflections = [],
	onReflectionDeleted,
}) => {
	const [reflections, setReflections] =
		useState<Reflection[]>(initialReflections);
	const [loading, setLoading] = useState(!initialReflections.length);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedReflection, setSelectedReflection] = useState<any>(null);
	const [confirmDelete, setConfirmDelete] = useState<{
		isOpen: boolean;
		reflectionId: string | null;
	}>({
		isOpen: false,
		reflectionId: null,
	});
	const itemsPerPage = 10;

	// Helper function definitions (must be before they're used)
	const formatDate = (dateString: string, reflectionData?: any) => {
		try {
			// First try the main created_at field
			if (dateString) {
				const date = new Date(dateString);
				if (!isNaN(date.getTime())) {
					return date.toLocaleDateString("en-US", {
						year: "numeric",
						month: "short",
						day: "numeric",
						hour: "2-digit",
						minute: "2-digit",
					});
				}
			}

			// If no created_at, try alternative date fields in the data object
			if (reflectionData) {
				const dateFields = [
					'timestamp', 'check_in_date', 'completed_at', 'session_date',
					'created_at', 'date', 'reflection_date'
				];

				for (const field of dateFields) {
					if (reflectionData[field]) {
						const date = new Date(reflectionData[field]);
						if (!isNaN(date.getTime())) {
							console.log(`AllReflectionsView - Using alternative date field '${field}':`, reflectionData[field]);
							return date.toLocaleDateString("en-US", {
								year: "numeric",
								month: "short",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							});
						}
					}
				}
			}

			console.log("AllReflectionsView - No valid date found for reflection");
			return "Date not available";
		} catch (error) {
			console.error("AllReflectionsView - Error formatting date:", error);
			return "Date not available";
		}
	};

	const getReflectionTitle = useCallback((kind: string, data?: any) => {
		// Use centralized function for consistent naming - pass data to infer type if needed
		return getDisplayName(kind, data);
	}, []);

	const getReflectionPreview = useCallback((data: any) => {
		if (!data) return "No content available";

		// Try to find the first meaningful text field
		const previewFields = [
			"commitment",
			"gratitude",
			"affirmation",
			"context_background",
			"situation_description",
			"current_feeling",
			"intention_statement",
			"reflection_text",
			"notes",
			"thoughts",
			"message",
			"content",
			"description",
			"reflection",
			"summary",
		];

		for (const field of previewFields) {
			if (
				data[field] &&
				typeof data[field] === "string" &&
				data[field].length > 0
			) {
				return (
					data[field].substring(0, 150) +
					(data[field].length > 150 ? "..." : "")
				);
			}
		}

		// Check for nested reflection data
		if (data.reflectionData) {
			for (const field of previewFields) {
				if (
					data.reflectionData[field] &&
					typeof data.reflectionData[field] === "string" &&
					data.reflectionData[field].length > 0
				) {
					return (
						data.reflectionData[field].substring(0, 150) +
						(data.reflectionData[field].length > 150 ? "..." : "")
					);
				}
			}
		}

		// If no text fields, show a summary of available data
		const keys = Object.keys(data);
		return `Contains ${keys.length} fields of data`;
	}, []);

	// Load all reflections
	useEffect(() => {
		if (!initialReflections.length) {
			loadAllReflections();
		}
	}, []);

	// Safety: Clear stuck deletingId after 10 seconds
	useEffect(() => {
		if (deletingId) {
			console.log("⏰ Setting 10 second timeout to clear stuck deletingId:", deletingId);
			const timeout = setTimeout(() => {
				console.log("⏰ Timeout reached - clearing stuck deletingId:", deletingId);
				setDeletingId(null);
			}, 10000);
			return () => clearTimeout(timeout);
		}
	}, [deletingId]);

	const loadAllReflections = async () => {
		try {
			// Use Supabase client for consistency
			const { supabase } = await import("../lib/supabase");

			console.log("AllReflectionsView - Loading reflections for user:", userId);

			const { data, error } = await supabase
				.from('reflection_entries')
				.select('*')
				.eq('user_id', userId)
				.order('created_at', { ascending: false });

			if (error) {
				console.error("AllReflectionsView - Error fetching reflections:", error);
				throw new Error("Failed to load reflections");
			}

			console.log("AllReflectionsView - Fetched reflections count:", data?.length || 0);

			if (data && data.length > 0) {
				console.log("AllReflectionsView - Sample reflection:", {
					id: data[0].id,
					entry_kind: data[0].entry_kind,
					created_at: data[0].created_at,
					hasData: !!data[0].data
				});

				// Check for date issues
				const reflectionsWithDates = data.filter(r => r.created_at);
				const reflectionsWithoutDates = data.filter(r => !r.created_at);

				console.log("AllReflectionsView - Reflections with dates:", reflectionsWithDates.length);
				console.log("AllReflectionsView - Reflections without dates:", reflectionsWithoutDates.length);

				if (reflectionsWithoutDates.length > 0) {
					console.log("AllReflectionsView - Sample reflection without date:", reflectionsWithoutDates[0]);
				}
			}

			setReflections(data || []);
		} catch (error) {
			console.error("AllReflectionsView - Error loading reflections:", error);
		} finally {
			setLoading(false);
		}
	};

	// Delete reflection function - uses working version from PersonalizedHomepage
	const handleDeleteReflection = async () => {
		if (!confirmDelete.reflectionId) return;

		const reflectionId = confirmDelete.reflectionId;
		console.log("=== DELETE REFLECTION START ===");
		console.log("Attempting to delete reflection with ID:", reflectionId);
		console.log("Type of ID:", typeof reflectionId);
		console.log("Current user:", userId);
		setDeletingId(reflectionId);
		setConfirmDelete({ isOpen: false, reflectionId: null });

		try {
			// Use existing supabase instance and get session token directly
			console.log("Using existing auth context...");

			// Import the direct API helper which handles auth better
			const { getSessionToken } = await import("../services/directSupabaseApi");

			console.log("Getting session token...");
			const token = await getSessionToken();

			if (!token) {
				console.error("No token available");
				throw new Error("Authentication required. Please refresh the page.");
			}

			console.log("Token obtained successfully");

			const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
			const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

			// The ID might be a string that looks like a number, try to parse it
			let queryId = reflectionId;

			// Check if it's a numeric string and convert to number if needed
			if (!isNaN(reflectionId as any) && !isNaN(parseFloat(reflectionId))) {
				queryId = parseInt(reflectionId, 10).toString();
				console.log("Converted ID to:", queryId);
			}

			// First check if the reflection exists using REST API
			console.log("Checking if reflection exists with id:", queryId);

			const checkResponse = await fetch(
				`${SUPABASE_URL}/rest/v1/reflection_entries?id=eq.${queryId}&user_id=eq.${userId}`,
				{
					headers: {
						'apikey': SUPABASE_ANON_KEY,
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					}
				}
			);

			if (!checkResponse.ok) {
				console.error("Error checking reflection:", checkResponse.status);
				throw new Error(`Error checking reflection: ${checkResponse.statusText}`);
			}

			const checkData = await checkResponse.json();
			console.log("Check reflection result:", checkData);

			if (!checkData || checkData.length === 0) {
				console.error("No reflection found with ID:", queryId);
				throw new Error("Reflection not found. It may have already been deleted.");
			}

			// Now attempt the delete using REST API
			console.log("Attempting delete with ID:", queryId, "User ID:", userId);

			const deleteResponse = await fetch(
				`${SUPABASE_URL}/rest/v1/reflection_entries?id=eq.${queryId}&user_id=eq.${userId}`,
				{
					method: 'DELETE',
					headers: {
						'apikey': SUPABASE_ANON_KEY,
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
						'Prefer': 'return=representation'
					}
				}
			);

			console.log("Delete response status:", deleteResponse.status);

			if (!deleteResponse.ok) {
				const errorText = await deleteResponse.text();
				console.error("Delete error response:", errorText);
				throw new Error(`Failed to delete reflection: ${deleteResponse.statusText}`);
			}

			const deleteData = await deleteResponse.json();

			console.log("Delete response data:", deleteData);

			// Check if nothing was deleted (empty array means no rows matched)
			if (!deleteData || deleteData.length === 0) {
				console.error("No rows were deleted - reflection might not exist or user doesn't have permission");
				throw new Error("Unable to delete reflection. It may not exist or you may not have permission.");
			}

			// Remove from local state without reloading
			setReflections((prev) => prev.filter((r) => r.id !== reflectionId));

			// Also update parent state if callback provided
			if (onReflectionDeleted) {
				onReflectionDeleted(reflectionId);
			}

			console.log("=== DELETE REFLECTION SUCCESS ===");
			console.log("Reflection deleted successfully:", reflectionId, "Deleted data:", deleteData);
		} catch (error) {
			console.error("=== DELETE REFLECTION ERROR ===");
			console.error("Error deleting reflection:", error);
			console.error("Error details:", {
				message: error instanceof Error ? error.message : "Unknown error",
				stack: error instanceof Error ? error.stack : "No stack",
				reflectionId,
				user: userId
			});
			alert(error instanceof Error ? error.message : "Failed to delete reflection. Please check the console for details.");
		} finally {
			setDeletingId(null);
		}
	};

	// Filter reflections based on search
	const filteredReflections = useMemo(() => {
		return reflections.filter((reflection) => {
			if (searchTerm === "") return true;

			const searchLower = searchTerm.toLowerCase();

			// Get the display name for the reflection type
			const reflectionTypeName = getReflectionTitle(reflection.entry_kind, reflection.data).toLowerCase();

			// Check reflection type name
			if (reflectionTypeName.includes(searchLower)) return true;

			// Check entry_kind
			if (reflection.entry_kind && reflection.entry_kind.toLowerCase().includes(searchLower)) return true;

			// Check date
			const dateStr = formatDate(reflection.created_at).toLowerCase();
			if (dateStr.includes(searchLower)) return true;

			// Check content preview
			const preview = getReflectionPreview(reflection.data).toLowerCase();
			if (preview.includes(searchLower)) return true;

			// Deep search in data object for specific fields
			if (reflection.data) {
				// Check common text fields
				const searchFields = [
					'commitment', 'gratitude', 'affirmation', 'context_background',
					'situation_description', 'current_feeling', 'intention_statement',
					'reflection_text', 'notes', 'thoughts', 'message', 'content',
					'description', 'reflection', 'summary', 'sessionId', 'feeling_word',
					'assignment_type', 'assignment_format', 'most_challenging_aspect',
					'success_vision', 'skills_to_demonstrate', 'assignment_intention'
				];

				for (const field of searchFields) {
					if (reflection.data[field] &&
					    typeof reflection.data[field] === 'string' &&
					    reflection.data[field].toLowerCase().includes(searchLower)) {
						return true;
					}
				}

				// Check nested answers object if it exists
				if (reflection.data.answers && typeof reflection.data.answers === 'object') {
					const answersStr = JSON.stringify(reflection.data.answers).toLowerCase();
					if (answersStr.includes(searchLower)) return true;
				}
			}

			return false;
		});
	}, [reflections, searchTerm, getReflectionTitle]);

	// Pagination
	const totalPages = Math.ceil(filteredReflections.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedReflections = useMemo(() => {
		return filteredReflections.slice(
			startIndex,
			startIndex + itemsPerPage,
		);
	}, [filteredReflections, startIndex, itemsPerPage]);

	// Get unique reflection types
	const reflectionTypes = Array.from(
		new Set(reflections.filter((r) => r.entry_kind).map((r) => r.entry_kind)),
	);

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div
				className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
				style={{ backgroundColor: "#FAF9F6" }}
			>
				{/* Header */}
				<div className="p-6 border-b border-gray-200">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-bold text-gray-900">
							All Reflections
						</h2>
						<button
							onClick={onClose}
							className="p-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:opacity-90"
							style={{
								background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
							}}
							title="Close"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					{/* Search Bar */}
					<div className="mt-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
							<input
								type="text"
								placeholder="Search by type (e.g., 'Pre-Assignment'), date, or content..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
						</div>
					</div>

					<div className="mt-3 text-sm text-gray-600">
						Showing {paginatedReflections.length} of{" "}
						{filteredReflections.length} reflections
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6">
					{loading ? (
						<div className="flex items-center justify-center h-64">
							<div className="text-gray-500">Loading reflections...</div>
						</div>
					) : paginatedReflections.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-64">
							<Calendar className="w-12 h-12 text-gray-300 mb-3" />
							<p className="text-gray-500">
								{searchTerm
									? "No reflections match your search criteria"
									: "No reflections yet"}
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{paginatedReflections.map((reflection) => (
								<div
									key={reflection.id}
									className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											{/* Type badge and date */}
											<div className="flex items-center gap-3 mb-3">
												<span
													className="px-3 py-1 text-xs font-medium rounded-full text-white"
													style={{
														background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
													}}
												>
													{getReflectionTitle(reflection.entry_kind, reflection.data)}
												</span>
												<span className="text-xs text-gray-500 flex items-center">
													<Calendar className="inline w-3 h-3 mr-1" />
													{formatDate(reflection.created_at, reflection.data)}
												</span>
											</div>
											{/* Content preview */}
											<p className="text-sm text-gray-600">
												{getReflectionPreview(reflection.data)}
											</p>
										</div>
										<div className="flex gap-2 ml-4">
											<button
												type="button"
												onClick={() => {
													// Format the reflection data to match what ReflectionDetailView expects
													const formattedReflection = {
														id: reflection.id,
														type:
															reflection.entry_kind || "personal_reflection",
														data: reflection.data,
														timestamp: reflection.created_at,
													};
													setSelectedReflection(formattedReflection);
												}}
												className="p-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:opacity-90"
												style={{
													background:
														"linear-gradient(135deg, #5C7F4F, #5B9378)",
												}}
												title="View details"
											>
												<Eye className="w-4 h-4" />
											</button>
											<button
												onClick={() => {
													console.log("🗑️🗑️ DELETE BUTTON CLICKED for reflection:", reflection.id);
												console.log("🗑️ Setting confirmDelete state to:", { isOpen: true, reflectionId: reflection.id });
													setConfirmDelete({
														isOpen: true,
														reflectionId: reflection.id,
													});
												}}
												disabled={deletingId === reflection.id}
												className={`p-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:opacity-90 ${
													deletingId === reflection.id
														? "opacity-50 cursor-not-allowed"
														: ""
												}`}
												style={{
													background:
														"linear-gradient(135deg, #D32F2F, #f44336)",
												}}
												title="Delete reflection"
											>
												{deletingId === reflection.id ? (
													<div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
												) : (
													<Trash2 className="w-4 h-4" />
												)}
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="p-4 border-t border-gray-200 flex items-center justify-between">
						<button
							onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
							disabled={currentPage === 1}
							className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
								currentPage === 1
									? "bg-gray-100 text-gray-400 cursor-not-allowed"
									: "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
							}`}
						>
							<ChevronLeft className="w-4 h-4" />
							Previous
						</button>

						<div className="text-sm text-gray-600">
							Page {currentPage} of {totalPages}
						</div>

						<button
							onClick={() =>
								setCurrentPage((prev) => Math.min(prev + 1, totalPages))
							}
							disabled={currentPage === totalPages}
							className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
								currentPage === totalPages
									? "bg-gray-100 text-gray-400 cursor-not-allowed"
									: "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
							}`}
						>
							Next
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>
				)}
			</div>

			{/* Reflection Detail View Modal */}
			{selectedReflection && (
				<ReflectionDetailView
					reflection={selectedReflection}
					onClose={() => setSelectedReflection(null)}
				/>
			)}

			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				isOpen={confirmDelete.isOpen}
				title="Delete Reflection"
				message="Are you sure you want to delete this reflection? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				onConfirm={handleDeleteReflection}
				onCancel={() => setConfirmDelete({ isOpen: false, reflectionId: null })}
				isDanger={true}
			/>
		</div>
	);
};
