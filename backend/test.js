require('dotenv').config();
const { withSupabase } = require('./middleware/supabase');
const req = {
  protocol: 'http',
  get: () => 'localhost:3001',
  originalUrl: '/vehicles',
  method: 'GET',
  headers: {}
};
const res = {
  status: (s) => { console.log('status', s); return res; },
  json: (j) => { console.log('json', j); return res; }
};
const next = () => { console.log('next called', req.ctx); };

withSupabase({ auth: 'none' })(req, res, next).then(() => console.log('done')).catch(console.error);
