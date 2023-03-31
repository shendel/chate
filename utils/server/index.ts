import { Message, OpenAIModel } from '@/types';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';
import { OPENAI_API_HOST } from '../app/const';

export const OpenAIStream = async (
  model: OpenAIModel,
  systemPrompt: string,
  key: string,
  messages: Message[],
) => {
  const res = await fetch(`${OPENAI_API_HOST}/v1/chat/completions`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key ? key : process.env.OPENAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model: model.id,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: 1,
      stream: true,
    }),
  });

  //console.log('>>> res', res)
  //console.log('>>> res.json', await res.text())
  if (res.status !== 200) {
    const statusText = res.statusText;
    throw new Error(`OpenAI API returned an error: ${statusText}`);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const answer = await res.text()
  console.log('>> answer', answer)
  const chunks = answer.split(/\r?\n/)
  const stream = new ReadableStream({
    async start(controller) {
      /*
      // Server side
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;

          if (data === '[DONE]') {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);
console.log('>>> res.body', res.body)
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
      */
      // static
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        console.log('>>> onParse event', event)
        if (event.type === 'event') {
          const data = event.data;

          if (data === '[DONE]') {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);
      //console.log('>>> res.body', res.text(), res.body)
      //const text = await res.text()
      //console.log(text)
      for await (const chunk of chunks as any) {
        if (chunk != '') {
          console.log('>>> chunk >> ', chunk)
          const chunkData = chunk.substring(` data:`.length)
          console.log('>>> chunkData', chunkData)
          if (chunkData === '[DONE]') {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(chunkData);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
          //parser.feed(chunk);
        }
      }
      
    },
  });

  return stream;
};
