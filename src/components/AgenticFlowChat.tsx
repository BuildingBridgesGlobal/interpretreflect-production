import { X } from "lucide-react";
import React, { useState } from "react";

export function AgenticFlowChat() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			{/* Custom Elya Button */}
			{!isOpen && (
				<button
					onClick={() => setIsOpen(true)}
					className="fixed shadow-lg hover:shadow-xl transition-all hover:scale-105"
					style={{
						bottom: "30px",
						right: "30px",
						background: "white",
						borderRadius: "50%",
						width: "75px",
						height: "75px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 99999,
						border: "3px solid #5B9378",
						boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
						padding: "5px",
					}}
					title="Chat with Elya"
					aria-label="Open Elya AI Chat"
				>
					<img
						src="/elya_2.png"
						alt="Elya"
						style={{
							width: "100%",
							height: "100%",
							objectFit: "contain",
							borderRadius: "50%",
						}}
					/>
				</button>
			)}

			{/* Chat Window */}
			{isOpen && (
				<div
					className="fixed shadow-2xl rounded-2xl"
					style={{
						bottom: "30px",
						right: "30px",
						width: "400px",
						maxWidth: "calc(100vw - 60px)",
						height: "600px",
						maxHeight: "calc(100vh - 100px)",
						backgroundColor: "#FFFFFF",
						border: "2px solid #E5E5E5",
						zIndex: 99999,
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
					}}
				>
					{/* Header */}
					<div
						className="px-4 py-3 flex items-center justify-between"
						style={{
							borderBottom: "1px solid #E5E5E5",
							background:
								"linear-gradient(135deg, #6B8268, #5B9378)",
						}}
					>
						<div className="flex items-center gap-2">
							<div>
								<h3
									className="font-semibold text-sm"
									style={{ color: "#FFFFFF" }}
								>
									Chat with Elya
								</h3>
								<p
									className="text-xs"
									style={{
										color: "rgba(255, 255, 255, 0.9)",
										fontSize: "11px",
									}}
								>
									Your AI Wellness Companion
								</p>
							</div>
						</div>
						<button
							onClick={() => setIsOpen(false)}
							className="p-2 rounded-lg transition-all hover:scale-110"
							style={{
								backgroundColor: "rgba(255, 255, 255, 0.2)",
								border: "1px solid rgba(255, 255, 255, 0.3)",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor =
									"rgba(255, 255, 255, 0.3)";
								e.currentTarget.style.transform = "scale(1.1)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor =
									"rgba(255, 255, 255, 0.2)";
								e.currentTarget.style.transform = "scale(1)";
							}}
							aria-label="Close chat"
						>
							<X size={20} style={{ color: "#FFFFFF", strokeWidth: 2.5 }} />
						</button>
					</div>

					{/* AgenticFlow iframe - now using the embed URL */}
					<iframe
						style={{
							minHeight: "380px",
							flex: 1,
							width: "100%",
							border: "none",
						}}
						src="https://agenticflow.ai/embed/agents/a1cab40c-bcc2-49d8-ab97-f233f9b83fb2?theme=green"
						width="100%"
						height="100%"
						frameBorder="0"
						title="Elya AI Chat"
						allow="clipboard-write; microphone"
					/>
				</div>
			)}
		</>
	);
}
