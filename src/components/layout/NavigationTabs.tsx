import type React from "react";

interface NavigationTabsProps {
	activeTab: string;
	setActiveTab: (tab: string) => void;
}

const tabs = [
	{ id: "home", label: "Home" },
	{ id: "reflection", label: "Reflection Studio" },
	{ id: "stress", label: "Stress Reset" },
	{ id: "affirmations", label: "Affirmations" },
	{ id: "insights", label: "Growth Insights" },
];

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
	activeTab,
	setActiveTab,
}) => {
	return (
		<div
			className="px-4 sm:px-6 lg:px-8 py-4"
			style={{ backgroundColor: "#F8FAFB" }}
		>
			{/* Mobile-optimized styles */}
			<style>{`
				.scrollbar-hide {
					-ms-overflow-style: none;
					scrollbar-width: none;
				}
				.scrollbar-hide::-webkit-scrollbar {
					display: none;
				}
				@media (max-width: 640px) {
					.nav-tab-button {
						min-width: 44px;
						min-height: 44px;
						touch-action: manipulation;
					}
				}
			`}</style>
			<nav
				role="navigation"
				aria-label="Main navigation"
				className="max-w-7xl mx-auto"
				style={{
					backgroundColor: "transparent",
					padding: "12px",
				}}
			>
				<ul
					className="flex justify-center space-x-2 sm:space-x-3 list-none m-0 p-0 overflow-x-auto scrollbar-hide"
					role="tablist"
					style={{
						scrollbarWidth: 'none',
						msOverflowStyle: 'none',
					}}
				>
					{tabs.map((tab) => (
						<li key={tab.id} role="presentation">
							<button
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									setActiveTab(tab.id);
								}}
								className={`nav-tab-button flex items-center px-5 sm:px-6 py-3 sm:py-3.5 text-base sm:text-lg font-semibold transition-all duration-300 rounded-lg whitespace-nowrap`}
								role="tab"
								aria-selected={activeTab === tab.id}
								aria-controls={`${tab.id}-panel`}
								aria-current={activeTab === tab.id ? "page" : undefined}
								style={{
									color: activeTab === tab.id ? "white" : "#374151",
									fontWeight: activeTab === tab.id ? "600" : "500",
									backgroundColor: activeTab === tab.id ? "#6B8268" : "transparent",
									border: activeTab === tab.id ? "2px solid #6B8268" : "2px solid transparent",
									boxShadow: activeTab === tab.id ? "0 2px 4px rgba(107, 130, 104, 0.2)" : "none"
								}}
								onMouseEnter={(e) => {
									if (activeTab !== tab.id) {
										e.currentTarget.style.backgroundColor = "#F3F4F6";
										e.currentTarget.style.color = "#111827";
									}
								}}
								onMouseLeave={(e) => {
									if (activeTab !== tab.id) {
										e.currentTarget.style.backgroundColor = "transparent";
										e.currentTarget.style.color = "#374151";
									}
								}}
							>
								{tab.label}
							</button>
						</li>
					))}
				</ul>
			</nav>
		</div>
	);
};
