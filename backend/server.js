const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '69409204',
  database: 'iwb_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email', // Replace with real SMTP service in production
  port: 587,
  auth: {
    user: 'your-test-email@ethereal.email', // Replace with real credentials
    pass: 'your-test-password'
  }
});

// JWT secret
const JWT_SECRET = 'your_jwt_secret'; // Replace with a secure secret in production

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. Please sign in.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Sign Up
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Store plain-text password (not recommended for production)
    await pool.promise().query(
      'INSERT INTO customers (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    res.json({ success: true, message: 'Account created successfully. Please sign in.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account. Email may already exist.' });
  }
});

// Sign In
app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [rows] = await pool.promise().query('SELECT * FROM customers WHERE email = ?', [email]);
    const user = rows[0];
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

// Enhanced word similarity function
const calculateSimilarity = (message, prevMessage) => {
  const stopWords = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with']);
  
  const preprocess = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  };

  const words1 = preprocess(message);
  const words2 = preprocess(prevMessage);

  if (words1.length === 0 || words2.length === 0) return 0;

  const freq1 = {};
  const freq2 = {};
  words1.forEach(word => freq1[word] = (freq1[word] || 0) + 1);
  words2.forEach(word => freq2[word] = (freq2[word] || 0) + 1);

  const intersection = new Set([...words1, ...words2]);
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  intersection.forEach(word => {
    const f1 = freq1[word] || 0;
    const f2 = freq2[word] || 0;
    dotProduct += f1 * f2;
    norm1 += f1 * f1;
    norm2 += f2 * f2;
  });

  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);

  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (norm1 * norm2);
};

// ===== PRODUCT ROUTES =====
app.get('/api/products', (req, res) => {
  pool.query(
    'SELECT * FROM products WHERE stock_quantity > 0',
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch products' });
      }
      const parsedResults = results.map(product => ({
        ...product,
        price: parseFloat(product.price),
        stock_quantity: parseInt(product.stock_quantity, 10),
      }));
      res.json(parsedResults);
    }
  );
});

app.get('/api/products/:id', (req, res) => {
  pool.query(
    'SELECT * FROM products WHERE id = ? AND stock_quantity > 0',
    [req.params.id],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ error: 'Product not available' });
      }
      const product = results[0];
      res.json({
        ...product,
        price: parseFloat(product.price),
        stock_quantity: parseInt(product.stock_quantity, 10),
      });
    }
  );
});

app.post('/api/products/:id/buy', authenticateToken, (req, res) => {
  const productId = req.params.id;
  const { quantity } = req.body;
  const customerId = req.user.id;

  if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  pool.query(
    'SELECT stock_quantity, price FROM products WHERE id = ?',
    [productId],
    (err, result) => {
      if (err) {
        console.error('Database error during buy check:', err);
        return res.status(500).json({ error: 'Failed to process purchase' });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const availableStock = parseInt(result[0].stock_quantity, 10);
      const productPrice = parseFloat(result[0].price);

      if (isNaN(availableStock) || isNaN(productPrice)) {
        console.error('Invalid product data:', { availableStock, productPrice });
        return res.status(500).json({ error: 'Invalid product data' });
      }

      if (quantity > availableStock) {
        return res.status(400).json({ error: 'Not enough stock available' });
      }

      pool.getConnection((err, connection) => {
        if (err) {
          console.error('Error getting database connection:', err);
          return res.status(500).json({ error: 'Database connection failed' });
        }

        connection.beginTransaction(err => {
          if (err) {
            connection.release();
            console.error('Transaction error:', err);
            return res.status(500).json({ error: 'Transaction failed' });
          }

          connection.query(
            'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
            [quantity, productId],
            (errUpdate) => {
              if (errUpdate) {
                return connection.rollback(() => {
                  connection.release();
                  console.error('Stock update error:', errUpdate);
                  res.status(500).json({ error: 'Failed to process purchase' });
                });
              }

              const purchaseDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
              const totalPrice = productPrice * quantity;
              if (isNaN(totalPrice)) {
                return connection.rollback(() => {
                  connection.release();
                  console.error('Invalid total price:', { productPrice, quantity, totalPrice });
                  res.status(500).json({ error: 'Invalid transaction data' });
                });
              }

              console.log('Inserting transaction:', { productId, quantity, totalPrice, purchaseDate, customerId });
              connection.query(
                'INSERT INTO transactions (product_id, service_id, quantity, price, purchase_date, customer_id) VALUES (?, ?, ?, ?, ?, ?)',
                [productId, null, quantity, totalPrice, purchaseDate, customerId],
                (errInsert) => {
                  if (errInsert) {
                    return connection.rollback(() => {
                      connection.release();
                      console.error('Transaction insert error:', errInsert);
                      res.status(500).json({ error: `Failed to record transaction: ${errInsert.message}` });
                    });
                  }

                  connection.commit(errCommit => {
                    if (errCommit) {
                      return connection.rollback(() => {
                        connection.release();
                        console.error('Commit error:', errCommit);
                        res.status(500).json({ error: 'Failed to finalize purchase' });
                      });
                    }

                    connection.release();
                    res.json({ success: true, message: 'Product purchased successfully' });
                  });
                }
              );
            }
          );
        });
      });
    }
  );
});

// ===== SERVICE ROUTES =====
app.get('/api/services', (req, res) => {
  pool.query(
    'SELECT * FROM services',
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch services' });
      }
      const parsedResults = results.map(service => ({
        ...service,
        price: parseFloat(service.price),
      }));
      res.json(parsedResults);
    }
  );
});

app.post('/api/services/:id/buy', authenticateToken, (req, res) => {
  const serviceId = req.params.id;
  const { quantity } = req.body;
  const customerId = req.user.id;

  if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  pool.query(
    'SELECT price FROM services WHERE id = ?',
    [serviceId],
    (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to process purchase' });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: 'Service not found' });
      }

      const servicePrice = parseFloat(result[0].price);
      if (isNaN(servicePrice)) {
        console.error('Invalid service price:', servicePrice);
        return res.status(500).json({ error: 'Invalid service data' });
      }

      const purchaseDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const totalPrice = servicePrice * quantity;
      if (isNaN(totalPrice)) {
        console.error('Invalid total price:', { servicePrice, quantity, totalPrice });
        return res.status(500).json({ error: 'Invalid transaction data' });
      }

      console.log('Inserting transaction:', { serviceId, quantity, totalPrice, purchaseDate, customerId });
      pool.query(
        'INSERT INTO transactions (product_id, service_id, quantity, price, purchase_date, customer_id) VALUES (?, ?, ?, ?, ?, ?)',
        [null, serviceId, quantity, totalPrice, purchaseDate, customerId],
        (errInsert) => {
          if (errInsert) {
            console.error('Transaction insert error:', errInsert);
            return res.status(500).json({ error: `Failed to record transaction: ${errInsert.message}` });
          }

          res.json({ success: true, message: 'Service purchased successfully' });
        }
      );
    }
  );
});

// ===== QUERY SUBMISSION =====
app.post('/api/queries', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const [prevQueries] = await pool.promise().query(
      'SELECT * FROM customer_queries WHERE status = "complete"'
    );

    let autoReply = null;
    let autoReplied = false;

    for (const prevQuery of prevQueries) {
      const similarity = calculateSimilarity(message, prevQuery.message);
      if (similarity > 0.6) {
        autoReply = prevQuery.reply_text || 'Thank you for your query. We have received similar requests and will address it shortly.';
        autoReplied = true;
        break;
      }
    }

    await pool.promise().query(
      'INSERT INTO customer_queries (name, email, message, status, auto_replied, reply_text) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, message, autoReplied ? 'complete' : 'pending', autoReplied, autoReply]
    );

    if (autoReplied && autoReply) {
      const mailOptions = {
        from: 'no-reply@iwb.com',
        to: email,
        subject: 'IWB Auto-Reply to Your Query',
        text: `Dear ${name},\n\nThank you for reaching out to IWB. Here is our response to your query:\n\n${autoReply}\n\nBest regards,\nIWB Team`
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Auto-reply email sent to ${email}`);
      } catch (emailErr) {
        console.error('Error sending auto-reply email:', emailErr);
      }
    }

    res.json({ success: true, autoReplied, reply: autoReply });
  } catch (err) {
    console.error('Error processing query:', err);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

// ===== FETCH QUERIES =====
app.get('/api/queries', (req, res) => {
  pool.query(
    'SELECT * FROM customer_queries WHERE status = "complete" ORDER BY created_at DESC',
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch queries' });
      }
      res.json(results);
    }
  );
});

// ===== BACKUP SIMULATION =====
app.post('/api/backup/sales', (req, res) => {
  pool.query('CREATE TABLE IF NOT EXISTS transactions_backup AS SELECT * FROM transactions', (err) => {
    if (err) {
      console.error('Backup error:', err);
      return res.status(500).json({ error: 'Failed to backup sales' });
    }
    res.json({ success: true, message: 'Sales backed up successfully' });
  });
});

app.post('/api/backup/queries', (req, res) => {
  pool.query('CREATE TABLE IF NOT EXISTS customer_queries_backup AS SELECT * FROM customer_queries', (err) => {
    if (err) {
      console.error('Backup error:', err);
      return res.status(500).json({ error: 'Failed to backup queries' });
    }
    res.json({ success: true, message: 'Queries backed up successfully' });
  });
});

app.listen(3001, () => console.log('Customer backend running on http://localhost:3001'));