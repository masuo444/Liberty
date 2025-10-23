// @ts-nocheck
import OpenAI from 'openai';
import { retryWithBackoff, isRetryableError } from './utils/retry';

// OpenAIクライアントの遅延初期化
let openai: OpenAI | null = null;

export function getOpenAIClient() {
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

// グローバルAssistant（全企業共通）
let sharedAssistantId: string | null = process.env.OPENAI_ASSISTANT_ID || null;

// レガシーVector Store ID（Supabaseなしの場合に使用）
let legacyVectorStoreId: string | null = process.env.OPENAI_VECTOR_STORE_ID || null;

/**
 * Supabaseが有効かどうかをチェック
 */
function isSupabaseEnabled(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * 企業のVector Store IDを取得（Supabaseから）
 */
async function getCompanyVectorStoreId(companyId: string): Promise<string | null> {
  if (!isSupabaseEnabled()) {
    return null;
  }

  try {
    const { getSupabaseAdminClient } = await import('./supabase/client');
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('companies')
      .select('openai_vector_store_id')
      .eq('id', companyId)
      .single();

    if (error || !data) {
      console.error('企業のVector Store ID取得エラー:', error);
      return null;
    }

    return data.openai_vector_store_id;
  } catch (error) {
    console.error('Supabase接続エラー:', error);
    return null;
  }
}

/**
 * 企業のVector Store IDを保存（Supabaseに）
 */
async function saveCompanyVectorStoreId(companyId: string, vectorStoreId: string) {
  if (!isSupabaseEnabled()) {
    console.warn('Supabase未設定のため、Vector Store IDを保存できません');
    return;
  }

  try {
    const { getSupabaseAdminClient } = await import('./supabase/client');
    const supabase = getSupabaseAdminClient();

    const { error } = await supabase
      .from('companies')
      .update({ openai_vector_store_id: vectorStoreId })
      .eq('id', companyId);

    if (error) {
      console.error('企業のVector Store ID保存エラー:', error);
      throw new Error('Vector Store IDの保存に失敗しました');
    }
  } catch (error) {
    console.error('Supabase接続エラー:', error);
  }
}

/**
 * OpenAI Assistantを取得または作成（全企業共通）
 */
export async function getOrCreateAssistant() {
  const client = getOpenAIClient();

  if (sharedAssistantId) {
    try {
      const assistant = await client.beta.assistants.retrieve(sharedAssistantId);
      return assistant;
    } catch (error) {
      console.error('Assistant取得エラー:', error);
      sharedAssistantId = null;
    }
  }

  // 新しいAssistantを作成
  const assistant = await client.beta.assistants.create({
    name: 'Liberty Knowledge Assistant',
    instructions: `あなたはLibertyの知識アシスタントです。
ユーザーの質問に対して、提供された知識ベースの情報を使って正確に回答してください。
知識ベースに情報がない場合は、「その情報は知識ベースにありません」と正直に答えてください。
回答は簡潔で分かりやすく、2-3文で要点を伝えてください。必要に応じて引用元を示してください。`,
    model: 'gpt-4o-mini', // gpt-4oより高速・低コスト
    tools: [{ type: 'file_search' }],
  });

  sharedAssistantId = assistant.id;
  console.log('新しいAssistantを作成しました:', sharedAssistantId);

  return assistant;
}

/**
 * Vector Storeを取得または作成（企業別またはレガシー）
 */
export async function getOrCreateVectorStore(companyId?: string) {
  const client = getOpenAIClient();

  // 企業IDが指定されている場合は企業別Vector Storeを使用
  if (companyId && isSupabaseEnabled()) {
    const existingVectorStoreId = await getCompanyVectorStoreId(companyId);

    if (existingVectorStoreId) {
      try {
        const vectorStore = await client.beta.vectorStores.retrieve(existingVectorStoreId);
        return vectorStore;
      } catch (error) {
        console.error('Vector Store取得エラー:', error);
      }
    }

    // 新しいVector Storeを作成
    const vectorStore = await client.beta.vectorStores.create({
      name: `Liberty Knowledge Base - Company ${companyId}`,
    });

    console.log('新しいVector Storeを作成しました:', vectorStore.id);

    // SupabaseにVector Store IDを保存
    await saveCompanyVectorStoreId(companyId, vectorStore.id);

    // AssistantにVector Storeを紐付け
    const assistant = await getOrCreateAssistant();
    const currentAssistant = await client.beta.assistants.retrieve(assistant.id);
    const existingVectorStoreIds = currentAssistant.tool_resources?.file_search?.vector_store_ids || [];

    await client.beta.assistants.update(assistant.id, {
      tool_resources: {
        file_search: {
          vector_store_ids: [...existingVectorStoreIds, vectorStore.id],
        },
      },
    });

    return vectorStore;
  }

  // レガシーモード: 環境変数からVector Store IDを取得
  if (legacyVectorStoreId) {
    try {
      const vectorStore = await client.beta.vectorStores.retrieve(legacyVectorStoreId);
      return vectorStore;
    } catch (error) {
      console.error('Vector Store取得エラー:', error);
      legacyVectorStoreId = null;
    }
  }

  // 新しいVector Storeを作成（レガシー）
  const vectorStore = await client.beta.vectorStores.create({
    name: 'Liberty Knowledge Base',
  });

  legacyVectorStoreId = vectorStore.id;
  console.log('新しいVector Storeを作成しました:', vectorStore.id);

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
export async function uploadFileToVectorStore(file: File, companyId?: string) {
  const client = getOpenAIClient();
  const vectorStore = await getOrCreateVectorStore(companyId);

  // OpenAIにファイルをアップロード（再試行あり）
  const openaiFile = await retryWithBackoff(
    () => client.files.create({
      file: file,
      purpose: 'assistants',
    }),
    {
      maxRetries: 3,
      onRetry: (error, attempt) => {
        console.log(`ファイルアップロード再試行 (${attempt}/3):`, error.message);
      },
    }
  );

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
export async function listVectorStoreFiles(companyId?: string) {
  const client = getOpenAIClient();
  const vectorStore = await getOrCreateVectorStore(companyId);

  const vectorStoreFiles = await client.beta.vectorStores.files.list(vectorStore.id);

  // 各ファイルの詳細情報を取得してファイル名を含める
  const filesWithDetails = await Promise.all(
    vectorStoreFiles.data.map(async (vectorFile) => {
      try {
        const fileDetails = await client.files.retrieve(vectorFile.id);
        return {
          id: vectorFile.id,
          status: vectorFile.status,
          created_at: vectorFile.created_at,
          filename: fileDetails.filename,
        };
      } catch (error) {
        console.error(`ファイル詳細取得エラー (${vectorFile.id}):`, error);
        return {
          id: vectorFile.id,
          status: vectorFile.status,
          created_at: vectorFile.created_at,
          filename: 'Unknown',
        };
      }
    })
  );

  return filesWithDetails;
}

/**
 * ファイルを削除（Vector Storeから）
 */
export async function deleteFileFromVectorStore(fileId: string, companyId?: string) {
  const client = getOpenAIClient();
  const vectorStore = await getOrCreateVectorStore(companyId);

  // Vector Storeからファイルを削除
  await client.beta.vectorStores.files.del(vectorStore.id, fileId);

  // OpenAIからファイルを削除
  await client.files.del(fileId);
}

/**
 * Assistantを使ってチャット
 */
export async function chatWithAssistant(
  message: string,
  companyId?: string,
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

  // 実行（企業別Vector Storeを指定）（再試行あり）
  const vectorStore = await getOrCreateVectorStore(companyId);
  const run = await retryWithBackoff(
    () => client.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStore.id],
        },
      },
    }),
    {
      maxRetries: 3,
      onRetry: (error, attempt) => {
        console.log(`チャット実行再試行 (${attempt}/3):`, error.message);
      },
    }
  );

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
 * 初期化: 知識ベースを読み込む
 */
export async function initializeKnowledgeBase(companyId?: string) {
  try {
    const assistant = await getOrCreateAssistant();
    const vectorStore = await getOrCreateVectorStore(companyId);
    const files = await listVectorStoreFiles(companyId);

    const companyInfo = companyId ? `（企業ID: ${companyId}）` : '';
    console.log(`知識ベースを初期化しました${companyInfo}。ファイル数: ${files.length}`);
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
