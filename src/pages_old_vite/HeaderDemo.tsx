import type React from "react";
import { useState } from "react";
import { BrowserRouter } from "react-router-dom";

import Header from "../components/Header";
import "../styles/header.css";
import "../styles/typography.css";

export const HeaderDemo: React.FC = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(true);
	const [showContent, setShowContent] = useState(true);

	const handleLogout = () => {
		alert("Logout clicked - would normally handle authentication");
		setIsAuthenticated(false);
	};

	return (
		<BrowserRouter>
			<div style={{ minHeight: "100vh", backgroundColor: "#FAF9F6" }}>
				{/* Header Component */}
				<Header
					isAuthenticated={isAuthenticated}
					userName="Sarah"
					onLogout={handleLogout}
				/>

				{/* Main Content Area */}
				<main
					id="main-content"
					role="main"
					style={{
						maxWidth: "1280px",
						margin: "0 auto",
						padding: "3rem 1.5rem",
					}}
				>
					<div style={{ marginBottom: "3rem" }}>
						<h1
							style={{
								fontSize: "clamp(2rem, 4vw, 3rem)",
								fontWeight: 700,
								color: "#1A1F1C",
								marginBottom: "1rem",
								fontFamily: "Inter, -apple-system, sans-serif",
							}}
						>
							Accessible Header Component Demo
						</h1>

						<p
							style={{
								fontSize: "1.25rem",
								lineHeight: 1.6,
								color: "#5C6A60",
								marginBottom: "2rem",
								maxWidth: "65ch",
							}}
						>
							This header component demonstrates WCAG AA compliance with proper
							color contrast, keyboard navigation, screen reader support, and
							responsive design.
						</p>
					</div>

					{/* Feature Cards */}
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
							gap: "2rem",
							marginBottom: "3rem",
						}}
					>
						{/* Accessibility Features */}
						<div
							style={{
								backgroundColor: "#FFFFFF",
								padding: "2rem",
								borderRadius: "0.75rem",
								boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
								border: "1px solid rgba(92, 127, 79, 0.1)",
							}}
						>
							<h2
								style={{
									fontSize: "1.5rem",
									fontWeight: 600,
									color: "#1A1F1C",
									marginBottom: "1rem",
								}}
							>
								♿ Accessibility Features
							</h2>
							<ul
								style={{
									fontSize: "1.125rem",
									lineHeight: 1.8,
									color: "#5C6A60",
									paddingLeft: "1.5rem",
								}}
							>
								<li>✓ Skip to main content link (Tab to see)</li>
								<li>✓ WCAG AA color contrast (4.5:1+)</li>
								<li>✓ 44px minimum touch targets</li>
								<li>✓ Keyboard navigable (Tab/Enter)</li>
								<li>✓ Screen reader optimized</li>
								<li>✓ Focus indicators on all interactive elements</li>
								<li>✓ ARIA labels and landmarks</li>
								<li>✓ Semantic HTML structure</li>
							</ul>
						</div>

						{/* Typography */}
						<div
							style={{
								backgroundColor: "#FFFFFF",
								padding: "2rem",
								borderRadius: "0.75rem",
								boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
								border: "1px solid rgba(92, 127, 79, 0.1)",
							}}
						>
							<h2
								style={{
									fontSize: "1.5rem",
									fontWeight: 600,
									color: "#1A1F1C",
									marginBottom: "1rem",
								}}
							>
								📝 Typography
							</h2>
							<ul
								style={{
									fontSize: "1.125rem",
									lineHeight: 1.8,
									color: "#5C6A60",
									paddingLeft: "1.5rem",
								}}
							>
								<li>✓ Inter font family</li>
								<li>✓ 18px minimum font size</li>
								<li>✓ Clear visual hierarchy</li>
								<li>✓ Adequate line height (1.5+)</li>
								<li>✓ Proper letter spacing</li>
								<li>✓ Responsive font scaling</li>
								<li>✓ System font fallbacks</li>
							</ul>
						</div>

						{/* Responsive Design */}
						<div
							style={{
								backgroundColor: "#FFFFFF",
								padding: "2rem",
								borderRadius: "0.75rem",
								boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
								border: "1px solid rgba(92, 127, 79, 0.1)",
							}}
						>
							<h2
								style={{
									fontSize: "1.5rem",
									fontWeight: 600,
									color: "#1A1F1C",
									marginBottom: "1rem",
								}}
							>
								📱 Responsive Features
							</h2>
							<ul
								style={{
									fontSize: "1.125rem",
									lineHeight: 1.8,
									color: "#5C6A60",
									paddingLeft: "1.5rem",
								}}
							>
								<li>✓ Mobile menu (resize to see)</li>
								<li>✓ Touch-friendly targets</li>
								<li>✓ Flexible layout</li>
								<li>✓ Scroll effects</li>
								<li>✓ Breakpoint optimization</li>
								<li>✓ Dark mode support</li>
								<li>✓ High contrast mode ready</li>
							</ul>
						</div>
					</div>

					{/* Testing Instructions */}
					<div
						style={{
							backgroundColor: "rgba(92, 127, 79, 0.05)",
							padding: "2rem",
							borderRadius: "0.75rem",
							border: "1px solid rgba(45, 95, 63, 0.2)",
							marginBottom: "2rem",
						}}
					>
						<h2
							style={{
								fontSize: "1.75rem",
								fontWeight: 600,
								color: "#1A1F1C",
								marginBottom: "1rem",
							}}
						>
							🧪 Testing Instructions
						</h2>
						<ol
							style={{
								fontSize: "1.125rem",
								lineHeight: 1.8,
								color: "#5C6A60",
								paddingLeft: "1.5rem",
							}}
						>
							<li>
								<strong>Keyboard Navigation:</strong> Press Tab to navigate
								through all interactive elements
							</li>
							<li>
								<strong>Skip Link:</strong> Press Tab once to reveal the "Skip
								to main content" link
							</li>
							<li>
								<strong>Mobile Menu:</strong> Resize your browser window to see
								the responsive mobile menu
							</li>
							<li>
								<strong>Focus States:</strong> Tab through elements to see clear
								focus indicators
							</li>
							<li>
								<strong>Screen Reader:</strong> Use NVDA/JAWS/VoiceOver to test
								announcements
							</li>
							<li>
								<strong>Color Contrast:</strong> Use browser DevTools or axe to
								verify contrast ratios
							</li>
						</ol>
					</div>

					{/* Toggle Authentication State */}
					<div
						style={{
							display: "flex",
							gap: "1rem",
							alignItems: "center",
							padding: "2rem",
							backgroundColor: "#FFFFFF",
							borderRadius: "0.75rem",
							boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
						}}
					>
						<button
							onClick={() => setIsAuthenticated(!isAuthenticated)}
							style={{
								padding: "0.75rem 1.5rem",
								fontSize: "1.125rem",
								fontWeight: 600,
								color: "#FFFFFF",
								backgroundColor: "#5C7F4F",
								border: "none",
								borderRadius: "0.5rem",
								cursor: "pointer",
								minHeight: "44px",
							}}
						>
							Toggle Auth State
						</button>
						<span
							style={{
								fontSize: "1.125rem",
								color: "#5C6A60",
							}}
						>
							Currently:{" "}
							{isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated"}
						</span>
					</div>

					{/* Sample Content for Scroll Testing */}
					{showContent && (
						<div style={{ marginTop: "3rem" }}>
							<h2
								style={{
									fontSize: "2rem",
									fontWeight: 600,
									color: "#1A1F1C",
									marginBottom: "1rem",
								}}
							>
								Sample Content (Scroll to test sticky header)
							</h2>
							{[...Array(20)].map((_, i) => (
								<p
									key={i}
									style={{
										fontSize: "1.125rem",
										lineHeight: 1.6,
										color: "#5C6A60",
										marginBottom: "1rem",
									}}
								>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
									do eiusmod tempor incididunt ut labore et dolore magna aliqua.
									Ut enim ad minim veniam, quis nostrud exercitation ullamco
									laboris.
								</p>
							))}
						</div>
					)}
				</main>
			</div>
		</BrowserRouter>
	);
};

export default HeaderDemo;
