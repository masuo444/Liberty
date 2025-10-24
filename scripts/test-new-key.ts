// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('Testing new Supabase key...\n');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey?.length);
console.log('');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, display_name')
      .limit(5);

    if (error) {
      console.error('❌ エラー:', error);
      process.exit(1);
    }

    console.log('✅ 接続成功！');
    console.log(`取得した企業数: ${data?.length || 0}`);

    if (data && data.length > 0) {
      console.log('\n企業リスト:');
      data.forEach((company) => {
        console.log(`  - ${company.display_name} (${company.name})`);
      });
    }
  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
    process.exit(1);
  }
}

testConnection();
