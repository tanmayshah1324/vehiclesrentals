require('dotenv').config({ path: __dirname + '/.env' });
const { createSupabaseContext } = require('@supabase/server');

async function run() {
  const req = new Request('http://localhost:3001/vehicles');
  const { data, error } = await createSupabaseContext(req, { 
    auth: 'none',
    supabaseOptions: {
      realtime: { transport: require('ws') }
    }
  });
  if (error) console.log('ERROR:', error, error.cause);
  else console.log('DATA:', Object.keys(data));
}
run();
