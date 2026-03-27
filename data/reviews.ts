import type { ProductReview } from '@/types';

const reviews: ProductReview[] = [
  { id: 'rev_1', customerId: 'cust_1', customerName: 'Priya Sharma', productId: 'prod_1', productName: 'Fresh Tomatoes', orderId: 'ord_1', rating: 5, comment: 'Very fresh and perfectly cut! The small pieces were uniform and great for gravy.', status: 'published', createdAt: '2026-03-24T10:00:00.000Z' },
  { id: 'rev_2', customerId: 'cust_2', customerName: 'Rahul Verma', productId: 'prod_2', productName: 'Green Capsicum', orderId: 'ord_2', rating: 4, comment: 'Good quality capsicum. Slicing was neat. Would have liked thinner slices though.', status: 'published', ownerReply: 'Thank you! We will note your preference for thinner slices next time.', createdAt: '2026-03-23T14:00:00.000Z' },
  { id: 'rev_3', customerId: 'cust_3', customerName: 'Anita Desai', productId: 'prod_3', productName: 'Onions', orderId: 'ord_3', rating: 2, comment: 'Onions were not fresh, some had started sprouting. Disappointed.', status: 'flagged', createdAt: '2026-03-22T09:00:00.000Z' },
  { id: 'rev_4', customerId: 'cust_4', customerName: 'Karthik Nair', productId: 'prod_4', productName: 'Carrots', orderId: 'ord_4', rating: 5, comment: 'Excellent quality carrots! The cube cuts were perfect for my salad.', status: 'published', createdAt: '2026-03-21T16:00:00.000Z' },
  { id: 'rev_5', customerId: 'cust_5', customerName: 'Meena Iyer', productId: 'prod_5', productName: 'Paneer Pack', orderId: 'ord_5', rating: 3, comment: 'Paneer was okay but the cutting was not consistent. Some pieces were too big.', status: 'published', createdAt: '2026-03-20T11:00:00.000Z' },
  { id: 'rev_6', customerId: 'cust_1', customerName: 'Priya Sharma', productId: 'prod_6', productName: 'Sambar Pack', orderId: 'ord_6', rating: 5, comment: 'Amazing sambar pack! All veggies were fresh and pre-cut perfectly. Saved so much time!', status: 'published', createdAt: '2026-03-19T08:00:00.000Z' },
  { id: 'rev_7', customerId: 'cust_2', customerName: 'Rahul Verma', productId: 'prod_7', productName: 'Watermelon', orderId: 'ord_7', rating: 4, comment: 'Sweet and juicy watermelon. Good portion size for the price.', status: 'published', createdAt: '2026-03-18T14:00:00.000Z' },
  { id: 'rev_8', customerId: 'cust_3', customerName: 'Anita Desai', productId: 'prod_1', productName: 'Fresh Tomatoes', orderId: 'ord_8', rating: 1, comment: 'This is terrible quality. DO NOT BUY!!! Completely rotten inside.', status: 'flagged', createdAt: '2026-03-17T10:00:00.000Z' },
  { id: 'rev_9', customerId: 'cust_4', customerName: 'Karthik Nair', productId: 'prod_8', productName: 'Beetroot', orderId: 'ord_9', rating: 4, comment: 'Fresh beetroot with nice grating. Perfect for my juice.', status: 'published', createdAt: '2026-03-16T12:00:00.000Z' },
  { id: 'rev_10', customerId: 'cust_5', customerName: 'Meena Iyer', productId: 'prod_9', productName: 'Mixed Salad Pack', orderId: 'ord_10', rating: 5, comment: 'Best salad pack in town! Fresh veggies and great variety.', status: 'published', createdAt: '2026-03-15T09:00:00.000Z' },
];

export default reviews;
