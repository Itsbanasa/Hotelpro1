if (!process.env.HOTELPRO_API_URL) throw new Error('Set HOTELPRO_API_URL to the intended HotelPro API before seeding.');
const apiBase = process.env.HOTELPRO_API_URL.replace(/\/$/, '');
const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;

const rooms = [
  ['201', 'The Courtyard Single', 'single', 4200, 3, 'A peaceful single room overlooking the leafy inner courtyard.', 'photo-1611892440504-42a792e24d32'],
  ['202', 'The Cedar Double', 'double', 6800, 2, 'Warm timber details and a generous bed make this an easy place to unwind.', 'photo-1702014859878-5d4743176d28'],
  ['203', 'The Garden Suite', 'suite', 12800, 1, 'A spacious suite with a lounge corner and garden inspired finishes.', 'photo-1713762523087-41019a875741'],
  ['205', 'The Window Seat Single', 'single', 4600, 2, 'A bright single room with a quiet reading nook beside the window.', 'photo-1725962479542-1be0a6b0d444'],
  ['206', 'The Heritage Double', 'double', 7600, 3, 'Classic textures and soft lighting create a relaxed heritage feel.', 'photo-1771466883546-a988d001f5ba'],
  ['207', 'The Terrace Suite', 'suite', 15900, 1, 'A refined suite designed for slow mornings and longer stays.', 'photo-1655287330904-8c03daa84d14'],
  ['208', 'The Linen Double', 'double', 7200, 4, 'Crisp linen, natural wood, and room to settle in together.', 'photo-1772476361154-e894ba10d757'],
  ['209', 'The Palm Single', 'single', 4400, 2, 'A calm, compact room with warm neutrals and a restful bed.', 'photo-1776763018821-8feeaeeee0a5'],
  ['210', 'The Corner Suite', 'suite', 14600, 1, 'A light-filled corner suite with separate spaces to rest and recharge.', 'photo-1784295070532-13b4ec3fcda0'],
  ['211', 'The Stone Double', 'double', 8100, 3, 'Thoughtful stone and wood finishes bring a grounded, modern feel.', 'photo-1743410976099-6114097db9ba'],
  ['212', 'The Studio Single', 'single', 4900, 2, 'A smart studio room with an uncluttered layout for focused stays.', 'photo-1652161854125-1f5289c13eac'],
  ['213', 'The Canopy Double', 'double', 8400, 2, 'A softly layered double room made for a restful night together.', 'photo-1668260592478-a6513b0a690e'],
  ['214', 'The Loft Suite', 'suite', 17800, 1, 'An airy suite with generous proportions and a comfortable lounge.', 'photo-1776500587913-6e55907a738e'],
  ['215', 'The Quiet Single', 'single', 4100, 3, 'A simple, comfortable retreat with everything close at hand.', 'photo-1776876648949-63ccabf63b10'],
  ['216', 'The Horizon Double', 'double', 9200, 2, 'A beautifully composed double room with an open, airy atmosphere.', 'photo-1646082144991-dc168f7bae03'],
  ['217', 'The Residence Suite', 'suite', 22500, 1, 'A generous residence-style suite for guests who like to spread out.', 'photo-1690935986319-c11e6cae84f7'],
  ['218', 'The Amber Double', 'double', 7900, 3, 'Amber accents and layered lighting give this room a welcoming glow.', 'photo-1777180249046-abf7d640e0d9'],
  ['219', 'The Willow Single', 'single', 4500, 2, 'A restful single room with natural textures and a soft palette.', 'photo-1718894070219-6b3e193ad4a9'],
  ['220', 'The Grand Suite', 'suite', 28900, 1, 'Our most spacious suite, with an elegant living area and premium finishes.', 'photo-1631049307264-da0ec9d70304'],
].map(([roomNumber, name, type, rent, count, description, photoId]) => ({
  roomNumber, name, type, rent, count, description,
  photos: [image(photoId)],
}));

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...options.headers },
  });
  const body = await response.text();
  let data;
  try { data = JSON.parse(body); } catch { data = { message: body.slice(0, 300) }; }
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${path} returned ${response.status}: ${data.message || 'unknown error'}`);
  return data;
}

const current = await request('/api/rooms');
const byNumber = new Map(current.map((room) => [String(room.roomNumber), room]));
let added = 0;
let alreadyPresent = 0;

if (byNumber.has('204')) {
  await request('/api/rooms', {
    method: 'PATCH',
    body: JSON.stringify({ roomNumber: '204', name: 'The Balcony View Double' }),
  });
}

for (const room of rooms) {
  if (byNumber.has(room.roomNumber)) {
    alreadyPresent += 1;
    continue;
  }
  await request('/api/rooms/addroom', { method: 'POST', body: JSON.stringify(room) });
  added += 1;
}

const result = await request('/api/rooms');
console.log(JSON.stringify({ apiBase, added, alreadyPresent, totalRooms: result.length }, null, 2));
