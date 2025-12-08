import { useEffect, useState } from 'react';
import { useToast } from './use-toast';
import {
  createPaymentMethod,
  deletePaymentMethod,
  getAdminPaymentMethods,
  togglePaymentMethodStatus,
  updatePaymentMethod,
  updatePaymentMethodOrdering,
  type PaymentMethodFilters,
} from '@/services/payment-method.service';
import type {
  CreatePaymentMethodRequest,
  PaymentMethod,
  UpdatePaymentMethodRequest,
} from '@/types';
import type { DropResult } from '@hello-pangea/dnd';

interface UseAdminPaymentMethodsReturn {
  methods: PaymentMethod[];
  loading: boolean;
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
  filters: PaymentMethodFilters;
  setFilters: (filters: PaymentMethodFilters) => void;
  getInitialFormData: (methods: PaymentMethod[]) => CreatePaymentMethodRequest;
  getEditFormData: (method: PaymentMethod) => CreatePaymentMethodRequest;
  handleSubmit: (
    formData: CreatePaymentMethodRequest,
    selectedMethod: PaymentMethod | null,
  ) => Promise<void>;
  handleToggleStatus: (method: PaymentMethod) => Promise<void>;
  handleDragEnd: (result: DropResult, methods: PaymentMethod[]) => Promise<void>;
  handleDelete: (methodId: number) => Promise<void>;
  refresh: () => void;
}

export function useAdminPaymentMethods(): UseAdminPaymentMethodsReturn {
  const { toast } = useToast();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<PaymentMethodFilters>({
    search: '',
    isActive: undefined,
    page: 1,
    size: 10,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadMethods = async () => {
      setLoading(true);
      try {
        const response = await getAdminPaymentMethods(filters);
        setMethods(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } catch {
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách phương thức thanh toán',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, refreshKey]);

  const getInitialFormData = (methods: PaymentMethod[]): CreatePaymentMethodRequest => {
    return {
      name: '',
      code: '',
      description: '',
      isActive: true,
      displayOrder: methods.length + 1,
    };
  };

  const getEditFormData = (method: PaymentMethod): CreatePaymentMethodRequest => {
    return {
      name: method.name,
      code: method.code,
      description: method.description || '',
      isActive: method.isActive,
      displayOrder: method.displayOrder,
    };
  };

  const handleSubmit = async (
    formData: CreatePaymentMethodRequest,
    selectedMethod: PaymentMethod | null,
  ) => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (selectedMethod) {
        // Update
        const updateData: UpdatePaymentMethodRequest = {
          name: formData.name,
          code: formData.code,
          description: formData.description,
          isActive: formData.isActive,
          displayOrder: formData.displayOrder,
        };
        await updatePaymentMethod(selectedMethod.id, updateData);
        toast({ title: 'Thành công', description: 'Đã cập nhật phương thức thanh toán' });
      } else {
        // Create
        await createPaymentMethod(formData);
        toast({ title: 'Thành công', description: 'Đã tạo phương thức thanh toán mới' });
      }
      setRefreshKey(prev => prev + 1);
    } catch {
      toast({
        title: 'Lỗi',
        description: selectedMethod
          ? 'Không thể cập nhật phương thức thanh toán'
          : 'Không thể tạo phương thức thanh toán',
        variant: 'destructive',
      });
      throw new Error('Failed to submit');
    }
  };

  const handleToggleStatus = async (method: PaymentMethod) => {
    try {
      await togglePaymentMethodStatus(method.id);
      toast({
        title: 'Thành công',
        description: `Đã ${method.isActive ? 'vô hiệu hóa' : 'kích hoạt'} phương thức thanh toán`,
      });
      setRefreshKey(prev => prev + 1);
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể thay đổi trạng thái',
        variant: 'destructive',
      });
    }
  };

  const handleDragEnd = async (result: DropResult, currentMethods: PaymentMethod[]) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newMethods = Array.from(currentMethods);
    const [reorderedItem] = newMethods.splice(sourceIndex, 1);
    newMethods.splice(destinationIndex, 0, reorderedItem);

    // Optimistically update UI
    setMethods(newMethods);

    // Update displayOrder for all items
    const items = newMethods.map((m, i) => ({ id: m.id, displayOrder: i + 1 }));

    try {
      await updatePaymentMethodOrdering({ items });
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật thứ tự phương thức thanh toán',
      });
      setRefreshKey(prev => prev + 1);
    } catch {
      // Revert on error
      setRefreshKey(prev => prev + 1);
      toast({
        title: 'Lỗi',
        description: 'Không thể thay đổi thứ tự',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (methodId: number) => {
    try {
      await deletePaymentMethod(methodId);
      toast({ title: 'Thành công', description: 'Đã xóa phương thức thanh toán' });
      setRefreshKey(prev => prev + 1);
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa phương thức thanh toán. Có thể đã được sử dụng trong đơn hàng.',
        variant: 'destructive',
      });
      throw new Error('Failed to delete');
    }
  };

  const refresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return {
    methods,
    loading,
    pagination,
    filters,
    setFilters,
    getInitialFormData,
    getEditFormData,
    handleSubmit,
    handleToggleStatus,
    handleDragEnd,
    handleDelete,
    refresh,
  };
}
