import React, { useEffect, useState } from "react";

export function AgenticFlowChat() {
	const [scriptLoaded, setScriptLoaded] = useState(false);

	// Load AgenticFlow script on component mount
	useEffect(() => {
		// Check if script already exists
		const existingScript = document.getElementById('agenticflow-agent');
		if (existingScript) {
			setScriptLoaded(true);
			return;
		}

		// Load the AgenticFlow script
		const script = document.createElement('script');
		script.id = 'agenticflow-agent';
		script.src = 'https://agenticflow.ai/scripts/agent.js';
		script.setAttribute('data-agent-id', 'a1cab40c-bcc2-49d8-ab97-f233f9b83fb2');
		script.async = true;

		script.onload = () => {
			console.log('AgenticFlow script loaded successfully');
			setScriptLoaded(true);
		};

		script.onerror = () => {
			console.error('Failed to load AgenticFlow script');
		};

		document.body.appendChild(script);

		return () => {
			// Keep script loaded - don't remove on unmount
		};
	}, []);

	const handleOpenChat = () => {
		// Try to find and click AgenticFlow's button
		const agenticButton = document.querySelector('[data-agenticflow-button]') as HTMLElement;
		if (agenticButton) {
			agenticButton.click();
			return;
		}

		// Alternative: try to find iframe or widget
		const agenticWidget = document.querySelector('iframe[src*="agenticflow"]') as HTMLElement;
		if (agenticWidget) {
			agenticWidget.style.display = 'block';
			return;
		}

		console.log('AgenticFlow widget not found. Script loaded:', scriptLoaded);
	};

	return (
		<>
			{/* Custom Elya Button */}
			<button
				onClick={handleOpenChat}
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
		</>
	);
}
