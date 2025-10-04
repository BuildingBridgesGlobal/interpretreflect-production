export interface FrameworkQuestion {
	id: string;
	question: string;
	category?: string;
}

export interface Framework {
	id: string;
	name: string;
	description: string;
	sections: {
		title: string;
		questions: FrameworkQuestion[];
	}[];
}

export const deepDiveFrameworks: Record<string, Framework> = {
	pearls: {
		id: "pearls",
		name: "PEARLS Clinical Debrief",
		description:
			"Partnership, Acknowledgment, Respect, Legitimation, Support framework for clinical reflection",
		sections: [
			{
				title: "Partnership & Collaboration",
				questions: [
					{
						id: "p1",
						question:
							"How did you establish partnership with the patient/provider during this encounter?",
					},
					{
						id: "p2",
						question:
							"What collaborative strategies did you use to ensure all parties felt included?",
					},
					{
						id: "p3",
						question:
							"Were there moments where partnership broke down? How did you rebuild it?",
					},
				],
			},
			{
				title: "Acknowledgment & Recognition",
				questions: [
					{
						id: "a1",
						question:
							"How did you acknowledge the emotional content of the interaction?",
					},
					{
						id: "a2",
						question:
							"What emotional cues did you notice and how did you respond to them?",
					},
					{
						id: "a3",
						question:
							"Did you miss any important acknowledgment opportunities?",
					},
				],
			},
			{
				title: "Respect & Dignity",
				questions: [
					{
						id: "r1",
						question:
							"How did you demonstrate respect for all parties' perspectives?",
					},
					{
						id: "r2",
						question:
							"Were there cultural or personal values that required special consideration?",
					},
					{
						id: "r3",
						question:
							"How did you maintain professional boundaries while showing respect?",
					},
				],
			},
			{
				title: "Legitimation & Validation",
				questions: [
					{
						id: "l1",
						question:
							"How did you validate the feelings expressed during the encounter?",
					},
					{
						id: "l2",
						question:
							"Were there concerns that you struggled to legitimize? Why?",
					},
					{
						id: "l3",
						question:
							"What strategies did you use to normalize difficult emotions?",
					},
				],
			},
			{
				title: "Support & Resources",
				questions: [
					{
						id: "s1",
						question:
							"What support did you offer or facilitate during the encounter?",
					},
					{
						id: "s2",
						question:
							"How did you assess what type of support was most needed?",
					},
					{
						id: "s3",
						question:
							"Were there support resources you wish you had available?",
					},
				],
			},
			{
				title: "Clinical Integration",
				questions: [
					{
						id: "c1",
						question:
							"How did this framework enhance your interpreting effectiveness?",
					},
					{
						id: "c2",
						question: "What clinical outcomes were impacted by your approach?",
					},
				],
			},
		],
	},
	johns: {
		id: "johns",
		name: "Johns Model of Reflection",
		description:
			"Structured reflection through description, aesthetics, personal, ethics, empirics, and reflexivity",
		sections: [
			{
				title: "Description",
				questions: [
					{
						id: "j1",
						question:
							"Describe the interpreting situation in detail. What happened?",
					},
					{ id: "j2", question: "Who was involved and what were their roles?" },
					{ id: "j3", question: "What was the setting and context?" },
					{
						id: "j4",
						question: "What were the key moments or turning points?",
					},
				],
			},
			{
				title: "Aesthetics",
				questions: [
					{
						id: "j5",
						question: "How did you know what to do in this situation?",
					},
					{ id: "j6", question: "What informed your interpreting choices?" },
					{ id: "j7", question: "How did you respond to changing dynamics?" },
					{ id: "j8", question: "What skills did you draw upon?" },
				],
			},
			{
				title: "Personal",
				questions: [
					{ id: "j9", question: "How did you feel during this assignment?" },
					{
						id: "j10",
						question: "What internal factors influenced your performance?",
					},
					{
						id: "j11",
						question: "How did your past experiences shape your approach?",
					},
					{
						id: "j12",
						question: "What personal biases might have affected your work?",
					},
				],
			},
			{
				title: "Ethics",
				questions: [
					{
						id: "j13",
						question: "Were there ethical dilemmas? How did you navigate them?",
					},
					{
						id: "j14",
						question: "Did your actions align with professional standards?",
					},
					{
						id: "j15",
						question: "Were there competing ethical considerations?",
					},
					{
						id: "j16",
						question: "How did you balance neutrality with advocacy?",
					},
				],
			},
			{
				title: "Empirics",
				questions: [
					{
						id: "j17",
						question: "What knowledge from your training did you apply?",
					},
					{ id: "j18", question: "What evidence-based practices did you use?" },
					{
						id: "j19",
						question: "What research or theory supported your decisions?",
					},
					{ id: "j20", question: "What knowledge gaps did you identify?" },
				],
			},
			{
				title: "Reflexivity",
				questions: [
					{
						id: "j21",
						question: "Does this experience change how you view your practice?",
					},
					{
						id: "j22",
						question: "Has this changed your perspective on interpreting?",
					},
					{ id: "j23", question: "What assumptions have been challenged?" },
					{
						id: "j24",
						question: "How has this experience transformed you professionally?",
					},
					{
						id: "j25",
						question: "What will you do differently going forward?",
					},
					{
						id: "j26",
						question: "What learning will you carry into future assignments?",
					},
				],
			},
		],
	},
	aar: {
		id: "aar",
		name: "After Action Review",
		description:
			"Military-derived systematic review of what was planned, what happened, why, and improvements",
		sections: [
			{
				title: "Planning & Preparation",
				questions: [
					{
						id: "aar1",
						question: "What was supposed to happen in this assignment?",
					},
					{
						id: "aar2",
						question: "What were the stated objectives and expectations?",
					},
					{
						id: "aar3",
						question: "How did you prepare for this specific assignment?",
					},
					{ id: "aar4", question: "What resources did you gather beforehand?" },
				],
			},
			{
				title: "Actual Events",
				questions: [
					{
						id: "aar5",
						question: "What actually happened during the assignment?",
					},
					{ id: "aar6", question: "How did reality differ from expectations?" },
					{ id: "aar7", question: "What unexpected situations arose?" },
					{ id: "aar8", question: "What critical incidents occurred?" },
				],
			},
			{
				title: "Analysis & Understanding",
				questions: [
					{
						id: "aar9",
						question: "Why were there differences between planned and actual?",
					},
					{ id: "aar10", question: "What factors contributed to successes?" },
					{ id: "aar11", question: "What factors contributed to challenges?" },
					{ id: "aar12", question: "What assumptions proved incorrect?" },
				],
			},
			{
				title: "Team Dynamics",
				questions: [
					{
						id: "aar13",
						question: "How effectively did the team communicate?",
					},
					{ id: "aar14", question: "Were roles and responsibilities clear?" },
					{
						id: "aar15",
						question: "How were decisions made and communicated?",
					},
					{
						id: "aar16",
						question: "What team dynamics helped or hindered success?",
					},
				],
			},
			{
				title: "Lessons & Improvements",
				questions: [
					{ id: "aar17", question: "What can be done differently next time?" },
					{ id: "aar18", question: "What best practices emerged?" },
					{ id: "aar19", question: "What systemic issues need addressing?" },
					{
						id: "aar20",
						question: "What specific actions will you take going forward?",
					},
				],
			},
		],
	},
	feedback360: {
		id: "feedback360",
		name: "360-Degree Feedback",
		description:
			"Multi-perspective evaluation from self, peers, clients, and supervisors",
		sections: [
			{
				title: "Self-Assessment",
				questions: [
					{
						id: "f1",
						question: "How would you rate your overall performance?",
					},
					{ id: "f2", question: "What were your strongest contributions?" },
					{
						id: "f3",
						question: "Where did you fall short of your own standards?",
					},
					{
						id: "f4",
						question: "What skills did you demonstrate effectively?",
					},
				],
			},
			{
				title: "Peer Perspective",
				questions: [
					{
						id: "f5",
						question:
							"How do you think your team partner would describe your work?",
					},
					{
						id: "f6",
						question: "What feedback have peers given you recently?",
					},
					{ id: "f7", question: "How did you support your colleagues?" },
				],
			},
			{
				title: "Client Perspective",
				questions: [
					{
						id: "f8",
						question: "How do you think the client experienced your service?",
					},
					{
						id: "f9",
						question: "What feedback did you receive from consumers?",
					},
					{ id: "f10", question: "How well did you meet client needs?" },
				],
			},
			{
				title: "Provider Perspective",
				questions: [
					{
						id: "f11",
						question: "How do you think providers viewed your performance?",
					},
					{ id: "f12", question: "What provider feedback have you received?" },
					{
						id: "f13",
						question: "How did you facilitate provider communication?",
					},
				],
			},
			{
				title: "Synthesis & Growth",
				questions: [
					{
						id: "f14",
						question: "What patterns emerge across different perspectives?",
					},
					{ id: "f15", question: "Where do perspectives align or diverge?" },
					{
						id: "f16",
						question: "What gaps in our understanding have been revealed?",
					},
					{
						id: "f17",
						question: "What development priorities emerge from this feedback?",
					},
				],
			},
		],
	},
	contextSpecific: {
		id: "contextSpecific",
		name: "Context-Specific Sets",
		description:
			"Specialized reflection questions for different interpreting contexts",
		sections: [
			{
				title: "Medical Settings",
				questions: [
					{
						id: "cs1",
						question: "How did you manage medical terminology complexity?",
					},
					{ id: "cs2", question: "How did you handle emotional medical news?" },
					{
						id: "cs3",
						question: "What infection control protocols did you follow?",
					},
					{
						id: "cs4",
						question:
							"How did you navigate family dynamics in medical decisions?",
					},
					{
						id: "cs5",
						question: "How did you manage interpreting during procedures?",
					},
				],
			},
			{
				title: "Legal Settings",
				questions: [
					{
						id: "cs6",
						question: "How did you ensure accuracy in legal terminology?",
					},
					{
						id: "cs7",
						question:
							"How did you maintain impartiality in adversarial proceedings?",
					},
					{
						id: "cs8",
						question: "What challenges arose with legal jargon or concepts?",
					},
					{
						id: "cs9",
						question: "How did you handle simultaneous interpreting demands?",
					},
					{
						id: "cs10",
						question: "How did you manage high-stakes legal consequences?",
					},
				],
			},
			{
				title: "Educational Settings",
				questions: [
					{
						id: "cs11",
						question: "How did you support student learning objectives?",
					},
					{
						id: "cs12",
						question:
							"How did you balance interpreting with educational goals?",
					},
					{
						id: "cs13",
						question: "What challenges arose with academic terminology?",
					},
					{
						id: "cs14",
						question: "How did you facilitate parent-teacher communication?",
					},
					{
						id: "cs15",
						question: "How did you support IEP or special education meetings?",
					},
				],
			},
			{
				title: "Mental Health Settings",
				questions: [
					{ id: "cs16", question: "How did you handle therapeutic silence?" },
					{ id: "cs17", question: "How did you convey emotional nuance?" },
					{
						id: "cs18",
						question: "What challenges arose with mental health terminology?",
					},
					{
						id: "cs19",
						question: "How did you maintain boundaries in therapy sessions?",
					},
					{
						id: "cs20",
						question: "How did you manage your own emotional response?",
					},
				],
			},
			{
				title: "Community Settings",
				questions: [
					{
						id: "cs21",
						question: "How did you navigate informal communication styles?",
					},
					{
						id: "cs22",
						question: "How did you handle multiple speakers or group dynamics?",
					},
					{
						id: "cs23",
						question: "What cultural considerations influenced your approach?",
					},
					{
						id: "cs24",
						question: "How did you manage varying literacy levels?",
					},
					{
						id: "cs25",
						question: "How did you facilitate community engagement?",
					},
				],
			},
		],
	},
	skillSpecific: {
		id: "skillSpecific",
		name: "Skill-Specific Sets",
		description: "Targeted reflection on specific interpreting competencies",
		sections: [
			{
				title: "Accuracy & Completeness",
				questions: [
					{
						id: "ss1",
						question: "Were there moments where accuracy was challenging?",
					},
					{
						id: "ss2",
						question: "How did you handle unknown terms or concepts?",
					},
					{
						id: "ss3",
						question: "Did you need to ask for clarification? How?",
					},
					{ id: "ss4", question: "Were there omissions? Why did they occur?" },
					{ id: "ss5", question: "How did you ensure message completeness?" },
				],
			},
			{
				title: "Cultural Mediation",
				questions: [
					{
						id: "ss6",
						question: "What cultural differences required navigation?",
					},
					{
						id: "ss7",
						question: "How did you bridge cultural communication styles?",
					},
					{
						id: "ss8",
						question: "Were there cultural concepts that needed explanation?",
					},
					{
						id: "ss9",
						question: "How did you handle culturally sensitive topics?",
					},
					{ id: "ss10", question: "What cultural assumptions were present?" },
				],
			},
			{
				title: "Professional Boundaries",
				questions: [
					{
						id: "ss11",
						question: "Were boundaries tested? How did you respond?",
					},
					{
						id: "ss12",
						question: "How did you maintain professional distance?",
					},
					{
						id: "ss13",
						question:
							"Were you asked to exceed your role? How did you handle it?",
					},
					{ id: "ss14", question: "How did you manage personal reactions?" },
					{ id: "ss15", question: "What boundary challenges arose?" },
				],
			},
			{
				title: "Communication Management",
				questions: [
					{ id: "ss16", question: "How did you manage communication flow?" },
					{ id: "ss17", question: "How did you handle overlapping speech?" },
					{
						id: "ss18",
						question: "What strategies did you use for long utterances?",
					},
					{ id: "ss19", question: "How did you manage pace and timing?" },
					{ id: "ss20", question: "How did you facilitate turn-taking?" },
				],
			},
			{
				title: "Self-Care & Sustainability",
				questions: [
					{
						id: "ss21",
						question: "What was emotionally challenging about this assignment?",
					},
					{
						id: "ss22",
						question: "How did you manage stress during the session?",
					},
					{ id: "ss23", question: "What self-care strategies did you employ?" },
					{
						id: "ss24",
						question: "How did you prepare mentally and emotionally?",
					},
					{ id: "ss25", question: "What recovery strategies will you use?" },
				],
			},
		],
	},
};
