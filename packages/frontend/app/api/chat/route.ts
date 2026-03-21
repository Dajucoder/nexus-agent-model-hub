import { NextRequest } from 'next/server';
import { modelCatalog } from '../../../lib/model-data';

function findModel(id: string) {
  return modelCatalog.find((model) => model.id === id || model.slug === id);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const model = findModel(String(body.modelId ?? ''));
  const prompt = String(body.prompt ?? '');

  if (!model || prompt.trim().length === 0) {
    return new Response('invalid request', { status: 400 });
  }

  const encoder = new TextEncoder();
  const text = [
    `你当前正在使用 ${model.name} 的融合演示模式。`,
    `这个项目已经把原来的模型百科站和现在的多租户 Agent 平台合并为一个根目录项目。`,
    `你输入的内容是：${prompt}`,
    `如果接入真实 API Key 与供应商端点，这里可以替换为真正的流式模型响应。`
  ].join('\n');

  const stream = new ReadableStream({
    start(controller) {
      const pieces = text.split('');
      let index = 0;
      const timer = setInterval(() => {
        if (index >= pieces.length) {
          clearInterval(timer);
          controller.close();
          return;
        }
        controller.enqueue(encoder.encode(pieces[index]));
        index += 1;
      }, 8);
      return () => clearInterval(timer);
    },
    cancel() {
      return;
    }
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-cache'
    }
  });
}
