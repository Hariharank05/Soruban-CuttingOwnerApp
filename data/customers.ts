import { Customer } from '@/types';

const customers: Customer[] = [
  {
    id: 'cust_001',
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    email: 'priya.sharma@email.com',
    address: '12, Anna Nagar, Chennai - 600040',
    totalOrders: 24,
    totalSpent: 4560,
    joinedDate: '2025-08-15T00:00:00.000Z',
    lastOrderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago — Active
  },
  {
    id: 'cust_002',
    name: 'Rajesh Kumar',
    phone: '+91 87654 32109',
    email: 'rajesh.k@email.com',
    address: '45, T Nagar, Chennai - 600017',
    totalOrders: 68,
    totalSpent: 12350,
    joinedDate: '2025-06-10T00:00:00.000Z',
    lastOrderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago — Active
  },
  {
    id: 'cust_003',
    name: 'Lakshmi Venkatesh',
    phone: '+91 76543 21098',
    email: 'lakshmi.v@email.com',
    address: '78, Adyar, Chennai - 600020',
    totalOrders: 35,
    totalSpent: 7890,
    joinedDate: '2025-09-01T00:00:00.000Z',
    lastOrderDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(), // 18 days ago — Low Risk
  },
  {
    id: 'cust_004',
    name: 'Deepa Rajan',
    phone: '+91 65432 10987',
    email: 'deepa.r@email.com',
    address: '23, Besant Nagar, Chennai - 600090',
    totalOrders: 52,
    totalSpent: 9750,
    joinedDate: '2025-07-20T00:00:00.000Z',
    lastOrderDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(), // 22 days ago — Low Risk
  },
  {
    id: 'cust_005',
    name: 'Arun Balaji',
    phone: '+91 54321 09876',
    address: '56, Velachery, Chennai - 600042',
    totalOrders: 15,
    totalSpent: 2890,
    joinedDate: '2025-11-05T00:00:00.000Z',
    lastOrderDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago — At Risk
  },
  {
    id: 'cust_006',
    name: 'Kavitha Mohan',
    phone: '+91 43210 98765',
    email: 'kavitha.m@email.com',
    address: '101, Porur, Chennai - 600116',
    totalOrders: 42,
    totalSpent: 8200,
    joinedDate: '2025-08-01T00:00:00.000Z',
    lastOrderDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago — At Risk
  },
  {
    id: 'cust_007',
    name: 'Santhosh Narayanan',
    phone: '+91 32109 87654',
    email: 'santhosh.n@email.com',
    address: '9, Mylapore, Chennai - 600004',
    totalOrders: 90,
    totalSpent: 18500,
    joinedDate: '2025-05-15T00:00:00.000Z',
    lastOrderDate: new Date(Date.now() - 68 * 24 * 60 * 60 * 1000).toISOString(), // 68 days ago — High Risk
  },
  {
    id: 'cust_008',
    name: 'Meena Sundaram',
    phone: '+91 21098 76543',
    address: '67, Kilpauk, Chennai - 600010',
    totalOrders: 18,
    totalSpent: 3450,
    joinedDate: '2025-10-20T00:00:00.000Z',
    lastOrderDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(), // 75 days ago — High Risk
  },
  {
    id: 'cust_009',
    name: 'Ganesh Iyer',
    phone: '+91 10987 65432',
    email: 'ganesh.i@email.com',
    address: '34, Nungambakkam, Chennai - 600034',
    totalOrders: 28,
    totalSpent: 5670,
    joinedDate: '2025-09-10T00:00:00.000Z',
    lastOrderDate: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(), // 95 days ago — Lost
  },
  {
    id: 'cust_010',
    name: 'Revathi Krishnan',
    phone: '+91 99887 76655',
    email: 'revathi.k@email.com',
    address: '15, Thiruvanmiyur, Chennai - 600041',
    totalOrders: 33,
    totalSpent: 6400,
    joinedDate: '2025-08-25T00:00:00.000Z',
    lastOrderDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago — Lost
  },
];

export default customers;
