const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Custom login route
server.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = router.db; // lowdb instance
  const user = db.get('users').find({ email, password }).value();

  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.jsonp({
      user: userWithoutPassword,
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(7)
    });
  } else {
    res.status(401).jsonp({
      error: "Invalid email or password"
    });
  }
});

// Custom signup route
server.post('/signup', (req, res) => {
  const { email, password, name } = req.body;
  const db = router.db;
  const userExists = db.get('users').find({ email }).value();

  if (userExists) {
    res.status(400).jsonp({
      error: "User already exists"
    });
  } else {
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      role: 'user'
    };
    db.get('users').push(newUser).write();
    const { password: p, ...userWithoutPassword } = newUser;
    res.jsonp({
      user: userWithoutPassword,
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(7)
    });
  }
});

// UPI Payment simulation endpoint
server.post('/simulate-upi-payment', (req, res) => {
  const { amount, upiId } = req.body;
  // Simulate network delay
  setTimeout(() => {
    res.jsonp({
      status: 'success',
      transactionId: 'TXN' + Date.now(),
      message: 'Payment of ₹' + amount + ' received successfully'
    });
  }, 2000);
});

server.use(router);
server.listen(3001, () => {
  console.log('JSON Server is running on port 3001');
});
