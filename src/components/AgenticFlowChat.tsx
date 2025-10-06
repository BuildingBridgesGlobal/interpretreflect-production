import React, { useEffect } from "react";

export function AgenticFlowChat() {
	// Load AgenticFlow script on component mount
	useEffect(() => {
		// Check if script already exists
		const existingScript = document.getElementById('agenticflow-agent');
		if (existingScript) return;

		// Load the AgenticFlow script - it will create its own widget
		const script = document.createElement('script');
		script.id = 'agenticflow-agent';
		script.src = 'https://agenticflow.ai/scripts/agent.js';
		script.setAttribute('data-agent-id', 'a1cab40c-bcc2-49d8-ab97-f233f9b83fb2');
		script.async = true;
		document.body.appendChild(script);

		return () => {
			// Cleanup on unmount (optional - you might want to keep it loaded)
			const scriptEl = document.getElementById('agenticflow-agent');
			if (scriptEl) {
				scriptEl.remove();
			}
			// Also remove any widget elements AgenticFlow created
			const widget = document.querySelector('[data-agenticflow-widget]');
			if (widget) {
				widget.remove();
			}
		};
	}, []);

	// This component just loads the script - AgenticFlow handles the UI
	return null;
}
