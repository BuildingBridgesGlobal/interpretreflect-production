import { ArrowLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

export function About() {
	const navigate = useNavigate();

	return (
		<div style={{ backgroundColor: "#FAF9F6", minHeight: "100vh" }}>
			{/* Header */}
			<nav
				className="sticky top-0 z-50"
				style={{
					backgroundColor: "rgba(250, 249, 246, 0.95)",
					backdropFilter: "blur(10px)",
					borderBottom: "1px solid rgba(45, 95, 63, 0.2)",
				}}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center">
							<button
								onClick={() => navigate("/")}
								className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all"
								style={{
									background:
										"linear-gradient(135deg, var(--color-green-600), var(--color-green-500))",
									color: "#FFFFFF",
									boxShadow: "0 2px 8px rgba(45, 95, 63, 0.2)",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.transform = "translateY(-1px)";
									e.currentTarget.style.boxShadow =
										"0 4px 12px rgba(45, 95, 63, 0.3)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.transform = "translateY(0)";
									e.currentTarget.style.boxShadow =
										"0 2px 8px rgba(45, 95, 63, 0.2)";
								}}
							>
								<ArrowLeft className="h-5 w-5" style={{ color: "#FFFFFF" }} />
								<span className="text-base">InterpretReflect™</span>
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<div
				className="relative overflow-hidden py-5"
				style={{
					background:
						"linear-gradient(135deg, rgba(107, 139, 96, 0.05) 0%, rgba(92, 127, 79, 0.05) 100%)",
				}}
			>
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h1
						className="text-4xl md:text-5xl font-bold mb-2"
						style={{ color: "#1A1A1A" }}
					>
						About InterpretReflect™
					</h1>

					{/* Opening Statement */}
					<div className="max-w-3xl mx-auto mb-2">
						<p
							className="text-lg leading-relaxed mb-3"
							style={{ color: "#3A3A3A" }}
						>
							Interpreters are present in moments that shape lives. A parent learning about a child's diagnosis. A DeafBlind person navigating a hospital visit. A refugee family working with legal services. A college student accessing lectures. Each of these conversations carries weight.
						</p>
						<p
							className="text-lg leading-relaxed"
							style={{ color: "#3A3A3A" }}
						>
							For interpreters, that weight often lingers long after the assignment ends. InterpretReflect™ was created to provide a place where interpreters can process, reset, and sustain their practice in service of the communities that depend on equitable access to communication.
						</p>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
				{/* Why We Exist */}
				<section className="mb-2">
					<h2 className="text-3xl font-bold mb-1" style={{ color: "#1A1A1A" }}>
						Why We Exist
					</h2>
					<div
						className="rounded-2xl p-4"
						style={{
							backgroundColor: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						}}
					>
						<p
							className="text-lg leading-relaxed mb-4"
							style={{ color: "#3A3A3A" }}
						>
							Burnout, vicarious trauma, and compassion fatigue are not signs of weakness. They are natural outcomes of a profession that demands emotional and cognitive endurance across spoken, signed, and tactile languages.
						</p>

						<p
							className="text-lg font-semibold mb-4"
							style={{ color: "#5C7F4F" }}
						>
							InterpretReflect provides tools that:
						</p>

						<div className="space-y-3 mb-6 ml-4">
							<div className="flex items-start">
								<div
									className="w-2 h-2 rounded-full mr-3 mt-2"
									style={{ backgroundColor: "#5B9378" }}
								/>
								<p className="text-base" style={{ color: "#3A3A3A" }}>
									Help manage compassion fatigue through evidence-based daily
									practices
								</p>
							</div>
							<div className="flex items-start">
								<div
									className="w-2 h-2 rounded-full mr-3 mt-2"
									style={{ backgroundColor: "#5B9378" }}
								/>
								<p className="text-base" style={{ color: "#3A3A3A" }}>
									Offer confidential, guided reflection to process the emotional and mental load of assignments
								</p>
							</div>
							<div className="flex items-start">
								<div
									className="w-2 h-2 rounded-full mr-3 mt-2"
									style={{ backgroundColor: "#5B9378" }}
								/>
								<p className="text-base" style={{ color: "#3A3A3A" }}>
									Build long-term resilience so interpreters can sustain their careers while communities receive consistent, ethical access to communication
								</p>
							</div>
						</div>

						<div
							className="p-4 rounded-lg"
							style={{ backgroundColor: "rgba(92, 127, 79, 0.05)" }}
						>
							<p className="text-base font-medium" style={{ color: "#5C7F4F" }}>
								When interpreters are supported, Deaf, DeafBlind, hard-of-hearing, immigrant, and multilingual communities benefit. Conversations become clearer, interactions feel safer, and access becomes more equitable.
							</p>
						</div>
					</div>
				</section>

				{/* What We Do */}
				<section className="mb-2">
					<h2 className="text-3xl font-bold mb-1" style={{ color: "#1A1A1A" }}>
						What We Do
					</h2>
					<div
						className="rounded-2xl p-4"
						style={{
							backgroundColor: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						}}
					>
						<p
							className="text-lg leading-relaxed mb-4"
							style={{ color: "#3A3A3A" }}
						>
							We translate neuroscience and trauma-informed care into tools designed for the realities of interpreting work across modalities:
						</p>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
							<div
								className="p-4 rounded-lg"
								style={{ backgroundColor: "rgba(107, 139, 96, 0.05)" }}
							>
								<p
									className="text-base font-semibold"
									style={{ color: "#5C7F4F" }}
								>
									3-minute decompression exercises
								</p>
								<p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
									Between assignments
								</p>
							</div>

							<div
								className="p-4 rounded-lg"
								style={{ backgroundColor: "rgba(107, 139, 96, 0.05)" }}
							>
								<p
									className="text-base font-semibold"
									style={{ color: "#5C7F4F" }}
								>
									Confidential journaling prompts
								</p>
								<p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
									Grounded in interpreting experiences
								</p>
							</div>

							<div
								className="p-4 rounded-lg"
								style={{ backgroundColor: "rgba(107, 139, 96, 0.05)" }}
							>
								<p
									className="text-base font-semibold"
									style={{ color: "#5C7F4F" }}
								>
									Grounding techniques
								</p>
								<p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
									For moments when stress runs high
								</p>
							</div>

							<div
								className="p-4 rounded-lg"
								style={{ backgroundColor: "rgba(107, 139, 96, 0.05)" }}
							>
								<p
									className="text-base font-semibold"
									style={{ color: "#5C7F4F" }}
								>
									Reflection guidance
								</p>
								<p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
									Informed by interpreters' lived experiences in diverse settings
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* How It Works */}
				<section className="mb-2">
					<h2 className="text-3xl font-bold mb-1" style={{ color: "#1A1A1A" }}>
						How It Works
					</h2>
					<div
						className="rounded-2xl p-4"
						style={{
							backgroundColor: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						}}
					>
						<p className="text-lg mb-6" style={{ color: "#3A3A3A" }}>
							In three simple steps, support is always within reach:
						</p>

						<div className="space-y-4">
							<div className="flex items-center">
								<div
									className="w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold text-white"
									style={{
										background: "linear-gradient(135deg, #5B9378, #5F7F55)",
									}}
								>
									1
								</div>
								<p className="text-base" style={{ color: "#3A3A3A" }}>
									Sign up in 30 seconds
								</p>
							</div>

							<div className="flex items-center">
								<div
									className="w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold text-white"
									style={{
										background: "linear-gradient(135deg, #5B9378, #5F7F55)",
									}}
								>
									2
								</div>
								<p className="text-base" style={{ color: "#3A3A3A" }}>
									Choose your focus: stress relief, resilience, or emotional
									reset
								</p>
							</div>

							<div className="flex items-center">
								<div
									className="w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold text-white"
									style={{
										background: "linear-gradient(135deg, #5B9378, #5F7F55)",
									}}
								>
									3
								</div>
								<p className="text-base" style={{ color: "#3A3A3A" }}>
									Access tools instantly on any device, in any setting
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Why Choose InterpretReflect */}
				<section className="mb-2">
					<h2 className="text-3xl font-bold mb-1" style={{ color: "#1A1A1A" }}>
						Why Choose InterpretReflect
					</h2>
					<div
						className="rounded-2xl p-4"
						style={{
							background:
								"linear-gradient(145deg, rgba(107, 139, 96, 0.03) 0%, rgba(92, 127, 79, 0.03) 100%)",
							border: "2px solid rgba(45, 95, 63, 0.2)",
						}}
					>
						<div className="space-y-4">
							<div className="flex items-start">
								<div
									className="w-2 h-2 rounded-full mr-3 mt-2"
									style={{ backgroundColor: "#5B9378" }}
								/>
								<p className="text-base" style={{ color: "#3A3A3A" }}>
									Founded by a CODA, veteran, and interpreter with nearly two decades of experience in community, medical, legal, performance, VRS/VRI, and educational contexts
								</p>
							</div>
							<div className="flex items-start">
								<div
									className="w-2 h-2 rounded-full mr-3 mt-2"
									style={{ backgroundColor: "#5B9378" }}
								/>
								<p className="text-base" style={{ color: "#3A3A3A" }}>
									Grounded in neuroscience, trauma-informed care, and emotional intelligence research
								</p>
							</div>
							<div className="flex items-start">
								<div
									className="w-2 h-2 rounded-full mr-3 mt-2"
									style={{ backgroundColor: "#5B9378" }}
								/>
								<p className="text-base" style={{ color: "#3A3A3A" }}>
									Confidential, secure, and designed with interpreter privacy at the center
								</p>
							</div>
							<div className="flex items-start">
								<div
									className="w-2 h-2 rounded-full mr-3 mt-2"
									style={{ backgroundColor: "#5B9378" }}
								/>
								<p className="text-base" style={{ color: "#3A3A3A" }}>
									Built through consultation with interpreters and Deaf community members across multiple domains
								</p>
							</div>
							<div className="flex items-start">
								<div
									className="w-2 h-2 rounded-full mr-3 mt-2"
									style={{ backgroundColor: "#5B9378" }}
								/>
								<p className="text-base" style={{ color: "#3A3A3A" }}>
									Part of a growing community committed to sustainable practice and communication equity
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Common Concerns */}
				<section className="mb-2">
					<h2 className="text-3xl font-bold mb-1" style={{ color: "#1A1A1A" }}>
						Common Concerns, Answered
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div
							className="rounded-xl p-4"
							style={{
								backgroundColor: "#FFFFFF",
								boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
							}}
						>
							<p className="font-semibold mb-2" style={{ color: "#5C7F4F" }}>
								No time?
							</p>
							<p className="text-sm" style={{ color: "#5A5A5A" }}>
								Tools are designed for 3–5 minute breaks.
							</p>
						</div>

						<div
							className="rounded-xl p-4"
							style={{
								backgroundColor: "#FFFFFF",
								boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
							}}
						>
							<p className="font-semibold mb-2" style={{ color: "#5C7F4F" }}>
								Privacy worried?
							</p>
							<p className="text-sm" style={{ color: "#5A5A5A" }}>
								All reflections are secure and can remain anonymous if you
								choose.
							</p>
						</div>

						<div
							className="rounded-xl p-4"
							style={{
								backgroundColor: "#FFFFFF",
								boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
							}}
						>
							<p className="font-semibold mb-2" style={{ color: "#5C7F4F" }}>
								Not tech-savvy?
							</p>
							<p className="text-sm" style={{ color: "#5A5A5A" }}>
								The interface is simple and tested with interpreters across backgrounds and experience levels.
							</p>
						</div>

						<div
							className="rounded-xl p-4"
							style={{
								backgroundColor: "#FFFFFF",
								boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
							}}
						>
							<p className="font-semibold mb-2" style={{ color: "#5C7F4F" }}>
								Cost concerns?
							</p>
							<p className="text-sm" style={{ color: "#5A5A5A" }}>
								Affordable options are available, with employer sponsorship
								programs on the way.
							</p>
						</div>
					</div>
				</section>

				{/* The Bigger Picture */}
				<section className="mb-2">
					<h2 className="text-3xl font-bold mb-1" style={{ color: "#1A1A1A" }}>
						The Bigger Picture
					</h2>
					<div
						className="rounded-2xl p-4"
						style={{
							backgroundColor: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						}}
					>
						<p
							className="text-lg leading-relaxed mb-3"
							style={{ color: "#3A3A3A" }}
						>
							Interpreting is about language and so much more. It is about showing up fully as a human being in moments where presence, clarity, and attunement matter. Neuroscience shows that chronic stress and unprocessed emotions disrupt focus, memory, and decision-making. Emotional intelligence research confirms that resilience and self-awareness are what allow professionals to regulate under pressure and stay grounded in their values.
						</p>

						<p
							className="text-lg leading-relaxed mb-4"
							style={{ color: "#3A3A3A" }}
						>
							When interpreters have the tools to pause, reflect, and reset, they are not just protecting themselves. They are strengthening their ability to enter spaces clear, centered, and authentically present. Communities benefit when interpreters can bring their whole selves into the work. Deaf, DeafBlind, hard-of-hearing, multilingual, and hearing participants all experience communication that feels safer, more trustworthy, and more equitable.
						</p>

						<div
							className="p-4 rounded-lg"
							style={{
								backgroundColor: "rgba(92, 127, 79, 0.05)",
								borderLeft: "4px solid #5B9378",
							}}
						>
							<p className="text-base font-medium" style={{ color: "#5C7F4F" }}>
								InterpretReflect™ exists so interpreters can care for their nervous systems, strengthen emotional awareness, and sustain the energy required to serve in ways that honor both their humanity and the humanity of the people they work with.
							</p>
						</div>
					</div>
				</section>

				{/* Call to Action */}
				<section className="text-center mb-2">
					<h2 className="text-3xl font-bold mb-1" style={{ color: "#1A1A1A" }}>
						Take the First Step
					</h2>

					<div
						className="max-w-2xl mx-auto p-3 rounded-xl mb-3"
						style={{
							backgroundColor: "rgba(255, 255, 255, 0.9)",
							border: "2px solid rgba(45, 95, 63, 0.2)",
						}}
					>
						<p className="text-lg font-medium" style={{ color: "#5C7F4F" }}>
							Every day interpreters support communication in high-stakes and everyday interactions alike. InterpretReflect is here to support interpreters, so the communities they serve can thrive too.
						</p>
					</div>

					<button
						onClick={() => navigate("/")}
						className="inline-flex items-center px-8 py-2 rounded-xl font-semibold text-lg transition-all"
						style={{
							background:
								"linear-gradient(135deg, var(--color-green-600), var(--color-green-500))",
							color: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(45, 95, 63, 0.3)",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
							e.currentTarget.style.boxShadow =
								"0 8px 25px rgba(45, 95, 63, 0.4)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = "translateY(0) scale(1)";
							e.currentTarget.style.boxShadow =
								"0 4px 15px rgba(45, 95, 63, 0.3)";
						}}
					>
						Start Your Wellness Journey
					</button>
				</section>

				{/* Founder's Note */}
				<section className="mb-2">
					<h2 className="text-3xl font-bold mb-1 text-center" style={{ color: "#1A1A1A" }}>
						Founder's Note
					</h2>
					<div
						className="rounded-2xl p-4"
						style={{
							backgroundColor: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
							border: "2px solid rgba(45, 95, 63, 0.2)",
						}}
					>
						<p
							className="text-lg leading-relaxed mb-3"
							style={{ color: "#3A3A3A" }}
						>
							My name is Sarah Wheeler. I am a Child of Deaf Adults, a United States Air Force veteran, and have been interpreting since 2006 across community, medical, legal, educational, VRS/VRI, and performance settings. I hold graduate degrees in Interpreter Pedagogy and Psychology and national certification as an interpreter. I am also certified in emotional intelligence assessment (EQ-i 2.0 and EQ 360).
						</p>
						<p
							className="text-lg leading-relaxed mb-3"
							style={{ color: "#3A3A3A" }}
						>
							Over the years I have presented internationally, taught at universities, published books, and co-created programs that blend emotional intelligence with interpreting practice. My leadership includes founding Building Bridges Global, The Interpreter School, and Huvia Technologies, where we are building AI-powered tools that keep human connection at the center of innovation.
						</p>
						<p
							className="text-lg leading-relaxed mb-4"
							style={{ color: "#3A3A3A" }}
						>
							I have been honored with recognition such as Interpreter of the Year and the North Carolina Association of the Deaf award for Outstanding Contributions to the Welfare of Deaf Persons.
						</p>
						<p
							className="text-lg leading-relaxed mb-4"
							style={{ color: "#3A3A3A" }}
						>
							My goal has always been to help interpreters sustain clarity and presence by supporting both the mind and the nervous system. InterpretReflect™ is the culmination of these experiences. It is a platform designed for interpreters of all modalities, by someone who has walked the path, carried the weight, and knows the importance of having a place to set it down.
						</p>
						<p
							className="text-base font-semibold"
							style={{ color: "#5C7F4F" }}
						>
							—Sarah Wheeler, M.Ed., MS, NIC Advanced<br />
							Founder, InterpretReflect™
						</p>
					</div>
				</section>

				{/* Footer */}
				<div
					className="mt-16 pt-8 text-center"
					style={{ borderTop: "1px solid #E8E5E0" }}
				>
					<button
						onClick={() => navigate("/")}
						className="inline-flex items-center px-5 py-2.5 rounded-lg font-semibold transition-all text-sm"
						style={{
							backgroundColor: "#FFFFFF",
							color: "#5B9378",
							border: "2px solid #5B9378",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = "#F8FBF6";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = "#FFFFFF";
						}}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Home
					</button>
				</div>
			</div>
		</div>
	);
}
