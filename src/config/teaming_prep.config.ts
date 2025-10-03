// teaming_prep.config.ts
export const TEAMING_PREP = {
  id: "teaming_prep",
  title: "Teaming Prep: Get In Sync, Get In Flow",
  subtitle:
    "Lock in focus and teamwork before you step in. When interpreters prep together, the nervous system is calmer, performance is sharper, and stress is lighter every time.",
  subtext: "For interpreter teams of all languages, modalities, and settings.",
  sections: [
    {
      id: "readiness",
      kind: "sliders+text",
      title: "1. Team Readiness Check",
      promptMain:
        "On a scale of 0 to 10, how focused do you feel right now? How about your teammate?",
      hint: "Quick sliders = quick insight.",
      fields: [
        { id: "self_focus", type: "slider", min: 0, max: 10, step: 1, label: "My focus (0 to 10)" },
        { id: "partner_focus", type: "slider", min: 0, max: 10, step: 1, label: "Teammate focus (0 to 10)" },
        { id: "one_word_feeling", type: "text", label: "One word for how you feel heading in", maxLength: 30, ariaLabel: "Emotion word" }
      ],
      microcopy: "Naming emotions makes them easier to manage."
    },
    {
      id: "signal_plan",
      kind: "choice+text",
      title: "2. Signal Plan",
      promptMain:
        "What's your go signal? (Tap, glance, pause, key phrase?)",
      hint: "Pick from options or type your own so you both know before it matters.",
      fields: [
        {
          id: "signal_type",
          type: "select",
          label: "Go signal",
          options: ["Tap", "Glance", "Pause", "Key phrase", "Other"]
        },
        { id: "signal_custom", type: "text", label: "If Other, describe", maxLength: 80 }
      ]
    },
    {
      id: "anticipate_adapt",
      kind: "multichoice+choice",
      title: "3. Anticipate & Adapt",
      promptMain: "Any tricky content, emotional cues, or logistics ahead?",
      checklist: {
        id: "stressors",
        label: "Select all that apply",
        options: [
          "Vocab",
          "Trauma",
          "Cultural nuance",
          "Fast/unclear speaker",
          "Handoff complexity"
        ]
      },
      fallbackPlan: {
        id: "plan_if_sideways",
        label: "If things go sideways...",
        options: ["Pause + breathe", "Swap signal", "Quick teammate check-in"]
      },
      hint: "Choose now. Adapt easier later."
    },
    {
      id: "visualization",
      kind: "action_check",
      title: "4. Mini Visualization",
      promptMain:
        "Soften your gaze: picture you and your teammate handling a tough moment with calm handoff and clear focus.",
      confirmField: {
        id: "viz_done",
        type: "radio",
        options: ["Done!"]
      },
      microcopy:
        "Neuroscience: visualization activates the same brain pathways as real practice."
    },
    {
      id: "micro_intention",
      kind: "textarea",
      title: "5. Micro-Intention",
      promptMain: "Finish this sentence:",
      stem: "Today, I'll be a teammate who...",
      placeholder:
        "backs up my partner; calls a reset when needed; keeps things calm",
      maxLength: 140,
      affirmation:
        "Team affirmation: I am present, my partner is present, and together we are enough for this task."
    }
  ],
  closing: {
    headline: "Teaming mindset set. Let's do this together.",
    sub:
      "Over time, you'll see patterns in your readiness, stressors, and teamwork focus. Small rituals, big growth."
  }
} as const;