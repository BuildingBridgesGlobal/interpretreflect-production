import {
	AlertCircle,
	Brain,
	Download,
	Heart,
	HelpCircle,
	Lock,
	Plus,
	Save,
	Shield,
	Upload,
	X,
	Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import {
	defaultSupportCard,
	supportCardService,
	TEMPLATE_CATEGORIES,
	type CardTemplate,
	type SupportCardData,
} from "../services/supportCardService";

interface SupportCardEditorProps {
	onClose?: () => void;
	onSave?: () => void;
}

export const SupportCardEditor: React.FC<SupportCardEditorProps> = ({
	onClose,
	onSave,
}) => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [cardData, setCardData] = useState<SupportCardData>(defaultSupportCard);
	const [templates, setTemplates] = useState<CardTemplate[]>([]);
	const [selectedTemplate, setSelectedTemplate] = useState<string>("");
	const [activeTab, setActiveTab] = useState<"early" | "helps" | "avoid">("early");
	const [message, setMessage] = useState({ type: "", text: "" });

	// Input states for adding new items
	const [newPhysical, setNewPhysical] = useState("");
	const [newEmotional, setNewEmotional] = useState("");
	const [newCognitive, setNewCognitive] = useState("");
	const [newImmediate, setNewImmediate] = useState("");
	const [newShortTerm, setNewShortTerm] = useState("");
	const [newPreventive, setNewPreventive] = useState("");
	const [newBehavior, setNewBehavior] = useState("");
	const [newSituation, setNewSituation] = useState("");

	useEffect(() => {
		loadTemplates();
		loadExistingCard();
	}, [user]);

	const loadTemplates = async () => {
		const result = await supportCardService.getTemplates();
		if (result.success && result.templates) {
			setTemplates(result.templates);
		}
	};

	const loadExistingCard = async () => {
		if (!user) return;

		setLoading(true);
		const result = await supportCardService.getSupportCard(user.id);

		if (result.success && result.data) {
			setCardData(result.data);
			setMessage({ type: "info", text: "Existing card loaded. Enter password to decrypt." });
		}
		setLoading(false);
	};

	const applyTemplate = (templateId: string) => {
		const template = templates.find(t => t.id === templateId);
		if (template) {
			setCardData({
				...cardData,
				earlySigns: template.earlySigns,
				whatHelps: template.whatHelps,
				whatToAvoid: template.whatToAvoid,
			});
			setMessage({ type: "success", text: "Template applied!" });
		}
	};

	const handleSave = async () => {
		if (!user) {
			setMessage({ type: "error", text: "Please sign in to save" });
			return;
		}

		if (!password) {
			setMessage({ type: "error", text: "Password required for encryption" });
			return;
		}

		if (password !== confirmPassword) {
			setMessage({ type: "error", text: "Passwords do not match" });
			return;
		}

		if (password.length < 8) {
			setMessage({ type: "error", text: "Password must be at least 8 characters" });
			return;
		}

		setSaving(true);
		supportCardService.setPassword(password);

		const result = await supportCardService.saveSupportCard(user.id, cardData);

		if (result.success) {
			setMessage({ type: "success", text: "Support card saved securely!" });
			onSave?.();
		} else {
			setMessage({ type: "error", text: result.error || "Failed to save" });
		}

		setSaving(false);
	};

	const addItem = (category: string, value: string) => {
		if (!value.trim()) return;

		const newData = { ...cardData };

		switch (category) {
			case "physical":
				newData.earlySigns.physical.push(value);
				setNewPhysical("");
				break;
			case "emotional":
				newData.earlySigns.emotional.push(value);
				setNewEmotional("");
				break;
			case "cognitive":
				newData.earlySigns.cognitive.push(value);
				setNewCognitive("");
				break;
			case "immediate":
				newData.whatHelps.immediate.push(value);
				setNewImmediate("");
				break;
			case "shortTerm":
				newData.whatHelps.shortTerm.push(value);
				setNewShortTerm("");
				break;
			case "preventive":
				newData.whatHelps.preventive.push(value);
				setNewPreventive("");
				break;
			case "behavior":
				newData.whatToAvoid.behaviors.push(value);
				setNewBehavior("");
				break;
			case "situation":
				newData.whatToAvoid.situations.push(value);
				setNewSituation("");
				break;
		}

		setCardData(newData);
	};

	const removeItem = (category: string, index: number) => {
		const newData = { ...cardData };

		switch (category) {
			case "physical":
				newData.earlySigns.physical.splice(index, 1);
				break;
			case "emotional":
				newData.earlySigns.emotional.splice(index, 1);
				break;
			case "cognitive":
				newData.earlySigns.cognitive.splice(index, 1);
				break;
			case "immediate":
				newData.whatHelps.immediate.splice(index, 1);
				break;
			case "shortTerm":
				newData.whatHelps.shortTerm.splice(index, 1);
				break;
			case "preventive":
				newData.whatHelps.preventive.splice(index, 1);
				break;
			case "behavior":
				newData.whatToAvoid.behaviors.splice(index, 1);
				break;
			case "situation":
				newData.whatToAvoid.situations.splice(index, 1);
				break;
		}

		setCardData(newData);
	};

	const exportCard = async () => {
		if (!user) return;

		const blob = await supportCardService.exportCard(user.id);
		if (blob) {
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `support-card-${new Date().toISOString().split("T")[0]}.json`;
			a.click();
			URL.revokeObjectURL(url);
			setMessage({ type: "success", text: "Card exported!" });
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
				{/* Header */}
				<div className="p-6 border-b bg-gradient-to-r from-green-50 to-blue-50">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Shield className="w-8 h-8 text-green-600" />
							<div>
								<h2 className="text-2xl font-bold text-gray-900">
									TRF-Lite Support Card
								</h2>
								<p className="text-sm text-gray-600">
									Private, encrypted wellness support
								</p>
							</div>
						</div>
						{onClose && (
							<button
								onClick={onClose}
								className="p-2 hover:bg-white/50 rounded-lg"
							>
								<X className="w-5 h-5" />
							</button>
						)}
					</div>
				</div>

				{/* Password Section */}
				<div className="p-4 bg-yellow-50 border-b border-yellow-200">
					<div className="flex items-start gap-2">
						<Lock className="w-5 h-5 text-yellow-600 mt-0.5" />
						<div className="flex-1">
							<p className="text-sm font-medium text-yellow-800 mb-2">
								Encryption Password Required
							</p>
							<div className="grid md:grid-cols-2 gap-3">
								<input
									type={showPassword ? "text" : "password"}
									placeholder="Enter password (min 8 chars)"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="px-3 py-2 border rounded-lg text-sm"
								/>
								<input
									type={showPassword ? "text" : "password"}
									placeholder="Confirm password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className="px-3 py-2 border rounded-lg text-sm"
								/>
							</div>
							<p className="text-xs text-yellow-700 mt-2">
								⚠️ Remember this password - it cannot be recovered
							</p>
						</div>
					</div>
				</div>

				{/* Template Selection */}
				<div className="p-4 border-b bg-gray-50">
					<div className="flex items-center gap-3">
						<label className="text-sm font-medium text-gray-700">
							Start with template:
						</label>
						<select
							value={selectedTemplate}
							onChange={(e) => {
								setSelectedTemplate(e.target.value);
								if (e.target.value) applyTemplate(e.target.value);
							}}
							className="px-3 py-1.5 border rounded-lg text-sm"
						>
							<option value="">Choose template...</option>
							{templates.map(t => (
								<option key={t.id} value={t.id}>
									{t.templateName}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* Tabs */}
				<div className="flex border-b">
					<button
						onClick={() => setActiveTab("early")}
						className={`px-6 py-3 font-medium ${
							activeTab === "early"
								? "border-b-2 border-green-600 text-green-600"
								: "text-gray-600 hover:text-gray-900"
						}`}
					>
						<AlertCircle className="w-4 h-4 inline mr-2" />
						Early Signs
					</button>
					<button
						onClick={() => setActiveTab("helps")}
						className={`px-6 py-3 font-medium ${
							activeTab === "helps"
								? "border-b-2 border-blue-600 text-blue-600"
								: "text-gray-600 hover:text-gray-900"
						}`}
					>
						<HelpCircle className="w-4 h-4 inline mr-2" />
						What Helps
					</button>
					<button
						onClick={() => setActiveTab("avoid")}
						className={`px-6 py-3 font-medium ${
							activeTab === "avoid"
								? "border-b-2 border-red-600 text-red-600"
								: "text-gray-600 hover:text-gray-900"
						}`}
					>
						<X className="w-4 h-4 inline mr-2" />
						What to Avoid
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6">
					{/* Early Signs Tab */}
					{activeTab === "early" && (
						<div className="space-y-6">
							{/* Physical Signs */}
							<div>
								<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
									<Heart className="w-5 h-5 text-red-500" />
									Physical Signs
								</h3>
								<div className="space-y-2">
									{cardData.earlySigns.physical.map((sign, idx) => (
										<div key={idx} className="flex items-center gap-2">
											<span className="flex-1 px-3 py-2 bg-red-50 rounded-lg text-sm">
												{sign}
											</span>
											<button
												onClick={() => removeItem("physical", idx)}
												className="p-1 hover:bg-red-100 rounded"
											>
												<X className="w-4 h-4 text-red-600" />
											</button>
										</div>
									))}
									<div className="flex gap-2">
										<input
											type="text"
											placeholder="Add physical sign..."
											value={newPhysical}
											onChange={(e) => setNewPhysical(e.target.value)}
											onKeyPress={(e) => {
												if (e.key === "Enter") {
													addItem("physical", newPhysical);
												}
											}}
											className="flex-1 px-3 py-2 border rounded-lg text-sm"
										/>
										<button
											onClick={() => addItem("physical", newPhysical)}
											className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
										>
											<Plus className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>

							{/* Emotional Signs */}
							<div>
								<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
									<Zap className="w-5 h-5 text-yellow-500" />
									Emotional Signs
								</h3>
								<div className="space-y-2">
									{cardData.earlySigns.emotional.map((sign, idx) => (
										<div key={idx} className="flex items-center gap-2">
											<span className="flex-1 px-3 py-2 bg-yellow-50 rounded-lg text-sm">
												{sign}
											</span>
											<button
												onClick={() => removeItem("emotional", idx)}
												className="p-1 hover:bg-yellow-100 rounded"
											>
												<X className="w-4 h-4 text-yellow-600" />
											</button>
										</div>
									))}
									<div className="flex gap-2">
										<input
											type="text"
											placeholder="Add emotional sign..."
											value={newEmotional}
											onChange={(e) => setNewEmotional(e.target.value)}
											onKeyPress={(e) => {
												if (e.key === "Enter") {
													addItem("emotional", newEmotional);
												}
											}}
											className="flex-1 px-3 py-2 border rounded-lg text-sm"
										/>
										<button
											onClick={() => addItem("emotional", newEmotional)}
											className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
										>
											<Plus className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>

							{/* Cognitive Signs */}
							<div>
								<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
									<Brain className="w-5 h-5 text-purple-500" />
									Cognitive Signs
								</h3>
								<div className="space-y-2">
									{cardData.earlySigns.cognitive.map((sign, idx) => (
										<div key={idx} className="flex items-center gap-2">
											<span className="flex-1 px-3 py-2 bg-purple-50 rounded-lg text-sm">
												{sign}
											</span>
											<button
												onClick={() => removeItem("cognitive", idx)}
												className="p-1 hover:bg-purple-100 rounded"
											>
												<X className="w-4 h-4 text-purple-600" />
											</button>
										</div>
									))}
									<div className="flex gap-2">
										<input
											type="text"
											placeholder="Add cognitive sign..."
											value={newCognitive}
											onChange={(e) => setNewCognitive(e.target.value)}
											onKeyPress={(e) => {
												if (e.key === "Enter") {
													addItem("cognitive", newCognitive);
												}
											}}
											className="flex-1 px-3 py-2 border rounded-lg text-sm"
										/>
										<button
											onClick={() => addItem("cognitive", newCognitive)}
											className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
										>
											<Plus className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* What Helps Tab */}
					{activeTab === "helps" && (
						<div className="space-y-6">
							{/* Immediate Helps */}
							<div>
								<h3 className="font-semibold text-gray-900 mb-3">
									⚡ Immediate (under 1 minute)
								</h3>
								<div className="space-y-2">
									{cardData.whatHelps.immediate.map((help, idx) => (
										<div key={idx} className="flex items-center gap-2">
											<span className="flex-1 px-3 py-2 bg-[rgba(107,130,104,0.05)] rounded-lg text-sm">
												{help}
											</span>
											<button
												onClick={() => removeItem("immediate", idx)}
												className="p-1 hover:bg-green-100 rounded"
											>
												<X className="w-4 h-4 text-green-600" />
											</button>
										</div>
									))}
									<div className="flex gap-2">
										<input
											type="text"
											placeholder="Add immediate help..."
											value={newImmediate}
											onChange={(e) => setNewImmediate(e.target.value)}
											onKeyPress={(e) => {
												if (e.key === "Enter") {
													addItem("immediate", newImmediate);
												}
											}}
											className="flex-1 px-3 py-2 border rounded-lg text-sm"
										/>
										<button
											onClick={() => addItem("immediate", newImmediate)}
											className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
										>
											<Plus className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>

							{/* Short-term Helps */}
							<div>
								<h3 className="font-semibold text-gray-900 mb-3">
									☕ Short-term (5-15 minutes)
								</h3>
								<div className="space-y-2">
									{cardData.whatHelps.shortTerm.map((help, idx) => (
										<div key={idx} className="flex items-center gap-2">
											<span className="flex-1 px-3 py-2 bg-blue-50 rounded-lg text-sm">
												{help}
											</span>
											<button
												onClick={() => removeItem("shortTerm", idx)}
												className="p-1 hover:bg-blue-100 rounded"
											>
												<X className="w-4 h-4 text-blue-600" />
											</button>
										</div>
									))}
									<div className="flex gap-2">
										<input
											type="text"
											placeholder="Add short-term help..."
											value={newShortTerm}
											onChange={(e) => setNewShortTerm(e.target.value)}
											onKeyPress={(e) => {
												if (e.key === "Enter") {
													addItem("shortTerm", newShortTerm);
												}
											}}
											className="flex-1 px-3 py-2 border rounded-lg text-sm"
										/>
										<button
											onClick={() => addItem("shortTerm", newShortTerm)}
											className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
										>
											<Plus className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>

							{/* Preventive Helps */}
							<div>
								<h3 className="font-semibold text-gray-900 mb-3">
									🛡️ Preventive (daily practices)
								</h3>
								<div className="space-y-2">
									{cardData.whatHelps.preventive.map((help, idx) => (
										<div key={idx} className="flex items-center gap-2">
											<span className="flex-1 px-3 py-2 bg-indigo-50 rounded-lg text-sm">
												{help}
											</span>
											<button
												onClick={() => removeItem("preventive", idx)}
												className="p-1 hover:bg-indigo-100 rounded"
											>
												<X className="w-4 h-4 text-indigo-600" />
											</button>
										</div>
									))}
									<div className="flex gap-2">
										<input
											type="text"
											placeholder="Add preventive practice..."
											value={newPreventive}
											onChange={(e) => setNewPreventive(e.target.value)}
											onKeyPress={(e) => {
												if (e.key === "Enter") {
													addItem("preventive", newPreventive);
												}
											}}
											className="flex-1 px-3 py-2 border rounded-lg text-sm"
										/>
										<button
											onClick={() => addItem("preventive", newPreventive)}
											className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
										>
											<Plus className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* What to Avoid Tab */}
					{activeTab === "avoid" && (
						<div className="space-y-6">
							{/* Behaviors to Avoid */}
							<div>
								<h3 className="font-semibold text-gray-900 mb-3">
									🚫 Behaviors to Avoid
								</h3>
								<div className="space-y-2">
									{cardData.whatToAvoid.behaviors.map((behavior, idx) => (
										<div key={idx} className="flex items-center gap-2">
											<span className="flex-1 px-3 py-2 bg-red-50 rounded-lg text-sm">
												{behavior}
											</span>
											<button
												onClick={() => removeItem("behavior", idx)}
												className="p-1 hover:bg-red-100 rounded"
											>
												<X className="w-4 h-4 text-red-600" />
											</button>
										</div>
									))}
									<div className="flex gap-2">
										<input
											type="text"
											placeholder="Add behavior to avoid..."
											value={newBehavior}
											onChange={(e) => setNewBehavior(e.target.value)}
											onKeyPress={(e) => {
												if (e.key === "Enter") {
													addItem("behavior", newBehavior);
												}
											}}
											className="flex-1 px-3 py-2 border rounded-lg text-sm"
										/>
										<button
											onClick={() => addItem("behavior", newBehavior)}
											className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
										>
											<Plus className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>

							{/* Situations to Avoid */}
							<div>
								<h3 className="font-semibold text-gray-900 mb-3">
									⚠️ Situations to Avoid
								</h3>
								<div className="space-y-2">
									{cardData.whatToAvoid.situations.map((situation, idx) => (
										<div key={idx} className="flex items-center gap-2">
											<span className="flex-1 px-3 py-2 bg-orange-50 rounded-lg text-sm">
												{situation}
											</span>
											<button
												onClick={() => removeItem("situation", idx)}
												className="p-1 hover:bg-orange-100 rounded"
											>
												<X className="w-4 h-4 text-orange-600" />
											</button>
										</div>
									))}
									<div className="flex gap-2">
										<input
											type="text"
											placeholder="Add situation to avoid..."
											value={newSituation}
											onChange={(e) => setNewSituation(e.target.value)}
											onKeyPress={(e) => {
												if (e.key === "Enter") {
													addItem("situation", newSituation);
												}
											}}
											className="flex-1 px-3 py-2 border rounded-lg text-sm"
										/>
										<button
											onClick={() => addItem("situation", newSituation)}
											className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
										>
											<Plus className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Status Messages */}
				{message.text && (
					<div
						className={`mx-6 mb-4 p-3 rounded-lg ${
							message.type === "error"
								? "bg-red-100 text-red-800"
								: message.type === "success"
								? "bg-green-100 text-green-800"
								: "bg-blue-100 text-blue-800"
						}`}
					>
						{message.text}
					</div>
				)}

				{/* Footer */}
				<div className="p-6 border-t bg-gray-50">
					<div className="flex items-center justify-between">
						<div className="flex gap-2">
							<button
								onClick={exportCard}
								className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 flex items-center gap-2"
							>
								<Download className="w-4 h-4" />
								Export
							</button>
						</div>
						<div className="flex gap-3">
							{onClose && (
								<button
									onClick={onClose}
									className="px-6 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
								>
									Cancel
								</button>
							)}
							<button
								onClick={handleSave}
								disabled={saving || !password}
								className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
							>
								<Save className="w-4 h-4" />
								{saving ? "Saving..." : "Save Encrypted Card"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};