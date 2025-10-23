import OpenAI from 'openai';

// OpenAIクライアントの遅延初期化
let openai: OpenAI | null = null;

function getOpenAIClient() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// Assistant IDとVector Store IDを環境変数で管理
// Vercel環境変数から読み込む、なければ自動作成
let assistantId: string | null = process.env.OPENAI_ASSISTANT_ID || null;
let vectorStoreId: string | null = process.env.OPENAI_VECTOR_STORE_ID || null;

/**
 * OpenAI Assistantを取得または作成
 */
export async function getOrCreateAssistant() {
  const client = getOpenAIClient();

  if (assistantId) {
    try {
      const assistant = await client.beta.assistants.retrieve(assistantId);
      return assistant;
    } catch (error) {
      console.error('Assistant取得エラー:', error);
      assistantId = null;
    }
  }

  // 新しいAssistantを作成
  const assistant = await client.beta.assistants.create({
    name: 'Liberty Knowledge Assistant',
    instructions: `あなたはLibertyの知識アシスタントです。
ユーザーの質問に対して、提供された知識ベースの情報を使って正確に回答してください。
知識ベースに情報がない場合は、「その情報は知識ベースにありません」と正直に答えてください。
回答は丁寧で分かりやすく、必要に応じて引用元を示してください。`,
    model: 'gpt-4o',
    tools: [{ type: 'file_search' }],
  });

  assistantId = assistant.id;
  console.log('新しいAssistantを作成しました:', assistantId);

  return assistant;
}

/**
 * Vector Storeを取得または作成
 */
export async function getOrCreateVectorStore() {
  const client = getOpenAIClient();

  if (vectorStoreId) {
    try {
      const vectorStore = await client.beta.vectorStores.retrieve(vectorStoreId);
      return vectorStore;
    } catch (error) {
      console.error('Vector Store取得エラー:', error);
      vectorStoreId = null;
    }
  }

  // 新しいVector Storeを作成
  const vectorStore = await client.beta.vectorStores.create({
    name: 'Liberty Knowledge Base',
  });

  vectorStoreId = vectorStore.id;
  console.log('新しいVector Storeを作成しました:', vectorStoreId);

  // AssistantにVector Storeを紐付け
  const assistant = await getOrCreateAssistant();
  await client.beta.assistants.update(assistant.id, {
    tool_resources: {
      file_search: {
        vector_store_ids: [vectorStore.id],
      },
    },
  });

  return vectorStore;
}

/**
 * ファイルをVector Storeにアップロード
 */
export async function uploadFileToVectorStore(file: File) {
  const client = getOpenAIClient();
  const vectorStore = await getOrCreateVectorStore();

  // OpenAIにファイルをアップロード
  const openaiFile = await client.files.create({
    file: file,
    purpose: 'assistants',
  });

  // Vector Storeにファイルを追加
  await client.beta.vectorStores.files.create(vectorStore.id, {
    file_id: openaiFile.id,
  });

  return {
    fileId: openaiFile.id,
    vectorStoreId: vectorStore.id,
    fileName: file.name,
  };
}

/**
 * Vector Store内のファイル一覧を取得
 */
export async function listVectorStoreFiles() {
  const client = getOpenAIClient();
  const vectorStore = await getOrCreateVectorStore();

  const files = await client.beta.vectorStores.files.list(vectorStore.id);

  return files.data;
}

/**
 * Assistantを使ってチャット
 */
export async function chatWithAssistant(
  message: string,
  threadId?: string
): Promise<{
  response: string;
  threadId: string;
  citations: string[];
}> {
  const client = getOpenAIClient();
  const assistant = await getOrCreateAssistant();

  // スレッドを取得または作成
  let thread;
  if (threadId) {
    thread = await client.beta.threads.retrieve(threadId);
  } else {
    thread = await client.beta.threads.create();
  }

  // メッセージを追加
  await client.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: message,
  });

  // 実行
  const run = await client.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  });

  // 完了まで待機
  let runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
  while (runStatus.status !== 'completed') {
    if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
  }

  // レスポンスを取得
  const messages = await client.beta.threads.messages.list(thread.id);
  const lastMessage = messages.data[0];

  let response = '';
  const citations: string[] = [];

  if (lastMessage.content[0].type === 'text') {
    response = lastMessage.content[0].text.value;

    // 引用情報を抽出
    const annotations = lastMessage.content[0].text.annotations;
    for (const annotation of annotations) {
      if (annotation.type === 'file_citation') {
        const fileCitation = annotation.file_citation;
        citations.push(fileCitation.file_id);
      }
    }
  }

  return {
    response,
    threadId: thread.id,
    citations,
  };
}

/**
 * 初期化: 既存のファイルを読み込む
 */
export async function initializeKnowledgeBase() {
  try {
    const assistant = await getOrCreateAssistant();
    const vectorStore = await getOrCreateVectorStore();
    const files = await listVectorStoreFiles();

    console.log(`知識ベースを初期化しました。ファイル数: ${files.length}`);
    console.log(`Assistant ID: ${assistant.id}`);
    console.log(`Vector Store ID: ${vectorStore.id}`);

    return {
      assistantId: assistant.id,
      vectorStoreId: vectorStore.id,
      fileCount: files.length,
    };
  } catch (error) {
    console.error('知識ベース初期化エラー:', error);
    throw error;
  }
}
