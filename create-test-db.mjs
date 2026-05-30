import { DatabaseSync } from 'node:sqlite';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'test.db');
const db = new DatabaseSync(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL CHECK(price > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'shipped', 'delivered', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

// Insert sample data
const insertUser = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
const insertProduct = db.prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)');
const insertOrder = db.prepare('INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)');
const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');

insertUser.run('Alice', 'alice@example.com');
insertUser.run('Bob', 'bob@example.com');
insertUser.run('Charlie', 'charlie@example.com');

insertProduct.run('Laptop', 1299.99, 10);
insertProduct.run('Mouse', 24.99, 50);
insertProduct.run('Keyboard', 79.99, 30);
insertProduct.run('Monitor', 349.99, 15);

insertOrder.run(1, 1375.97, 'delivered');
insertOrder.run(2, 79.99, 'shipped');
insertOrder.run(1, 374.98, 'pending');

insertOrderItem.run(1, 1, 1, 1299.99);
insertOrderItem.run(1, 2, 2, 24.99);
insertOrderItem.run(1, 3, 1, 79.99);
insertOrderItem.run(2, 3, 1, 79.99);
insertOrderItem.run(3, 2, 5, 24.99);
insertOrderItem.run(3, 4, 1, 349.99);

// Verify
console.log('=== Tables ===');
for (const row of db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all()) {
  console.log(`  ${row.name}`);
}

console.log('\n=== Users ===');
for (const row of db.prepare('SELECT * FROM users').all()) {
  console.log(`  [${row.id}] ${row.name} <${row.email}>`);
}

console.log('\n=== Products ===');
for (const row of db.prepare('SELECT * FROM products').all()) {
  console.log(`  [${row.id}] ${row.name} - $${row.price} (stock: ${row.stock})`);
}

console.log('\n=== Orders with items ===');
const orderQuery = db.prepare(`
  SELECT o.id, u.name as user, o.status, o.total, o.created_at,
         COUNT(oi.id) as items_count
  FROM orders o
  JOIN users u ON o.user_id = u.id
  LEFT JOIN order_items oi ON o.id = oi.order_id
  GROUP BY o.id
`);
for (const row of orderQuery.all()) {
  console.log(`  Order #${row.id} | ${row.user} | ${row.status} | $${row.total} | ${row.items_count} items`);
}

console.log(`\n✅ Database created: ${dbPath}`);
db.close();
