import { DeliveryPerson } from '@/types';

const deliveryPersons: DeliveryPerson[] = [
  {
    id: 'dp_001',
    name: 'Murugan K',
    phone: '+91 90001 10001',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    isAvailable: true,
    activeDeliveries: 2,
    totalDeliveries: 342,
  },
  {
    id: 'dp_002',
    name: 'Suresh R',
    phone: '+91 90001 10002',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    isAvailable: true,
    activeDeliveries: 1,
    totalDeliveries: 278,
  },
  {
    id: 'dp_003',
    name: 'Karthik M',
    phone: '+91 90001 10003',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
    isAvailable: false,
    activeDeliveries: 0,
    totalDeliveries: 195,
  },
  {
    id: 'dp_004',
    name: 'Vignesh S',
    phone: '+91 90001 10004',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    isAvailable: true,
    activeDeliveries: 3,
    totalDeliveries: 410,
  },
  {
    id: 'dp_005',
    name: 'Dinesh P',
    phone: '+91 90001 10005',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100',
    isAvailable: true,
    activeDeliveries: 0,
    totalDeliveries: 87,
  },
];

export default deliveryPersons;
