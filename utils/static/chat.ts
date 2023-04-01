import { ChatBody, Message, OpenAIModelID } from '@/types';
import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';
import { OpenAIStream } from '@/utils/static';

// @ts-ignore
const apiChat = async (options) => {
  try {
    const { model, messages, key, prompt } = options as ChatBody;

    let promptToSend = prompt;
    if (!promptToSend) {
      promptToSend = DEFAULT_SYSTEM_PROMPT;
    }

    let messagesToSend: Message[] = [];
    for (let i = messages.length - 1; i >= 0; i--) {
    
      const message = messages[i];
      messagesToSend = [message, ...messagesToSend];
    }
    const stream = await OpenAIStream(model, promptToSend, key, messagesToSend);
    return stream
  } catch (error) {
    console.error(error)
    return { error }
  }
};

export default apiChat
