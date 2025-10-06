import React, { useEffect, useState } from "react";

export function AgenticFlowChat() {
	const [widgetReady, setWidgetReady] = useState(false);

	useEffect(() => {
		// Wait for AgenticFlow script to load and create widget
		const checkWidget = setInterval(() => {
			// Check if AgenticFlow has created any elements
			const widget = document.querySelector('[id*="agenticflow"], [class*="agenticflow"], iframe[src*="agenticflow"]');
			if (widget) {
				console.log('AgenticFlow widget found:', widget);
				setWidgetReady(true);
				clearInterval(checkWidget);
			}
		}, 500);

		// Clear interval after 10 seconds
		setTimeout(() => {
			clearInterval(checkWidget);
			if (!widgetReady) {
				console.log('AgenticFlow widget not detected after 10 seconds');
			}
		}, 10000);

		return () => clearInterval(checkWidget);
	}, [widgetReady]);

	const handleOpenChat = () => {
		console.log('Elya button clicked, looking for AgenticFlow widget...');

		// Try multiple selectors to find the AgenticFlow widget/button
		const selectors = [
			'[data-agenticflow]',
			'[id*="agenticflow"]',
			'[class*="agenticflow"]',
			'iframe[src*="agenticflow"]',
			'button[aria-label*="chat"]',
			'button[aria-label*="agent"]',
		];

		for (const selector of selectors) {
			const element = document.querySelector(selector) as HTMLElement;
			if (element) {
				console.log('Found element with selector:', selector, element);

				// If it's a button, click it
				if (element.tagName === 'BUTTON') {
					element.click();
					return;
				}

				// If it's an iframe, try to make it visible
				if (element.tagName === 'IFRAME') {
					element.style.display = 'block';
					element.style.visibility = 'visible';
					element.style.opacity = '1';
					return;
				}

				// Try clicking any clickable parent
				const clickableParent = element.closest('button, a') as HTMLElement;
				if (clickableParent) {
					clickableParent.click();
					return;
				}
			}
		}

		console.log('No AgenticFlow widget found. Check if script loaded correctly.');
		console.log('Available scripts:', Array.from(document.scripts).map(s => s.src));
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

			{/* Debug info - remove after testing */}
			{process.env.NODE_ENV === 'development' && (
				<div style={{
					position: 'fixed',
					top: '10px',
					left: '10px',
					background: 'black',
					color: 'white',
					padding: '10px',
					fontSize: '12px',
					zIndex: 99998
				}}>
					Widget Ready: {widgetReady ? 'Yes' : 'No'}
				</div>
			)}
		</>
	);
}
