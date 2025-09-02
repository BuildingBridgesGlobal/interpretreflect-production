# AI Integration for Chat with Elya

## Overview
Chat with Elya now supports real AI integration through OpenAI's API, while maintaining excellent fallback functionality with tailored simulated responses for healthcare interpreters.

## Features
- **Flexible AI Provider**: Choose between OpenAI API or high-quality simulated responses
- **Context-Aware Conversations**: Maintains conversation history for coherent interactions
- **Specialized for Healthcare Interpreters**: Custom system prompt and responses focused on burnout prevention
- **Automatic Fallback**: Seamlessly falls back to simulated responses if API fails
- **Privacy-First**: All conversations are processed locally or through your own API key

## Configuration

### Option 1: Using Simulated Responses (Default)
No configuration needed! The app comes with sophisticated simulated responses specifically designed for healthcare interpreters dealing with:
- Stress and overwhelm
- Vicarious trauma
- Professional isolation
- Moral distress
- Burnout symptoms

### Option 2: Using OpenAI API
1. Copy `.env.example` to `.env`
2. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
3. Update your `.env` file:
```env
REACT_APP_AI_PROVIDER=openai
REACT_APP_OPENAI_API_KEY=your-api-key-here
REACT_APP_AI_MODEL=gpt-3.5-turbo  # or gpt-4 for enhanced responses
```
4. Restart the development server

## How It Works

### AI Service Architecture
The `aiService` (located in `src/services/aiService.ts`) handles all AI interactions:

1. **Conversation Management**: Maintains conversation history for context
2. **API Integration**: Handles OpenAI API calls with proper error handling
3. **Fallback Logic**: Automatically uses simulated responses if API fails
4. **Response Quality**: Both API and simulated responses are tailored for interpreter wellbeing

### System Prompt
The AI is configured with a specialized system prompt that makes Elya:
- Compassionate and understanding
- Knowledgeable about interpreter challenges
- Focused on practical, evidence-based support
- Aware of vicarious trauma and moral distress
- Encouraging without being dismissive

## Simulated Response Categories
The fallback system recognizes and responds appropriately to:
- **Stress & Overwhelm**: Offers breathing exercises and coping strategies
- **Trauma & Difficult Experiences**: Validates feelings and suggests processing techniques
- **Burnout & Exhaustion**: Recognizes signs and encourages self-care
- **Isolation & Loneliness**: Addresses professional isolation common in interpretation
- **Mistakes & Errors**: Provides self-compassion and learning perspectives
- **General Support Needs**: Offers various forms of assistance

## Cost Considerations
- **Simulated Mode**: Free, no API costs
- **OpenAI GPT-3.5-turbo**: ~$0.002 per conversation
- **OpenAI GPT-4**: ~$0.03 per conversation

## Privacy & Security
- **Local Processing**: Simulated responses are generated locally
- **API Security**: OpenAI API key is never exposed to users
- **No Data Storage**: Conversations are not permanently stored
- **Session-Only**: Chat history clears when you close the app

## Troubleshooting

### API Not Working?
1. Check your API key is correctly set in `.env`
2. Verify you have API credits on your OpenAI account
3. Check browser console for specific error messages
4. App will automatically use simulated responses as fallback

### Want Better Responses?
- Try GPT-4 model for more nuanced responses
- The simulated responses are continuously being improved
- Provide feedback for specific scenarios you'd like addressed

## Future Enhancements
- Support for additional AI providers (Anthropic Claude, Google Gemini)
- Fine-tuned models specifically for healthcare interpretation
- Conversation export and analysis features
- Multi-language support for international interpreters

## Contributing
To improve the AI responses:
1. Add new response patterns in `getSimulatedResponse()` method
2. Update the system prompt for better context
3. Test with various interpreter scenarios
4. Submit pull requests with improvements

## Support
If you encounter issues or have suggestions:
- Check the browser console for error messages
- Verify environment variables are set correctly
- The app works perfectly without API configuration
- Report issues in the project repository