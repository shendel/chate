import { OpenAIModel, OpenAIModelID, OpenAIModels } from '@/types';
import { OPENAI_API_HOST } from '@/utils/app/const';

// @ts-ignore
const apiModels = async (options) => {
  try {
    const { key } = options

    const response = await fetch(`${OPENAI_API_HOST}/v1/models`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
    });

    if (response.status === 401) {
      return { error: 401, headers: response.headers }
      /*
      return new Response(response.body, {
        status: 500,
        headers: response.headers,
      });
      */
    } else if (response.status !== 200) {
      console.error(
        `OpenAI API returned an error ${
          response.status
        }: ${await response.text()}`,
      );
      throw new Error('OpenAI API returned an error');
    }

    const json = await response.json();

    const models: OpenAIModel[] = json.data
      .map((model: any) => {
        for (const [key, value] of Object.entries(OpenAIModelID)) {
          if (value === model.id) {
            return {
              id: model.id,
              name: OpenAIModels[value].name,
            };
          }
        }
      })
      .filter(Boolean);

    return {
      ok: true,
      data: models
    }
  } catch (error) {
    console.error(error)
    return { error }
  }
};

export default apiModels
