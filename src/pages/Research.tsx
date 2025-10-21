import React from "react";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const Research: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-4 px-3 py-2 rounded-lg transition-all hover:bg-opacity-80 no-underline"
            style={{ color: "#6B8268", backgroundColor: "rgba(107, 130, 104, 0.1)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              InterpretReflect™ Research Foundation
            </h1>
          </div>
          <p className="text-gray-600">
            Backed by research from neuroscience, learning science, and emotional intelligence
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why InterpretReflect™ works
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            InterpretReflect™ is built on six foundational insights from cognitive and
            affective neuroscience, learning science, and empirical research on emotional
            intelligence (EI) training in helping professions, along with interpreter-specific
            decision-making frameworks.
          </p>
          <p className="text-gray-700 leading-relaxed">
            This interdisciplinary approach - integrating neuroscience, reflective practice,
            metacognition, and interoceptive awareness - positions InterpretReflect™ at the
            scientific frontier of interpreter wellness and effectiveness.
          </p>
        </div>

        {/* TL;DR Summary */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            TL;DR - Why InterpretReflect™ Works
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <p className="text-gray-800 leading-relaxed">
                <strong>Feelings and thinking are deeply connected:</strong> How you feel shapes
                how you focus, remember, decide, and perform - especially under stress.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <p className="text-gray-800 leading-relaxed">
                <strong>Emotional skills can be built:</strong> You can train self-awareness,
                emotional regulation, and social skills just like any other skill.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <p className="text-gray-800 leading-relaxed">
                <strong>Naming your feelings matters:</strong> The more precisely you can identify
                your emotions ("overwhelmed" vs. "annoyed"), the better you can handle them.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <p className="text-gray-800 leading-relaxed">
                <strong>Interpreters have to make tough decisions, fast:</strong> Our platform
                helps you reflect, regulate, and navigate those moments with proven frameworks.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <p className="text-gray-800 leading-relaxed">
                <strong>Reflecting boosts growth:</strong> Mindful reflection helps you learn
                from experience, adapt, and thrive long-term - not just "be resilient."
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <p className="text-gray-800 leading-relaxed">
                <strong>Awareness of your body and emotions is powerful:</strong> Noticing what's
                happening inside your body keeps your mind clear, focused, and better able to cope,
                even when work gets intense.
              </p>
            </div>
          </div>

          <div className="bg-white/80 rounded-lg p-4 border-l-4 border-green-600">
            <p className="text-gray-900 font-medium leading-relaxed">
              <strong>In short:</strong> InterpretReflect™ combines brain science and practical
              reflection tools so interpreters can handle stress, grow professionally, and make
              better decisions - backed by real science, not just good intentions.
            </p>
          </div>
        </div>

        {/* Six Foundational Insights */}
        <div className="space-y-6 mb-12">
          {/* Insight 1 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">1</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Emotion and cognition work together - not separately
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Decades of research show that emotional and cognitive processes rely on
                  overlapping brain networks, not isolated modules (Pessoa, 2008, 2017;
                  Okon‑Singer et al., 2015). Emotion doesn't just "interrupt" thinking - it
                  actively shapes attention, memory, and decision‑making (Tyng et al.,
                  2017; Pekrun, 2017).
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Stress or burnout disrupts these networks at the exact moment when
                  professionals need mental clarity the most (Markett et al., 2020).
                </p>
              </div>
            </div>
          </div>

          {/* Insight 2 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Emotional intelligence is learnable - and trainable
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  EI is not a fixed trait. Studies confirm that structured training improves
                  self‑awareness, emotional regulation, and interpersonal competence (Bar‑On,
                  2006; Vesely et al., 2023). A 2024 meta‑analysis of healthcare‑sector
                  interventions (Powell et al., 2024) demonstrated increases in emotional
                  intelligence, with particular benefits for stress management and resilience.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  EI training designed for language professionals maps directly to
                  translators/interpreters and improves reflective practice and coping
                  (Hübscher‑Davidson & Lehr, 2021; Ghasemi et al., 2023).
                </p>
              </div>
            </div>
          </div>

          {/* Insight 3 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">3</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Emotional granularity enhances regulation and decision-making
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Emotional granularity (also called emotion differentiation) is the ability
                  to distinguish between similar emotions with precision - for example,
                  recognizing the difference between "frustrated," "anxious," and
                  "overwhelmed" rather than simply feeling "bad" (Barrett et al., 2001;
                  Barrett, 2017).
                </p>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Research consistently shows that higher emotional granularity predicts
                  better outcomes:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li className="text-gray-700 leading-relaxed">
                    <strong>More effective emotion regulation:</strong> People with high
                    granularity use adaptive strategies like reappraisal and problem-solving
                    rather than suppression or avoidance (Barrett et al., 2001; Kalokerinos
                    et al., 2017).
                  </li>
                  <li className="text-gray-700 leading-relaxed">
                    <strong>Reduced mental health symptoms:</strong> Higher negative emotion
                    granularity is associated with fewer symptoms of depression and anxiety
                    (Demiralp et al., 2012; Kashdan et al., 2015).
                  </li>
                  <li className="text-gray-700 leading-relaxed">
                    <strong>Less maladaptive coping:</strong> Individuals high in granularity
                    are less likely to engage in binge drinking, aggression, and
                    self-injurious behavior when distressed (Kashdan et al., 2015).
                  </li>
                  <li className="text-gray-700 leading-relaxed">
                    <strong>Better stress management:</strong> The ability to make
                    fine-grained emotional distinctions enables context-appropriate responses,
                    particularly under pressure (Barrett, 2017; Wilson-Mendenhall & Dunne,
                    2021).
                  </li>
                </ul>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                  <p className="text-gray-800 leading-relaxed">
                    <strong>Why this matters for interpreters:</strong> When interpreters can
                    precisely identify their emotional states ("I'm experiencing cognitive
                    overload" vs. "I'm anxious about making an error" vs. "I'm frustrated
                    with turn-taking dynamics"), they can deploy more targeted regulation
                    strategies and make better real-time decisions during assignments.
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  <strong>How InterpretReflect™ applies this:</strong> The platform's
                  emotion-tracking and reflective prompts function as emotional granularity
                  training. By regularly distinguishing between nuanced emotional states in
                  context, interpreters build the skill of emotional differentiation - which
                  research shows improves both regulation and mental health outcomes (Barrett
                  et al., 2001; Wilson-Mendenhall & Dunne, 2021).
                </p>
              </div>
            </div>
          </div>

          {/* Insight 4 - New section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">4</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Interpreters make complex decisions under pressure - and need frameworks to
                  navigate them
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The <strong>Role-Space Model</strong> (Llewellyn-Jones & Lee, 2013, 2014)
                  reframes interpreter decision-making as a dynamic process across three
                  dimensions:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li className="text-gray-700 leading-relaxed">
                    <strong>Presentation of Self:</strong> The degree to which interpreters
                    communicate their own thoughts rather than solely interpreting content
                    (e.g., introducing themselves, asking for clarification, indicating
                    errors).
                  </li>
                  <li className="text-gray-700 leading-relaxed">
                    <strong>Interaction Management:</strong> How interpreters control
                    turn-taking, manage overlapping speech, and choose between simultaneous
                    or consecutive approaches to optimize communication flow.
                  </li>
                  <li className="text-gray-700 leading-relaxed">
                    <strong>Participant Alignment:</strong> The extent to which interpreters
                    engage with participants through positioning, eye-gaze, facial
                    expression, and relational cues.
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Unlike earlier "conduit" or "invisibility" models, Role-Space recognizes
                  that interpreters are present, active participants whose decisions have
                  real consequences for communication success. The model integrates with{" "}
                  <strong>Demand-Control Schema</strong> (Dean & Pollard, 2001), which maps
                  the environmental, interpersonal, paralinguistic, and intrapersonal demands
                  interpreters face, along with the controls (actions, translation choices,
                  and internal awareness) they can exert.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Why this matters:</strong> Interpreters who understand their
                  decision-making dimensions can better regulate their cognitive and
                  emotional responses under pressure, leading to more ethical, effective, and
                  sustainable practice.
                </p>
              </div>
            </div>
          </div>

          {/* Insight 5 - Learning Science */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">5</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Reflection and metacognition are developmental engines for sustained professional growth
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  A robust body of educational research demonstrates that <strong>reflective practice is a developmental engine for metacognition - thinking about one's own thinking - in complex fields like interpreting</strong>. Reflection is not simply reviewing what happened; it is a structured process for surfacing tacit assumptions, connecting theory to practice, and self-regulating emotional and cognitive states under stress.
                </p>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Reflective activities (journaling, structured prompts) foster three key outcomes:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li className="text-gray-700 leading-relaxed">
                    <strong>Academic learning:</strong> By systematically linking theory and experience, interpreters become more agile learners and adjust strategies in real time.
                  </li>
                  <li className="text-gray-700 leading-relaxed">
                    <strong>Lifelong learning:</strong> Reflection nurtures adaptability and transformative growth, supporting sustained professional engagement and self-directed improvement.
                  </li>
                  <li className="text-gray-700 leading-relaxed">
                    <strong>Skills development:</strong> Reflective writing and dialogue build higher-order cognitive capacities, including emotional self-regulation - critical under assignment pressure.
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Research confirms that <strong>reflection and metacognition are synergistic and reciprocal</strong>; each supports the other to "make formerly unconscious, intangible, or reflexive processes explicit" (Desautel, 2009; Harvey, Coulson & McMaugh, 2016). For interpreters, scaffolded reflective practices directly support self-monitoring, strategic adaptation, and resilience in dynamically charged environments.
                </p>
              </div>
            </div>
          </div>

          {/* Insight 6 - Applied Neuroscience */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">6</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Interoception and emotional awareness form the neural foundation for self-regulation
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Interoception</strong> - the sense of the body's internal signals - plays a core role in emotional awareness and adaptive decision-making, especially for professionals facing high cognitive and affective demands.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Neuroscientific research (Craig, 2009; Farb et al., 2023) shows that the <strong>anterior insular cortex (AIC)</strong> integrates internal bodily signals, forming the neural basis for awareness of emotional and physiological states. This network is not only foundational to subjective feelings, but also to the ability to notice, label, and regulate emotion.
                </p>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Enhanced interoceptive awareness is associated with:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li className="text-gray-700 leading-relaxed">
                    <strong>Greater attention and cognitive flexibility:</strong> Skillful awareness of bodily cues helps interpret and regulate stress/arousal, preserving attentional capacity and memory amidst distraction.
                  </li>
                  <li className="text-gray-700 leading-relaxed">
                    <strong>Improved language and metacognitive networks:</strong> Mindful interoceptive attention (including tracking the breath) correlates with maintained activation in the anterior cingulate and language areas - brain regions responsible for attention, verbalization, and integrating experience under pressure (Farb et al., 2023).
                  </li>
                </ul>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                  <p className="text-gray-800 leading-relaxed">
                    <strong>How InterpretReflect™ applies this:</strong> The platform's body-centered check-ins and emotional labeling directly tap this science: they train interpreters to access and verbalize embodied emotional cues, build "emotional vocabulary," and leverage neurobiological pathways for adaptive coping and resilient performance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How InterpretReflect applies the science - moved to end */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-green-600" />
                How InterpretReflect™ applies the science
              </h3>
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Pre‑ and post‑assignment EI check‑ins</strong> and reflective
                  prompts align with network‑based models of emotion–cognition and learning
                  science to sustain attention, memory, and decision quality under stress.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Emotional granularity training:</strong> Regular emotion tracking
                  helps interpreters build the skill of making fine-grained emotional
                  distinctions, which research shows improves regulation, reduces maladaptive
                  coping, and supports mental health (Barrett et al., 2001; Kashdan et al.,
                  2015; Wilson-Mendenhall & Dunne, 2021).
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Reflective practice for metacognition:</strong> Structured journaling
                  and reflective prompts make formerly unconscious processes explicit, supporting
                  self-monitoring, strategic adaptation, and transformative professional growth
                  (Desautel, 2009; Harvey, Coulson & McMaugh, 2016).
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Interoceptive awareness training:</strong> Body-centered check-ins
                  and emotional labeling train interpreters to access and verbalize embodied
                  emotional cues, leveraging the anterior insular cortex's role in emotional
                  awareness and preserving attention and language networks under pressure
                  (Craig, 2009; Farb et al., 2023).
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Role-Space integration:</strong> Reflective prompts guide
                  interpreters to examine their decisions across the three Role-Space
                  dimensions, building metacognitive awareness of how presentation of self,
                  interaction management, and participant alignment impact communication
                  outcomes.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Demand-Control awareness:</strong> Check-ins help interpreters
                  identify specific demands (environmental, interpersonal, paralinguistic,
                  intrapersonal) and develop adaptive controls to maintain performance
                  quality and reduce burnout risk.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Sources */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key sources</h2>
          <div className="space-y-4">
            {/* Source 1 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Pessoa, L. (2017). A Network Model of the Emotional Brain.{" "}
                <em>Trends in Cognitive Sciences</em>, 21(5), 357-371.
              </p>
              <a
                href="https://doi.org/10.1016/j.tics.2017.03.002"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1"
              >
                https://doi.org/10.1016/j.tics.2017.03.002
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Source 2 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Tyng, C. M., Amin, H. U., Saad, M. N. M., & Malik, A. S. (2017). The
                Influences of Emotion on Learning and Memory.{" "}
                <em>Frontiers in Psychology</em>, 8, 1454.
              </p>
              <a
                href="https://doi.org/10.3389/fpsyg.2017.01454"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1"
              >
                https://doi.org/10.3389/fpsyg.2017.01454
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Source 3 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Markett, S., Montag, C., & Reuter, M. (2020). Specific and segregated
                changes to the functional connectome evoked by the processing of emotional
                faces: A task-based connectome study. <em>Scientific Reports</em>, 10, 4822.
              </p>
              <a
                href="https://doi.org/10.1038/s41598-020-61522-0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1"
              >
                https://doi.org/10.1038/s41598-020-61522-0
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Source 4 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Okon-Singer, H., Hendler, T., Pessoa, L., & Shackman, A. J. (2015). The
                neurobiology of emotion–cognition interactions: fundamental questions and
                strategies for future research.{" "}
                <em>Frontiers in Human Neuroscience</em>, 9, 58.
              </p>
              <div className="space-y-1">
                <a
                  href="https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2015.00058/full"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1 block"
                >
                  https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2015.00058/full
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4344113/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1 block"
                >
                  https://pmc.ncbi.nlm.nih.gov/articles/PMC4344113/
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Source 5 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Pessoa, L. (2008). On the relationship between emotion and cognition.{" "}
                <em>Nature Reviews Neuroscience</em>, 9(2), 148-158.
              </p>
              <a
                href="https://www.semanticscholar.org/paper/On-the-relationship-between-emotion-and-cognition-Pessoa/b750a3cbd9acc0d8ca589df93b515ec06ba19118"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1"
              >
                https://www.semanticscholar.org/paper/On-the-relationship-between-emotion-and-cognition-Pessoa/b750a3cbd9acc0d8ca589df93b515ec06ba19118
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Source 6 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Pekrun, R. (2017). Emotion and Achievement During Adolescence.{" "}
                <em>Child Development Perspectives</em>, 11(3), 215-221.
              </p>
              <a
                href="https://srcd.onlinelibrary.wiley.com/doi/abs/10.1111/cdep.12237"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1"
              >
                https://srcd.onlinelibrary.wiley.com/doi/abs/10.1111/cdep.12237
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Source 7 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Bar‑On, R. (2006). The Bar-On model of emotional-social intelligence (ESI).{" "}
                <em>Psicothema</em>, 18(Suppl), 13-25.
              </p>
              <a
                href="https://reunido.uniovi.es/index.php/PST/article/view/8415"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1"
              >
                https://reunido.uniovi.es/index.php/PST/article/view/8415
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Source 8 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Ghasemi, S., Janani, L., Mardani-Hamooleh, M., & Kohan, S. (2023). The
                Beneficial Effects of Emotional Intelligence Training for Critical Care
                Nurses: A Quasi-Experimental Study.{" "}
                <em>Iranian Journal of Nursing and Midwifery Research</em>, 28(3), 357-362.
              </p>
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/37575498/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1"
              >
                https://pubmed.ncbi.nlm.nih.gov/37575498/
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Source 9 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Powell, C., Brown, T., Yap, Y., Hallam, K., Takac, M., Quinlivan, T.,
                Xenos, S., & Karimi, L. (2024). Emotional intelligence training among the
                healthcare workforce: a systematic review and meta-analysis.{" "}
                <em>Frontiers in Psychology</em>, 15, 1437035.
              </p>
              <div className="space-y-1">
                <a
                  href="https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1437035/full"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1 block"
                >
                  https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1437035/full
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11614651/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1 block"
                >
                  https://pmc.ncbi.nlm.nih.gov/articles/PMC11614651/
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Source 10 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Vesely, A. K., Saklofske, D. H., & Nordstokke, D. W. (2023). Development
                and validation of an online emotional intelligence training program.{" "}
                <em>Frontiers in Psychology</em>, 14, 1221817.
              </p>
              <div className="space-y-1">
                <a
                  href="https://www.frontiersin.org/articles/10.3389/fpsyg.2023.1221817/pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1 block"
                >
                  https://www.frontiersin.org/articles/10.3389/fpsyg.2023.1221817/pdf
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1221817/full"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1 block"
                >
                  https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1221817/full
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Source 11 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Hübscher-Davidson, S., & Lehr, C. (2021). <em>Improving the Emotional Intelligence
                of Translators: A Roadmap for an Experimental Training Intervention</em>.
                Palgrave Macmillan.
              </p>
              <div className="space-y-1">
                <a
                  href="https://www.jostrans.soap2.ch/issue40/rev_hubscher.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1 block"
                >
                  Book review: https://www.jostrans.soap2.ch/issue40/rev_hubscher.php
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://oro.open.ac.uk/81641/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1 block"
                >
                  Full text information: https://oro.open.ac.uk/81641/
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Source 12 - Barrett et al. 2001 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Barrett, L. F., Gross, J. J., Christensen, T. C., & Benvenuto, M. (2001).
                Knowing what you're feeling and knowing what to do about it: Mapping the
                relation between emotion differentiation and emotion regulation.{" "}
                <em>Cognition and Emotion</em>, 15(6), 713-724.
              </p>
              <div className="space-y-1">
                <a
                  href="https://www.tandfonline.com/doi/abs/10.1080/02699930143000239"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1 block"
                >
                  https://www.tandfonline.com/doi/abs/10.1080/02699930143000239
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://affective-science.org/pubs/2001/01MaprelationDiffReg.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1 block"
                >
                  https://affective-science.org/pubs/2001/01MaprelationDiffReg.pdf
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Source 13 - Barrett 2017 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Barrett, L. F. (2017). <em>How Emotions Are Made: The Secret Life of the
                Brain</em>. Houghton Mifflin Harcourt.
              </p>
              <a
                href="https://lisafeldmanbarrett.com/books/how-emotions-are-made/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1"
              >
                https://lisafeldmanbarrett.com/books/how-emotions-are-made/
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Source 14 - Demiralp et al. */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Demiralp, E., Thompson, R. J., Mata, J., Jaeggi, S. M., Buschkuehl, M.,
                Barrett, L. F., Ellsworth, P. C., Demiralp, M., Hernandez-Garcia, L.,
                Deldin, P. J., Gotlib, I. H., & Jonides, J. (2012). Feeling blue or
                turquoise? Emotional differentiation in major depressive disorder.{" "}
                <em>Psychological Science</em>, 23(11), 1410-1416.
              </p>
              <div className="space-y-1">
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/23070307/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1 block"
                >
                  https://pubmed.ncbi.nlm.nih.gov/23070307/
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://affective-science.org/pubs/2012/demiralp-et-al-2012.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1 block"
                >
                  https://affective-science.org/pubs/2012/demiralp-et-al-2012.pdf
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Source 15 - Kashdan et al. */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Kashdan, T. B., Barrett, L. F., & McKnight, P. E. (2015). Unpacking emotion
                differentiation: Transforming unpleasant experience by perceiving
                distinctions in negativity. <em>Current Directions in Psychological
                Science</em>, 24(1), 10-16.
              </p>
              <a
                href="https://affective-science.org/pubs/2015/kashdan-et-all-unpacking-emotion-differentiation-2015.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1"
              >
                https://affective-science.org/pubs/2015/kashdan-et-all-unpacking-emotion-differentiation-2015.pdf
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Source 16 - Kalokerinos et al. */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Kalokerinos, E. K., Résibois, M., Verduyn, P., & Kuppens, P. (2017). The
                temporal deployment of emotion regulation strategies during negative
                emotional episodes. <em>Emotion</em>, 17(3), 450-458.
              </p>
              <p className="text-sm text-gray-600">
                DOI: 10.1037/emo0000248
              </p>
            </div>

            {/* Source 17 - Wilson-Mendenhall & Dunne */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Wilson-Mendenhall, C. D., & Dunne, J. D. (2021). Cultivating emotional
                granularity. <em>Frontiers in Psychology</em>, 12, 703658.
              </p>
              <a
                href="https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.703658/full"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1"
              >
                https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.703658/full
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Source 18 - Dean & Pollard */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Dean, R. K., & Pollard, R. Q. (2001). Application of Demand-Control Theory
                to Sign Language Interpreting: Implications for stress and interpreter
                training. <em>Journal of Deaf Studies and Deaf Education</em>, 6(1), 1-14.
              </p>
              <a
                href="https://academic.oup.com/jdsde/article/6/1/1/430135"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1"
              >
                https://academic.oup.com/jdsde/article/6/1/1/430135
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Source 19 - Llewellyn-Jones & Lee 2013 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Llewellyn-Jones, P., & Lee, R. G. (2013). Getting to the Core of Role:
                Defining Interpreters' Role-Space. <em>International Journal of Interpreter
                Education</em>, 5(2), 54-72.
              </p>
              <a
                href="https://open.clemson.edu/ijie/vol5/iss2/5/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1"
              >
                https://open.clemson.edu/ijie/vol5/iss2/5/
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Source 20 - Llewellyn-Jones & Lee 2014 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Llewellyn-Jones, P., & Lee, R. G. (2014). <em>Redefining the Role of the
                Community Interpreter: The Concept of Role-Space</em>. SLI Press.
              </p>
            </div>

            {/* Source 21 - Harvey et al. 2016 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Harvey, M., Coulson, D., & McMaugh, A. (2016). Towards a theory of the
                ecology of reflection: reflective practice for experiential learning in
                higher education. <em>Reflective Practice</em>, 17(5), 505-524.
              </p>
              <a
                href="https://www.improvewithmetacognition.com/reflection-for-learning-and-metacognitive-development/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1"
              >
                Related resource: Reflection for Learning and Metacognitive Development
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Source 22 - Desautel 2009 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Desautel, D. (2009). Becoming a thinking thinker: Metacognition,
                self-reflection, and classroom practice. <em>Teachers College Record</em>,
                111(8), 1997-2020.
              </p>
              <a
                href="https://citsl.org/the-key-role-of-metacognition/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1"
              >
                Related resource: The Key Role of Metacognition
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Source 23 - Craig 2009 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Craig, A. D. (2009). How do you feel - now? The anterior insula and human
                awareness. <em>Nature Reviews Neuroscience</em>, 10(1), 59-70.
              </p>
              <div className="space-y-1">
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/19096369/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1 block"
                >
                  https://pubmed.ncbi.nlm.nih.gov/19096369/
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://www.nature.com/articles/nrn2555"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1 block"
                >
                  https://www.nature.com/articles/nrn2555
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Source 24 - Farb et al. 2023 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-900 font-medium mb-1">
                Farb, N. A. S., et al. (2023). Interoceptive Awareness of the Breath Preserves
                Attention and Language Networks amidst Widespread Cortical Deactivation.
                <em>NeuroImage</em>, 277, 120254.
              </p>
              <a
                href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10295813/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1"
              >
                https://pmc.ncbi.nlm.nih.gov/articles/PMC10295813/
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <p className="text-gray-500 text-sm mt-8 italic">
            Last updated: October 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default Research;
