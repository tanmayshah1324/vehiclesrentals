const { createSupabaseContext } = require('@supabase/server');

const withSupabase = (config) => async (req, res, next) => {
  try {
    // Convert Express request to standard Web Request
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost';
    const url = `${protocol}://${host}${req.originalUrl}`;
    
    // Convert headers to a standard Headers object or plain record
    // req.headers is a plain object in Express
    const init = {
      method: req.method,
      headers: req.headers,
    };
    
    // Only add body for methods that allow it
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
      init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const webReq = new Request(url, init);

    // Provide ws transport if running in Node < 22
    let mergedConfig = config || {};
    if (typeof WebSocket === 'undefined') {
      const WebSocketClass = require('ws');
      mergedConfig = {
        ...mergedConfig,
        supabaseOptions: {
          ...(mergedConfig.supabaseOptions || {}),
          realtime: {
            transport: WebSocketClass,
            ...((mergedConfig.supabaseOptions || {}).realtime || {})
          }
        }
      };
    }

    // Generate context
    const { data: ctx, error } = await createSupabaseContext(webReq, mergedConfig);

    if (error) {
      return res.status(error.status || 401).json({ error: error.message });
    }

    // Inject context into Express req
    req.ctx = ctx;
    next();
  } catch (err) {
    console.error('[Supabase Middleware] Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { withSupabase };
