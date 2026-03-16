import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getStoredData, setStoredData } from '@/src/utils/localJsonStorage';
import type { DeliveryPerson, Order } from '@/types';

const DELIVERY_PERSONS_KEY = '@owner_delivery_persons';
const DELIVERY_ASSIGNMENTS_KEY = '@owner_delivery_assignments';
const DEMO_DEL_VERSION_KEY = '@demo_del_version';
const DEMO_DEL_VERSION = 2;

interface DeliveryAssignment {
  orderId: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  assignedAt: string;
  deliveredAt?: string;
  status: 'assigned' | 'picked_up' | 'delivered';
}

interface DeliveryContextType {
  deliveryPersons: DeliveryPerson[];
  assignments: DeliveryAssignment[];
  isLoading: boolean;
  getDeliveryPersons: () => DeliveryPerson[];
  getAvailableDrivers: () => DeliveryPerson[];
  assignDelivery: (orderId: string, driverId: string) => Promise<{ success: boolean; message: string }>;
  reassignDelivery: (orderId: string, newDriverId: string) => Promise<{ success: boolean; message: string }>;
  markDelivered: (orderId: string) => Promise<{ success: boolean; message: string }>;
  getActiveDeliveries: () => DeliveryAssignment[];
  getAssignmentByOrderId: (orderId: string) => DeliveryAssignment | undefined;
  addDeliveryPerson: (person: DeliveryPerson) => Promise<void>;
  toggleAvailability: (driverId: string) => Promise<void>;
  refreshDeliveries: () => Promise<void>;
}

const DeliveryContext = createContext<DeliveryContextType>({
  deliveryPersons: [],
  assignments: [],
  isLoading: true,
  getDeliveryPersons: () => [],
  getAvailableDrivers: () => [],
  assignDelivery: async () => ({ success: false, message: '' }),
  reassignDelivery: async () => ({ success: false, message: '' }),
  markDelivered: async () => ({ success: false, message: '' }),
  getActiveDeliveries: () => [],
  getAssignmentByOrderId: () => undefined,
  addDeliveryPerson: async () => {},
  toggleAvailability: async () => {},
  refreshDeliveries: async () => {},
});

// Sample delivery persons used as initial data — comprehensive demo set
const SAMPLE_DELIVERY_PERSONS: DeliveryPerson[] = [
  {
    id: 'drv_001',
    name: 'Suresh M',
    phone: '9988776655',
    isAvailable: true,
    activeDeliveries: 2,
    totalDeliveries: 156,
  },
  {
    id: 'drv_002',
    name: 'Karthik R',
    phone: '9988776644',
    isAvailable: true,
    activeDeliveries: 1,
    totalDeliveries: 203,
  },
  {
    id: 'drv_003',
    name: 'Manoj K',
    phone: '9988776633',
    isAvailable: true,
    activeDeliveries: 1,
    totalDeliveries: 89,
  },
  {
    id: 'drv_004',
    name: 'Ganesh P',
    phone: '9988776622',
    isAvailable: false,
    activeDeliveries: 0,
    totalDeliveries: 134,
  },
  {
    id: 'drv_005',
    name: 'Ravi S',
    phone: '9988776611',
    isAvailable: true,
    activeDeliveries: 0,
    totalDeliveries: 45,
  },
  {
    id: 'drv_006',
    name: 'Vijay T',
    phone: '9988776600',
    isAvailable: true,
    activeDeliveries: 0,
    totalDeliveries: 72,
  },
  {
    id: 'drv_007',
    name: 'Prasad N',
    phone: '9988776599',
    isAvailable: false,
    activeDeliveries: 0,
    totalDeliveries: 28,
  },
];

const SAMPLE_ASSIGNMENTS: DeliveryAssignment[] = [
  // Active assignments
  {
    orderId: 'ORD1002',
    driverId: 'drv_001',
    driverName: 'Suresh M',
    driverPhone: '9988776655',
    assignedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    status: 'picked_up',
  },
  {
    orderId: 'ORD1005',
    driverId: 'drv_001',
    driverName: 'Suresh M',
    driverPhone: '9988776655',
    assignedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'assigned',
  },
  {
    orderId: 'ORD1019',
    driverId: 'drv_002',
    driverName: 'Karthik R',
    driverPhone: '9988776644',
    assignedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    status: 'picked_up',
  },
  {
    orderId: 'ORD1018',
    driverId: 'drv_003',
    driverName: 'Manoj K',
    driverPhone: '9988776633',
    assignedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    status: 'assigned',
  },
  // Today's delivered
  {
    orderId: 'ORD1004',
    driverId: 'drv_002',
    driverName: 'Karthik R',
    driverPhone: '9988776644',
    assignedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
  },
  {
    orderId: 'ORD1006',
    driverId: 'drv_005',
    driverName: 'Ravi S',
    driverPhone: '9988776611',
    assignedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
  },
  {
    orderId: 'ORD1007',
    driverId: 'drv_001',
    driverName: 'Suresh M',
    driverPhone: '9988776655',
    assignedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
  },
  {
    orderId: 'ORD1008',
    driverId: 'drv_003',
    driverName: 'Manoj K',
    driverPhone: '9988776633',
    assignedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
  },
  {
    orderId: 'ORD1009',
    driverId: 'drv_005',
    driverName: 'Ravi S',
    driverPhone: '9988776611',
    assignedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
  },
  {
    orderId: 'ORD1010',
    driverId: 'drv_002',
    driverName: 'Karthik R',
    driverPhone: '9988776644',
    assignedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
  },
];

export function DeliveryProvider({ children }: { children: React.ReactNode }) {
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const storedVersion = await getStoredData<number>(DEMO_DEL_VERSION_KEY, 0);
      if (storedVersion < DEMO_DEL_VERSION) {
        await Promise.all([
          setStoredData(DELIVERY_PERSONS_KEY, SAMPLE_DELIVERY_PERSONS),
          setStoredData(DELIVERY_ASSIGNMENTS_KEY, SAMPLE_ASSIGNMENTS),
          setStoredData(DEMO_DEL_VERSION_KEY, DEMO_DEL_VERSION),
        ]);
        setDeliveryPersons(SAMPLE_DELIVERY_PERSONS);
        setAssignments(SAMPLE_ASSIGNMENTS);
      } else {
        const [storedPersons, storedAssignments] = await Promise.all([
          getStoredData<DeliveryPerson[]>(DELIVERY_PERSONS_KEY, []),
          getStoredData<DeliveryAssignment[]>(DELIVERY_ASSIGNMENTS_KEY, []),
        ]);

        if (storedPersons.length > 0) {
          setDeliveryPersons(storedPersons);
        } else {
          await setStoredData(DELIVERY_PERSONS_KEY, SAMPLE_DELIVERY_PERSONS);
          setDeliveryPersons(SAMPLE_DELIVERY_PERSONS);
        }

        if (storedAssignments.length > 0) {
          setAssignments(storedAssignments);
        } else {
          await setStoredData(DELIVERY_ASSIGNMENTS_KEY, SAMPLE_ASSIGNMENTS);
          setAssignments(SAMPLE_ASSIGNMENTS);
        }
      }
    } catch {
      setDeliveryPersons(SAMPLE_DELIVERY_PERSONS);
      setAssignments(SAMPLE_ASSIGNMENTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const persistPersons = useCallback(async (updated: DeliveryPerson[]) => {
    setDeliveryPersons(updated);
    await setStoredData(DELIVERY_PERSONS_KEY, updated);
  }, []);

  const persistAssignments = useCallback(async (updated: DeliveryAssignment[]) => {
    setAssignments(updated);
    await setStoredData(DELIVERY_ASSIGNMENTS_KEY, updated);
  }, []);

  const getDeliveryPersons = useCallback(() => {
    return deliveryPersons;
  }, [deliveryPersons]);

  const getAvailableDrivers = useCallback(() => {
    return deliveryPersons.filter((d) => d.isAvailable);
  }, [deliveryPersons]);

  const assignDelivery = useCallback(async (orderId: string, driverId: string): Promise<{ success: boolean; message: string }> => {
    const driver = deliveryPersons.find((d) => d.id === driverId);
    if (!driver) return { success: false, message: 'Driver not found' };
    if (!driver.isAvailable) return { success: false, message: 'Driver is not available' };

    // Check if order is already assigned
    const existing = assignments.find((a) => a.orderId === orderId && a.status !== 'delivered');
    if (existing) return { success: false, message: 'Order is already assigned to a driver' };

    const newAssignment: DeliveryAssignment = {
      orderId,
      driverId,
      driverName: driver.name,
      driverPhone: driver.phone,
      assignedAt: new Date().toISOString(),
      status: 'assigned',
    };

    // Update driver active deliveries count
    const updatedPersons = deliveryPersons.map((d) => {
      if (d.id !== driverId) return d;
      return { ...d, activeDeliveries: d.activeDeliveries + 1 };
    });

    const updatedAssignments = [...assignments, newAssignment];

    await Promise.all([
      persistPersons(updatedPersons),
      persistAssignments(updatedAssignments),
    ]);

    return { success: true, message: `Order assigned to ${driver.name}` };
  }, [deliveryPersons, assignments, persistPersons, persistAssignments]);

  const reassignDelivery = useCallback(async (orderId: string, newDriverId: string): Promise<{ success: boolean; message: string }> => {
    const newDriver = deliveryPersons.find(d => d.id === newDriverId);
    if (!newDriver) return { success: false, message: 'Driver not found' };
    if (!newDriver.isAvailable) return { success: false, message: 'Driver is not available' };

    const existing = assignments.find(a => a.orderId === orderId && a.status !== 'delivered');
    const withoutOld = existing
      ? assignments.filter(a => !(a.orderId === orderId && a.status !== 'delivered'))
      : assignments;

    const newAssignment: DeliveryAssignment = {
      orderId,
      driverId: newDriverId,
      driverName: newDriver.name,
      driverPhone: newDriver.phone,
      assignedAt: new Date().toISOString(),
      status: 'assigned',
    };

    const updatedPersons = deliveryPersons.map(d => {
      if (existing && d.id === existing.driverId && d.id !== newDriverId) {
        return { ...d, activeDeliveries: Math.max(0, d.activeDeliveries - 1) };
      }
      if (d.id === newDriverId && (!existing || existing.driverId !== newDriverId)) {
        return { ...d, activeDeliveries: d.activeDeliveries + 1 };
      }
      return d;
    });

    await Promise.all([
      persistPersons(updatedPersons),
      persistAssignments([...withoutOld, newAssignment]),
    ]);

    return { success: true, message: `Order reassigned to ${newDriver.name}` };
  }, [deliveryPersons, assignments, persistPersons, persistAssignments]);

  const markDelivered = useCallback(async (orderId: string): Promise<{ success: boolean; message: string }> => {
    const assignment = assignments.find((a) => a.orderId === orderId && a.status !== 'delivered');
    if (!assignment) return { success: false, message: 'No active delivery assignment found for this order' };

    const now = new Date().toISOString();

    // Update assignment status
    const updatedAssignments = assignments.map((a) => {
      if (a.orderId !== orderId || a.status === 'delivered') return a;
      return { ...a, status: 'delivered' as const, deliveredAt: now };
    });

    // Update driver stats
    const updatedPersons = deliveryPersons.map((d) => {
      if (d.id !== assignment.driverId) return d;
      return {
        ...d,
        activeDeliveries: Math.max(0, d.activeDeliveries - 1),
        totalDeliveries: d.totalDeliveries + 1,
      };
    });

    await Promise.all([
      persistPersons(updatedPersons),
      persistAssignments(updatedAssignments),
    ]);

    return { success: true, message: 'Order marked as delivered' };
  }, [deliveryPersons, assignments, persistPersons, persistAssignments]);

  const getActiveDeliveries = useCallback(() => {
    return assignments.filter((a) => a.status !== 'delivered');
  }, [assignments]);

  const getAssignmentByOrderId = useCallback((orderId: string) => {
    return assignments.find((a) => a.orderId === orderId && a.status !== 'delivered');
  }, [assignments]);

  const addDeliveryPerson = useCallback(async (person: DeliveryPerson) => {
    const updated = [...deliveryPersons, person];
    await persistPersons(updated);
  }, [deliveryPersons, persistPersons]);

  const toggleAvailability = useCallback(async (driverId: string) => {
    const updated = deliveryPersons.map((d) => {
      if (d.id !== driverId) return d;
      return { ...d, isAvailable: !d.isAvailable };
    });
    await persistPersons(updated);
  }, [deliveryPersons, persistPersons]);

  const value = useMemo(
    () => ({
      deliveryPersons,
      assignments,
      isLoading,
      getDeliveryPersons,
      getAvailableDrivers,
      assignDelivery,
      reassignDelivery,
      markDelivered,
      getActiveDeliveries,
      getAssignmentByOrderId,
      addDeliveryPerson,
      toggleAvailability,
      refreshDeliveries: loadData,
    }),
    [deliveryPersons, assignments, isLoading, getDeliveryPersons, getAvailableDrivers, assignDelivery, reassignDelivery, markDelivered, getActiveDeliveries, getAssignmentByOrderId, addDeliveryPerson, toggleAvailability, loadData],
  );

  return <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>;
}

export const useDeliveries = () => useContext(DeliveryContext);
