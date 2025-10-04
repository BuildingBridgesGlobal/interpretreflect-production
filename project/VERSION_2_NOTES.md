# Version 2 Enhancement Notes

## Elya AI Integration Improvements

### Current State (V1)

- Elya reads reflection data via `get_user_context_for_elya()` function
- One-way data flow: Reflections → Elya context
- Elya conversations stored separately in `elya_conversations` table
- Connected to Agentic flow for richer conversations
- User context automatically updated from reflections

### Proposed V2 Enhancements

#### Bi-directional Data Flow

- **Elya writes back to reflection stats**
  - Conversations containing emotional/wellness data could automatically update metrics
  - Treat certain AI conversations as "micro-reflections"
  - Create new `entry_kind`: 'elya_insight' or 'ai_conversation_reflection'

#### Feedback Loop Integration

- **Elya insights influence burnout predictions**
  - AI-detected patterns feed into burnout assessment algorithms
  - Elya's emotional assessments update wellness metrics
  - Real-time stress detection during conversations

#### Enhanced Context Building

- **Conversation-driven metrics**
  - Extract stress indicators from conversation tone/content
  - Update confidence scores based on discussion topics
  - Track emotional progression throughout conversations

#### Data Architecture Considerations

- Maintain clean separation between conversation and reflection data
- Use event-driven updates to avoid tight coupling
- Consider privacy implications of auto-extracting conversation data
- Implement user consent/control over AI-driven data collection

#### Technical Implementation Notes

- Extend `reflectionService.ts` to handle AI-generated entries
- Add trigger on `elya_conversations` to extract wellness indicators
- Create new service: `conversationMetricsService.ts`
- Update `wellnessMetricsService.ts` to accept AI-sourced data

### Priority: POST-LAUNCH

Focus on V1 stability and user adoption before implementing these enhancements.

---

_Created: 2025-09-22_
