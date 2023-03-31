import { ChatBody, Message, OpenAIModelID } from '@/types';
import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';
import { OpenAIStream } from '@/utils/server';
import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { init, Tiktoken } from '@dqbd/tiktoken/lite/init';
// @ts-expect-error
import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, messages, key, prompt } = (await req.json()) as ChatBody;

    await init((imports) => WebAssembly.instantiate(wasm, imports));
    const encoding = new Tiktoken(
      tiktokenModel.bpe_ranks,
      tiktokenModel.special_tokens,
      tiktokenModel.pat_str,
    );

    const tokenLimit = model.id === OpenAIModelID.GPT_4 ? 6000 : 3000;

    let promptToSend = prompt;
    if (!promptToSend) {
      promptToSend = DEFAULT_SYSTEM_PROMPT;
    }

    const prompt_tokens = encoding.encode(promptToSend);

    let tokenCount = prompt_tokens.length;
    let messagesToSend: Message[] = [];

    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const tokens = encoding.encode(message.content);

      if (tokenCount + tokens.length > tokenLimit) {
        break;
      }
      tokenCount += tokens.length;
      messagesToSend = [message, ...messagesToSend];
    }

    encoding.free();

    console.log('>>> on chat')
    console.log(model, promptToSend, key, messagesToSend)
    const stream = await OpenAIStream(model, promptToSend, key, messagesToSend);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
};

export const apiChat = async (options) => {
  try {
    const { model, messages, key, prompt } = options as ChatBody;

console.log('>>> messages', messages)
    //await init((imports) => WebAssembly.instantiate(wasm, imports));
    /*
    const encoding = new Tiktoken(
      tiktokenModel.bpe_ranks,
      tiktokenModel.special_tokens,
      tiktokenModel.pat_str,
    );

    const tokenLimit = model.id === OpenAIModelID.GPT_4 ? 6000 : 3000;
*/
    let promptToSend = prompt;
    if (!promptToSend) {
      promptToSend = DEFAULT_SYSTEM_PROMPT;
    }
/*
    const prompt_tokens = encoding.encode(promptToSend);

    let tokenCount = prompt_tokens.length;
    let messagesToSend: Message[] = [];

    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const tokens = encoding.encode(message.content);

      if (tokenCount + tokens.length > tokenLimit) {
        break;
      }
      tokenCount += tokens.length;
      messagesToSend = [message, ...messagesToSend];
    }

    encoding.free();
*/

    let messagesToSend: Message[] = [];
    for (let i = messages.length - 1; i >= 0; i--) {
    
      const message = messages[i];
      /*
      // @to-do check limit
      const tokens = encoding.encode(message.content);

      if (tokenCount + tokens.length > tokenLimit) {
        break;
      }
      tokenCount += tokens.length;
      */
      messagesToSend = [message, ...messagesToSend];
    }
    console.log('>>> on chat')
    console.log(model, promptToSend, key, messagesToSend)
    const stream = await OpenAIStream(model, promptToSend, key, messagesToSend);
    console.log('>>> stream', stream)
    //return new Response(stream)
    return stream
  } catch (error) {
    console.error(error)
    return { error }
  }
};

export default handler;
