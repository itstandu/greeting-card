'use client';

import { useState } from 'react';
import {
  AdminPaymentMethodsFilters,
  AdminPaymentMethodsPagination,
  AdminPaymentMethodsTable,
  PaymentMethodDeleteDialog,
  PaymentMethodFormDialog,
} from '@/components/admin/payment-methods';
import { Button } from '@/components/ui/button';
import { useAdminPaymentMethods } from '@/hooks/use-admin-payment-methods';
import type { CreatePaymentMethodRequest, PaymentMethod } from '@/types';
import type { DropResult } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';

export default function AdminPaymentMethodsPage() {
  const {
    methods,
    loading,
    pagination,
    filters,
    setFilters,
    getInitialFormData,
    getEditFormData,
    handleSubmit: submitForm,
    handleToggleStatus,
    handleDragEnd: onDragEnd,
    handleDelete: deleteMethod,
    refresh,
  } = useAdminPaymentMethods();

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<CreatePaymentMethodRequest>({
    name: '',
    code: '',
    description: '',
    isActive: true,
    displayOrder: 0,
  });
  const [formLoading, setFormLoading] = useState(false);

  const handleCreate = () => {
    setSelectedMethod(null);
    setFormData(getInitialFormData(methods));
    setFormDialogOpen(true);
  };

  const handleEdit = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setFormData(getEditFormData(method));
    setFormDialogOpen(true);
  };

  const handleSubmit = async () => {
    setFormLoading(true);
    try {
      await submitForm(formData, selectedMethod);
      setFormDialogOpen(false);
    } catch {
      // Error already handled in hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    await onDragEnd(result, methods);
  };

  const handleDeleteClick = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMethod) return;
    setFormLoading(true);
    try {
      await deleteMethod(selectedMethod.id);
      setDeleteDialogOpen(false);
      setSelectedMethod(null);
    } catch {
      // Error already handled in hook
    } finally {
      setFormLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Phương thức thanh toán</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </div>

      <AdminPaymentMethodsFilters
        filters={filters}
        loading={loading}
        onFiltersChange={setFilters}
        onRefresh={refresh}
      />

      <AdminPaymentMethodsTable
        methods={methods}
        loading={loading}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteClick}
        onDragEnd={handleDragEnd}
      />

      <AdminPaymentMethodsPagination
        pagination={pagination}
        loading={loading}
        onPageChange={handlePageChange}
      />

      <PaymentMethodFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        formData={formData}
        onFormDataChange={setFormData}
        selectedMethod={selectedMethod}
        formLoading={formLoading}
        onSubmit={handleSubmit}
      />

      <PaymentMethodDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        method={selectedMethod}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
