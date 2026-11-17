import { getDb } from './db';
import bcrypt from 'bcryptjs';

export function runSeed(force = false) {
  const db = getDb();

  // Check if already seeded
  const userCheck = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCheck && userCheck.count > 0 && !force) {
    return { status: 'already_seeded' };
  }

  console.log('Seeding ASIA Car Wash & Cafe database...');

  // 1. Create Default Admin & Staff Accounts
  const ownerPassHash = bcrypt.hashSync('asiacafe1*', 10);
  const staffPassHash = bcrypt.hashSync('asiastaff123', 10);

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, name, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertUser.run(
    'usr-owner-001',
    'Owner ASIA Cafe',
    'asiacarandwashcafe@gmail.com',
    ownerPassHash,
    'OWNER'
  );

  insertUser.run(
    'usr-staff-001',
    'Barista & Staff ASIA',
    'staff@asiacafe.com',
    staffPassHash,
    'STAFF'
  );

  // 2. Categories
  const categories = [
    { id: 'cat-salad', name: 'Salad', slug: 'salad', sort: 1 },
    { id: 'cat-rice-bowl', name: 'Rice Bowl', slug: 'rice-bowl', sort: 2 },
    { id: 'cat-signature', name: 'Signature', slug: 'signature', sort: 3 },
    { id: 'cat-noodle', name: 'Noodle', slug: 'noodle', sort: 4 },
    { id: 'cat-western', name: 'Western', slug: 'western', sort: 5 },
    { id: 'cat-snack-dessert', name: 'Snack & Dessert', slug: 'snack-dessert', sort: 6 },
    { id: 'cat-additional-food', name: 'Additional Food', slug: 'additional-food', sort: 7 },
    { id: 'cat-kopi', name: 'Kopi', slug: 'kopi', sort: 8 },
    { id: 'cat-non-coffee', name: 'Non-Coffee', slug: 'non-coffee', sort: 9 },
    { id: 'cat-tea', name: 'Tea', slug: 'tea', sort: 10 },
    { id: 'cat-coffee-mocktail', name: 'Coffee Mocktail', slug: 'coffee-mocktail', sort: 11 },
    { id: 'cat-mocktail', name: 'Mocktail', slug: 'mocktail', sort: 12 },
    { id: 'cat-juice', name: 'Juice', slug: 'juice', sort: 13 },
    { id: 'cat-water', name: 'Water', slug: 'water', sort: 14 },
    { id: 'cat-additional-drink', name: 'Additional Drink', slug: 'additional-drink', sort: 15 },
  ];

  const insertCategory = db.prepare(`
    INSERT OR REPLACE INTO categories (id, name, slug, sort_order, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  for (const cat of categories) {
    insertCategory.run(cat.id, cat.name, cat.slug, cat.sort);
  }

  // 3. Add-ons
  const addons = [
    { id: 'addon-shot', name: 'Espresso Extra Shot', price: 6000, category: 'drink' },
    { id: 'addon-aren', name: 'Gula Aren', price: 4000, category: 'drink' },
    { id: 'addon-oat', name: 'Oat Milk', price: 6000, category: 'drink' },
    { id: 'addon-mayo', name: 'Dressing Mayo', price: 5000, category: 'food' },
    { id: 'addon-matah', name: 'Sambal Matah', price: 6000, category: 'food' },
    { id: 'addon-ijo', name: 'Sambal Ijo', price: 6000, category: 'food' },
    { id: 'addon-rice', name: 'Rice', price: 8000, category: 'food' },
  ];

  const insertAddon = db.prepare(`
    INSERT OR REPLACE INTO addons (id, name, price, category, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  for (const add of addons) {
    insertAddon.run(add.id, add.name, add.price, add.category);
  }

  // 4. Tables (Meja 01 - 23, Meja VIP Room, Area Tunggu / Car Wash)
  const insertTable = db.prepare(`
    INSERT OR REPLACE INTO tables (id, table_number, table_name, table_type, qr_token, is_active, capacity)
    VALUES (?, ?, ?, ?, ?, 1, ?)
  `);

  // Meja 01 to 23
  for (let i = 1; i <= 23; i++) {
    const num = i < 10 ? `0${i}` : `${i}`;
    insertTable.run(
      `tbl-${num}`,
      num,
      `Meja ${num}`,
      'standard',
      `token-asia-tbl-${num}-2026`,
      4
    );
  }

  // Meja VIP Room
  insertTable.run(
    'tbl-vip',
    'VIP',
    'Meja VIP Room',
    'vip',
    'token-asia-tbl-vip-2026',
    10
  );

  // Area Tunggu / Car Wash
  insertTable.run(
    'tbl-carwash',
    'CARWASH',
    'Area Tunggu / Car Wash',
    'carwash',
    'token-asia-tbl-carwash-2026',
    12
  );

  // 5. Menu Items (All from Section 13)
  const menuItems = [
    // Salad
    {
      id: 'menu-sal-01',
      cat: 'cat-salad',
      name: 'Beef Teriyaki Salad',
      price: 42000,
      featured: 1,
      draft: 0,
      label: 'Recommended',
      kasir_id: 'SKU-SAL-001',
      desc: 'Salad segar dengan irisan daging sapi empuk dibalut saus teriyaki gurih manis khas ASIA.',
      img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-sal-02',
      cat: 'cat-salad',
      name: 'Grill Chicken Salad',
      price: 39000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-SAL-002',
      desc: 'Dada ayam panggang aromatik dipadukan dengan selada renyah dan dressing spesial.',
      img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    },

    // Rice Bowl
    {
      id: 'menu-rb-01',
      cat: 'cat-rice-bowl',
      name: 'Beef Teriyaki',
      price: 42000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-RB-001',
      desc: 'Nasi hangat dengan daging sapi empuk saus teriyaki gurih dan taburan wijen harum.',
      img: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-rb-02',
      cat: 'cat-rice-bowl',
      name: 'Beef Blackpaper',
      price: 42000,
      featured: 0,
      draft: 0,
      label: 'Spicy',
      kasir_id: 'SKU-RB-002',
      desc: 'Potongan daging sapi empuk berpadu saus lada hitam pedas aromatik di atas nasi hangat.',
      img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-rb-03',
      cat: 'cat-rice-bowl',
      name: 'Chicken Salted Egg',
      price: 42000,
      featured: 1,
      draft: 0,
      label: 'Best Seller',
      kasir_id: 'SKU-RB-003',
      desc: 'Ayam krispi keemasan dibalut saus telur asin creamy gurih dengan wangi daun kari segar.',
      img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-rb-04',
      cat: 'cat-rice-bowl',
      name: 'Chicken Sambal Matah',
      price: 38000,
      featured: 0,
      draft: 0,
      label: 'Spicy',
      kasir_id: 'SKU-RB-004',
      desc: 'Ayam goreng renyah disajikan dengan kesegaran sambal matah khas Bali bercita rasa pedas wangi.',
      img: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-rb-05',
      cat: 'cat-rice-bowl',
      name: 'Chicken Cabe Ijo',
      price: 38000,
      featured: 0,
      draft: 0,
      label: 'Spicy',
      kasir_id: 'SKU-RB-005',
      desc: 'Ayam renyah berlumur ulekan cabai hijau segar dengan rasa pedas gurih menggugah selera.',
      img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-rb-06',
      cat: 'cat-rice-bowl',
      name: 'Nasi Semur Daging',
      price: 48000,
      featured: 1,
      draft: 0,
      label: 'Recommended',
      kasir_id: 'SKU-RB-006',
      desc: 'Olahan daging sapi pilihan dimasak perlahan dalam kuah semur rempah manis gurih kaya rasa.',
      img: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80',
    },

    // Signature
    {
      id: 'menu-sig-01',
      cat: 'cat-signature',
      name: 'Nasi Sop Buntut Asia',
      price: 90000,
      featured: 1,
      draft: 0,
      label: 'Chef Recommended',
      kasir_id: 'SKU-SIG-001',
      desc: 'Sop buntut legendaris ASIA dengan kaldu rempah bening gurih, wortel, kentang, dan daging super empuk.',
      img: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-sig-02',
      cat: 'cat-signature',
      name: 'Oseng Buntut Asia',
      price: 75000,
      featured: 0,
      draft: 0,
      label: 'Spicy',
      kasir_id: 'SKU-SIG-002',
      desc: 'Buntut sapi empuk dioseng bersama cabai rawit, bawang bombay, dan bumbu kecap manis pedas nikmat.',
      img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-sig-03',
      cat: 'cat-signature',
      name: 'Nasi Goreng Smoked Beef',
      price: 36000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-SIG-003',
      desc: 'Nasi goreng harum dengan potongan daging asap premium, telur mata sapi, dan acar segar.',
      img: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-sig-04',
      cat: 'cat-signature',
      name: 'Nasi Goreng Kampung',
      price: 32000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-SIG-004',
      desc: 'Nasi goreng tradisional bercita rasa gurih terasi dan rempah rumahan dengan suwiran ayam.',
      img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-sig-05',
      cat: 'cat-signature',
      name: 'Nasi Goreng Asia',
      price: 32000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-SIG-005',
      desc: 'Nasi goreng racikan khas chef ASIA Cafe dengan aroma smokey wok hei istimewa.',
      img: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-sig-06',
      cat: 'cat-signature',
      name: 'Nasi Goreng Oseng Buntut Asia',
      price: 72000,
      featured: 1,
      draft: 1, // perlu konfirmasi harga ke cafe
      label: 'Special Confirmation',
      kasir_id: 'SKU-SIG-006',
      desc: 'Perpaduan mewah nasi goreng gurih disajikan bersama oseng buntut empuk berbumbu pedas manis (Harga draft/konfirmasi).',
      img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80',
    },

    // Noodle
    {
      id: 'menu-ndl-01',
      cat: 'cat-noodle',
      name: 'Mie Ayam Asia',
      price: 27000,
      featured: 1,
      draft: 0,
      label: 'Best Seller',
      kasir_id: 'SKU-NDL-001',
      desc: 'Mie kenyal spesial dengan topping ayam berbumbu manis gurih, caisim segar, dan kuah kaldu hangat.',
      img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-ndl-02',
      cat: 'cat-noodle',
      name: 'Mie Goreng',
      price: 32000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-NDL-002',
      desc: 'Mie telur goreng dengan sayuran segar, telur orak-arik, dan bumbu kecap manis gurih.',
      img: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-ndl-03',
      cat: 'cat-noodle',
      name: 'Mie Tek-Tek Asia',
      price: 40000,
      featured: 0,
      draft: 0,
      label: 'Spicy',
      kasir_id: 'SKU-NDL-003',
      desc: 'Mie kuah nyemek kaya rempah, cabai rawit, telur, dan irisan bakso serta ayam suwir gurih.',
      img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80',
    },

    // Western
    {
      id: 'menu-wst-01',
      cat: 'cat-western',
      name: 'Chicken Cordon Blue',
      price: 72000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-WST-001',
      desc: 'Fillet dada ayam renyah diisi keju mozzarella leleh dan smoked beef, disajikan bersama kentang goreng.',
      img: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-wst-02',
      cat: 'cat-western',
      name: 'Spaghetti Bolognese',
      price: 37000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-WST-002',
      desc: 'Spaghetti al dente dengan saus tomat daging cincang slow-cooked dan taburan keju parmesan.',
      img: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281222?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-wst-03',
      cat: 'cat-western',
      name: 'Spaghetti Aglio Olio',
      price: 37000,
      featured: 1,
      draft: 0,
      label: 'Recommended',
      kasir_id: 'SKU-WST-003',
      desc: 'Spaghetti klasik dengan tumisan minyak zaitun murni, bawang putih keemasan, cabai kering, dan parsley.',
      img: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-wst-04',
      cat: 'cat-western',
      name: 'Fettuccini Creamy Mushroom',
      price: 37000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-WST-004',
      desc: 'Pasta fettuccini dalam saus krim jamur kancing lembut dan wangi garlic butter.',
      img: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-wst-05',
      cat: 'cat-western',
      name: 'Fusili Creamy Tomato',
      price: 37000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-WST-005',
      desc: 'Fusili dengan perpaduan saus tomat segar dan cream lembut bergaya rose pasta.',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    },

    // Snack & Dessert
    {
      id: 'menu-snk-01',
      cat: 'cat-snack-dessert',
      name: 'Pisang Goreng',
      price: 20000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-SNK-001',
      desc: 'Pisang kepok manis digoreng krispi keemasan, manis alami dan renyah.',
      img: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-snk-02',
      cat: 'cat-snack-dessert',
      name: 'Kentang Goreng',
      price: 22000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-SNK-002',
      desc: 'French fries renyah dengan taburan garam laut dan saus cocolan spesial.',
      img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-snk-03',
      cat: 'cat-snack-dessert',
      name: 'Cireng',
      price: 19000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-SNK-003',
      desc: 'Cireng kenyal gurih dengan bumbu rujak pedas manis asam segar.',
      img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-snk-04',
      cat: 'cat-snack-dessert',
      name: 'Asia Mix Platters',
      price: 48000,
      featured: 1,
      draft: 0,
      label: 'Recommended',
      kasir_id: 'SKU-SNK-004',
      desc: 'Kombinasi lezat kentang goreng, sosis panggang, nugget ayam, dan saus cocolan aneka rasa.',
      img: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-snk-05',
      cat: 'cat-snack-dessert',
      name: 'Pangsit Kuah Asia',
      price: 22000,
      featured: 1,
      draft: 0,
      label: 'Warm & Comfort',
      kasir_id: 'SKU-SNK-005',
      desc: 'Pangsit lembut isi olahan daging gurih dalam mangkuk kuah kaldu bening harum minyak wijen.',
      img: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-snk-06',
      cat: 'cat-snack-dessert',
      name: 'Siomay Dimsum',
      price: 24000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-SNK-006',
      desc: 'Siomay kukus hangat bertekstur juicy dengan saus sambal dimsum khas.',
      img: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-snk-07',
      cat: 'cat-snack-dessert',
      name: 'Kuotie',
      price: 24000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-SNK-007',
      desc: 'Pangsit pan-fried dengan dasar renyah dan isian daging sayur gurih nikmat.',
      img: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-snk-08',
      cat: 'cat-snack-dessert',
      name: 'Telur 1/2',
      price: 17000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-SNK-008',
      desc: 'Dua butir telur setengah matang hangat dengan kecap asin dan lada bubuk.',
      img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-snk-09',
      cat: 'cat-snack-dessert',
      name: 'Cookies',
      price: 18000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-SNK-009',
      desc: 'Kue kering artisan dengan lelehan cokelat pekat dan aroma butter wangi.',
      img: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-snk-10',
      cat: 'cat-snack-dessert',
      name: 'Salt Bread',
      price: 18000,
      featured: 0,
      draft: 0,
      label: 'New',
      kasir_id: 'SKU-SNK-010',
      desc: 'Roti mentega khas Jepang dengan bagian luar renyah, dalam lembut, dan taburan sea salt.',
      img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-snk-11',
      cat: 'cat-snack-dessert',
      name: 'Pain Au',
      price: 31000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-SNK-011',
      desc: 'Pastry klasik Prancis berlapis renyah dengan isian cokelat batang leleh.',
      img: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-snk-12',
      cat: 'cat-snack-dessert',
      name: 'Croissant Butter',
      price: 27000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-SNK-012',
      desc: 'Croissant flaky keemasan dengan mentega Prancis aromatik bertekstur lembut.',
      img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-snk-13',
      cat: 'cat-snack-dessert',
      name: 'Salt Bread Srikaya / Coklat',
      price: 27000,
      featured: 0,
      draft: 0,
      label: 'New',
      kasir_id: 'SKU-SNK-013',
      desc: 'Salt bread mentega gurih dengan pilihan isian selai srikaya legit atau cokelat lezat.',
      img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-snk-14',
      cat: 'cat-snack-dessert',
      name: 'Roti Bakar Coklat',
      price: 19000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-SNK-014',
      desc: 'Roti panggang mentega dengan olesan cokelat pekat melimpah.',
      img: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-snk-15',
      cat: 'cat-snack-dessert',
      name: 'Roti Bakar Keju',
      price: 19000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-SNK-015',
      desc: 'Roti panggang gurih dengan parutan keju cheddar tebal dan susu kental manis.',
      img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-snk-16',
      cat: 'cat-snack-dessert',
      name: 'Roti Bakar Keju Coklat',
      price: 22000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-SNK-016',
      desc: 'Paduan klasik roti bakar dengan limpahan keju parut gurih dan cokelat manis.',
      img: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-snk-17',
      cat: 'cat-snack-dessert',
      name: 'Es Buah',
      price: 32000,
      featured: 1,
      draft: 1, // perlu konfirmasi harga ke cafe
      label: 'Special Confirmation',
      kasir_id: 'SKU-SNK-017',
      desc: 'Campuran buah-buahan segar dingin dengan sirup manis dan susu kental manis (Harga draft/konfirmasi).',
      img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
    },

    // Additional Food
    {
      id: 'menu-addf-01',
      cat: 'cat-additional-food',
      name: 'Dressing Mayo',
      price: 5000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-ADDF-001',
      desc: 'Porsi tambahan dressing mayones gurih creamy.',
      img: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-addf-02',
      cat: 'cat-additional-food',
      name: 'Sambal Matah',
      price: 6000,
      featured: 0,
      draft: 0,
      label: 'Spicy',
      kasir_id: 'SKU-ADDF-002',
      desc: 'Porsi tambahan sambal matah iris segar beraroma serai dan jeruk limau.',
      img: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-addf-03',
      cat: 'cat-additional-food',
      name: 'Sambal Ijo',
      price: 6000,
      featured: 0,
      draft: 0,
      label: 'Spicy',
      kasir_id: 'SKU-ADDF-003',
      desc: 'Porsi tambahan ulekan sambal cabai hijau gurih pedas.',
      img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-addf-04',
      cat: 'cat-additional-food',
      name: 'Rice',
      price: 8000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-ADDF-004',
      desc: 'Satu porsi nasi putih pulen hangat.',
      img: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&auto=format&fit=crop&q=80',
    },

    // Kopi (Hot/Cold)
    {
      id: 'menu-kop-01',
      cat: 'cat-kopi',
      name: 'Espresso',
      price: 20000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-KOP-001',
      desc: 'Ekstraksi kopi murni dengan crema tebal keemasan dan aroma pekat kaya rasa.',
      img: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-kop-02',
      cat: 'cat-kopi',
      name: 'Kopi Tubruk Asia',
      price: 18000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-KOP-002',
      desc: 'Kopi hitam tradisional seduh panas dengan racikan biji kopi nusantara pilihan.',
      img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-kop-03',
      cat: 'cat-kopi',
      name: 'Americano',
      price: 22000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-KOP-003',
      desc: 'Double shot espresso dipadukan dengan air murni, bersih dan menyegarkan.',
      img: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-kop-04',
      cat: 'cat-kopi',
      name: 'Cappuccino',
      price: 34000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-KOP-004',
      desc: 'Kombinasi seimbang espresso, steamed milk, dan busa susu tebal lembut.',
      img: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-kop-05',
      cat: 'cat-kopi',
      name: 'Cafe Latte',
      price: 34000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-KOP-005',
      desc: 'Espresso berpadu susu segar lembut bertekstur microfoam halus.',
      img: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-kop-06',
      cat: 'cat-kopi',
      name: 'Kopi Susu Gula Aren',
      price: 32000,
      featured: 1,
      draft: 0,
      label: 'Best Seller',
      kasir_id: 'SKU-KOP-006',
      desc: 'Signature coffee ASIA: espresso mantap, susu creamy, dan gula aren organik wangi karamel.',
      img: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-kop-07',
      cat: 'cat-kopi',
      name: 'Toffeccino',
      price: 37000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-KOP-007',
      desc: 'Cappuccino spesial dengan sirup toffee manis gurih beraroma toffee nut.',
      img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-kop-08',
      cat: 'cat-kopi',
      name: 'Coffee Butterscotch',
      price: 37000,
      featured: 1,
      draft: 0,
      label: 'Recommended',
      kasir_id: 'SKU-KOP-008',
      desc: 'Espresso kaya rasa dibalut rasa butterscotch manis gurih buttery yang mewah.',
      img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-kop-09',
      cat: 'cat-kopi',
      name: 'Salted Caramel Coffee',
      price: 37000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-KOP-009',
      desc: 'Paduan kopi susu dengan saus karamel manis dan sentuhan sea salt yang memanjakan lidah.',
      img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&auto=format&fit=crop&q=80',
    },

    // Non-Coffee (Hot/Cold)
    {
      id: 'menu-non-01',
      cat: 'cat-non-coffee',
      name: 'Matcha Latte',
      price: 37000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-NON-001',
      desc: 'Bubuk matcha murni berkualitas dipadukan dengan susu segar creamy beraroma earthy.',
      img: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-non-02',
      cat: 'cat-non-coffee',
      name: 'Red Velvet Latte',
      price: 32000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-NON-002',
      desc: 'Minuman red velvet manis lembut dengan hint cocoa dan susu hangat/dingin.',
      img: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-non-03',
      cat: 'cat-non-coffee',
      name: 'Chocolate Latte',
      price: 32000,
      featured: 1,
      draft: 0,
      label: 'Best Seller',
      kasir_id: 'SKU-NON-003',
      desc: 'Cokelat pekat pilihan dilelehkan dalam susu segar gurih dengan cita rasa manis pas.',
      img: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&auto=format&fit=crop&q=80',
    },

    // Tea (Hot/Cold)
    {
      id: 'menu-tea-01',
      cat: 'cat-tea',
      name: 'Iced Tea',
      price: 16000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-TEA-001',
      desc: 'Seduhan teh melati wangi segar pemuas dahaga.',
      img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-tea-02',
      cat: 'cat-tea',
      name: 'Lemon Tea',
      price: 25000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-TEA-002',
      desc: 'Teh segar dengan perasan lemon asli berpadu manis asam menyegarkan.',
      img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-tea-03',
      cat: 'cat-tea',
      name: 'Lychee Tea',
      price: 27000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-TEA-003',
      desc: 'Teh harum dengan manis buah leci dan buah leci utuh di dalamnya.',
      img: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-tea-04',
      cat: 'cat-tea',
      name: 'Peach Tea',
      price: 27000,
      featured: 1,
      draft: 0,
      label: 'Recommended',
      kasir_id: 'SKU-TEA-004',
      desc: 'Aroma buah peach manis lembut dalam seduhan teh dingin premium.',
      img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&auto=format&fit=crop&q=80',
    },

    // Coffee Mocktail
    {
      id: 'menu-cmock-01',
      cat: 'cat-coffee-mocktail',
      name: 'Peachy Triple Americano',
      price: 27000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-CMOCK-001',
      desc: 'Kombinasi triple espresso dengan manis segar sari buah peach dan soda dingin.',
      img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-cmock-02',
      cat: 'cat-coffee-mocktail',
      name: 'Lemonade Americano',
      price: 27000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-CMOCK-002',
      desc: 'Espresso bold dipadukan dengan kesegaran citrus lemonade alami yang melegakan.',
      img: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-cmock-03',
      cat: 'cat-coffee-mocktail',
      name: 'Lychee Americano',
      price: 27000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-CMOCK-003',
      desc: 'Sensasi manis eksotis buah leci yang melengkapi kepekatan americano dingin.',
      img: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-cmock-04',
      cat: 'cat-coffee-mocktail',
      name: 'Mont Blanc',
      price: 42000,
      featured: 1,
      draft: 0,
      label: 'Luxury Signature',
      kasir_id: 'SKU-CMOCK-004',
      desc: 'Kreasi kopi mocktail mewah terinspirasi dessert Eropa dengan cold brew dan lapisan cream lembut.',
      img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    },

    // Mocktail
    {
      id: 'menu-mock-01',
      cat: 'cat-mocktail',
      name: 'Virgin Mojito',
      price: 27000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-MOCK-001',
      desc: 'Perasan jeruk nipis segar, daun mint aromatik, dan soda dingin yang membangkitkan semangat.',
      img: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-mock-02',
      cat: 'cat-mocktail',
      name: 'Lychee Mojito',
      price: 27000,
      featured: 1,
      draft: 0,
      label: 'Recommended',
      kasir_id: 'SKU-MOCK-002',
      desc: 'Mojito segar berpadu dengan manis buah leci utuh dan daun mint dingin.',
      img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-mock-03',
      cat: 'cat-mocktail',
      name: 'Blue Ocean',
      price: 27000,
      featured: 0,
      draft: 0,
      label: 'New',
      kasir_id: 'SKU-MOCK-003',
      desc: 'Mocktail biru tropis berkarbonasi dengan perpaduan sirup curacao non-alkohol dan citrus segar.',
      img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
    },

    // Juice
    {
      id: 'menu-jce-01',
      cat: 'cat-juice',
      name: 'Watermelon',
      price: 20000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-JCE-001',
      desc: 'Jus semangka segar murni tanpa pemanis berlebih, manis dan menghidrasi.',
      img: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-jce-02',
      cat: 'cat-juice',
      name: 'Pineapple',
      price: 20000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-JCE-002',
      desc: 'Jus nanas madu segar kaya vitamin dengan rasa manis asam alami.',
      img: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-jce-03',
      cat: 'cat-juice',
      name: 'Strawberry',
      price: 27000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-JCE-003',
      desc: 'Jus buah stroberi asli dengan rasa manis asam menyegarkan.',
      img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-jce-04',
      cat: 'cat-juice',
      name: 'Mango',
      price: 27000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-JCE-004',
      desc: 'Jus mangga kental harum manis dengan tekstur lembut menyegarkan.',
      img: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-jce-05',
      cat: 'cat-juice',
      name: 'Mix Juice (Pineapple, Watermelon)',
      price: 27000,
      featured: 1,
      draft: 0,
      label: 'Recommended',
      kasir_id: 'SKU-JCE-005',
      desc: 'Kombinasi tropis nanas madu dan semangka merah segar penghilang dahaga.',
      img: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-jce-06',
      cat: 'cat-juice',
      name: 'Mix Juice (Mango, Strawberry)',
      price: 30000,
      featured: 0,
      draft: 0,
      label: 'New',
      kasir_id: 'SKU-JCE-006',
      desc: 'Perpaduan kental manis mangga harum manis dengan kesegaran stroberi pilihan.',
      img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop&q=80',
    },

    // Water
    {
      id: 'menu-wtr-01',
      cat: 'cat-water',
      name: 'Mineral Water E+',
      price: 18000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-WTR-001',
      desc: 'Air mineral premium botol kaca E+ dengan pH seimbang.',
      img: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-wtr-02',
      cat: 'cat-water',
      name: 'Cleo',
      price: 8000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-WTR-002',
      desc: 'Air murni Cleo kemasan higienis dingin atau normal.',
      img: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-wtr-03',
      cat: 'cat-water',
      name: 'Soda Water',
      price: 16000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-WTR-003',
      desc: 'Air soda murni berkarbonasi dingin yang menyegarkan.',
      img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
    },

    // Additional Drink
    {
      id: 'menu-addd-01',
      cat: 'cat-additional-drink',
      name: 'Espresso Extra Shot',
      price: 6000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-ADDD-001',
      desc: 'Satu shot tambahan espresso murni untuk intensitas kopi lebih mantap.',
      img: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-addd-02',
      cat: 'cat-additional-drink',
      name: 'Gula Aren',
      price: 4000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-ADDD-002',
      desc: 'Tambahan sirup gula aren organik harum manis khas nusantara.',
      img: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'menu-addd-03',
      cat: 'cat-additional-drink',
      name: 'Oat Milk',
      price: 6000,
      featured: 0,
      draft: 0,
      label: null,
      kasir_id: 'SKU-ADDD-003',
      desc: 'Pilihan susu nabati oat milk lembut untuk minuman ramah laktosa.',
      img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=80',
    },
  ];

  const insertMenuItem = db.prepare(`
    INSERT OR REPLACE INTO menu_items (
      id, category_id, name, description, price, image_url,
      is_featured, is_available, is_draft, kasir_product_id, sort_order, label
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
  `);

  const insertVariant = db.prepare(`
    INSERT OR REPLACE INTO menu_variants (id, menu_item_id, name, price_difference)
    VALUES (?, ?, ?, ?)
  `);

  const insertItemAddon = db.prepare(`
    INSERT OR REPLACE INTO menu_item_addons (menu_item_id, addon_id)
    VALUES (?, ?)
  `);

  let sortCounter = 1;
  for (const item of menuItems) {
    insertMenuItem.run(
      item.id,
      item.cat,
      item.name,
      item.desc,
      item.price,
      item.img,
      item.featured,
      item.draft,
      item.kasir_id,
      sortCounter++,
      item.label
    );

    // Kategori Kopi, Non-Coffee, Tea automatically get Hot/Cold variants
    if (['cat-kopi', 'cat-non-coffee', 'cat-tea'].includes(item.cat)) {
      insertVariant.run(`var-${item.id}-hot`, item.id, 'Hot', 0);
      insertVariant.run(`var-${item.id}-cold`, item.id, 'Cold', 0);

      // Drink add-ons
      insertItemAddon.run(item.id, 'addon-shot');
      insertItemAddon.run(item.id, 'addon-aren');
      insertItemAddon.run(item.id, 'addon-oat');
    }

    // Food categories get food add-ons
    if (['cat-salad', 'cat-rice-bowl', 'cat-signature', 'cat-noodle', 'cat-western'].includes(item.cat)) {
      insertItemAddon.run(item.id, 'addon-mayo');
      insertItemAddon.run(item.id, 'addon-matah');
      insertItemAddon.run(item.id, 'addon-ijo');
      insertItemAddon.run(item.id, 'addon-rice');
    }
  }

  // 6. Promotions
  const promotions = [
    {
      id: 'promo-01',
      title: 'Grand Automotive Lounge Opening',
      description: 'Dapatkan diskon 15% untuk seluruh menu Rice Bowl dan Signature saat menunggu cuci mobil Anda.',
      image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80',
      discount_type: 'percentage',
      discount_value: 15,
      target_type: 'all',
      is_active: 1,
      sort_order: 1,
    },
    {
      id: 'promo-02',
      title: 'Signature Coffee & Car Detailing',
      description: 'Nikmati Kopi Susu Gula Aren & Mont Blanc dengan racikan biji kopi terbaik.',
      image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80',
      discount_type: 'nominal',
      discount_value: 5000,
      target_type: 'category',
      target_id: 'cat-kopi',
      is_active: 1,
      sort_order: 2,
    },
  ];

  const insertPromo = db.prepare(`
    INSERT OR REPLACE INTO promotions (
      id, title, description, image_url, discount_type, discount_value,
      target_type, target_id, is_active, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const promo of promotions) {
    insertPromo.run(
      promo.id,
      promo.title,
      promo.description,
      promo.image_url,
      promo.discount_type,
      promo.discount_value,
      promo.target_type,
      promo.target_id || null,
      promo.is_active,
      promo.sort_order
    );
  }

  // 7. Gallery
  const gallery = [
    {
      id: 'gal-01',
      title: 'VIP Lounge & Dining',
      desc: 'Area makan mewah bernuansa European Luxury dengan pencahayaan hangat.',
      url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80',
      cat: 'cafe',
      sort: 1,
    },
    {
      id: 'gal-02',
      title: 'Barista Counter & Coffee Bar',
      desc: 'Peralatan espresso komersial modern dengan barista berdedikasi tinggi.',
      url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&auto=format&fit=crop&q=80',
      cat: 'cafe',
      sort: 2,
    },
    {
      id: 'gal-03',
      title: 'Premium Automotive Wash Bay',
      desc: 'Fasilitas pencucian hidrolik modern dengan snow foam ph-neutral berkualitas.',
      url: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=1200&auto=format&fit=crop&q=80',
      cat: 'carwash',
      sort: 3,
    },
    {
      id: 'gal-04',
      title: 'Cozy Waiting Lounge',
      desc: 'Sofa empuk, wifi kencang, dan pemandangan area car wash dengan privasi maksimal.',
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
      cat: 'cafe',
      sort: 4,
    },
  ];

  const insertGallery = db.prepare(`
    INSERT OR REPLACE INTO gallery_items (id, title, description, image_url, category, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);

  for (const g of gallery) {
    insertGallery.run(g.id, g.title, g.desc, g.url, g.cat, g.sort);
  }

  // 8. Settings
  const settings = [
    { key: 'tax_rate', val: '0.11', desc: 'Pajak & service charge (11%)' },
    {
      key: 'payment_methods',
      val: JSON.stringify({
        cashier: true,
        qris: true,
        transfer: true,
        debit: true,
        credit: true,
      }),
      desc: 'Metode pembayaran aktif yang diizinkan owner',
    },
    { key: 'cafe_name', val: 'ASIA Car Wash & Cafe', desc: 'Nama resmi cafe' },
    { key: 'tagline', val: 'A Taste of Comfort, A Touch of Luxury.', desc: 'Tagline brand' },
    { key: 'instagram', val: 'asiacarwashandcafe', desc: 'Akun Instagram resmi' },
    {
      key: 'maps_url',
      val: 'https://maps.app.goo.gl/1BwPD4VX9QfCVcxq7?g_st=ac',
      desc: 'Tautan Google Maps',
    },
    { key: 'cafe_hours', val: '08:00 - 22:00 WIB', desc: 'Jam operasional Cafe' },
    { key: 'carwash_hours', val: '07:30 - 19:00 WIB', desc: 'Jam operasional Car Wash' },
    { key: 'phone_number', val: '+62 812-3456-7890', desc: 'Nomor WhatsApp Hotline' },
    {
      key: 'announcement_active',
      val: '1',
      desc: 'Status pengumuman penting di homepage',
    },
    {
      key: 'announcement_title',
      val: 'A Taste of Comfort, A Touch of Luxury',
      desc: 'Judul pengumuman/informasi penting',
    },
    {
      key: 'announcement_text',
      val: 'Selamat datang di ASIA Car Wash & Cafe. Pindai QR di meja Anda untuk memesan menu favorit sembari kendaraan Anda dimanjakan dengan car wash detailing terbaik.',
      desc: 'Isi pengumuman penting',
    },
    {
      key: 'carwash_info',
      val: 'Layanan Car Wash Kami: Snow Wash Hidrolik, Interior Vacuum & Disinfection, Glass Water-Spot Treatment, dan Express Body Waxing.',
      desc: 'Informasi layanan car wash',
    },
    {
      key: 'kasir_config',
      val: JSON.stringify({
        api_url: 'https://kasir.asiacafe.local/api/v1/orders',
        api_key: 'kasir_sec_asia_demo_2026',
        auth_type: 'Bearer',
        webhook_secret: 'whsec_asia_cafe_kasir_9981',
        enabled: true,
      }),
      desc: 'Konfigurasi integrasi API kasir eksternal',
    },
  ];

  const insertSetting = db.prepare(`
    INSERT OR REPLACE INTO settings (id, key, value, description)
    VALUES (?, ?, ?, ?)
  `);

  for (const s of settings) {
    insertSetting.run(`set-${s.key}`, s.key, s.val, s.desc);
  }

  // 9. Initial Audit Log
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, user_id, user_name, action, entity, entity_id, changes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertAudit.run(
    'audit-seed-001',
    'usr-owner-001',
    'System Seed',
    'INITIALIZE_SYSTEM',
    'SYSTEM',
    'all',
    JSON.stringify({ note: 'Initial system seed executed successfully with 15 categories, 55+ menu items, and 24 tables.' })
  );

  console.log('Seed completed successfully!');
  return { status: 'seeded' };
}
