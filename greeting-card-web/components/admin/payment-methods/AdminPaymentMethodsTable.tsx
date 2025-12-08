'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/types';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { GripVertical, Pencil, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

interface AdminPaymentMethodsTableProps {
  methods: PaymentMethod[];
  loading: boolean;
  onEdit: (method: PaymentMethod) => void;
  onToggleStatus: (method: PaymentMethod) => void;
  onDelete: (method: PaymentMethod) => void;
  onDragEnd: (result: DropResult) => Promise<void>;
}

export function AdminPaymentMethodsTable({
  methods,
  loading,
  onEdit,
  onToggleStatus,
  onDelete,
  onDragEnd,
}: AdminPaymentMethodsTableProps) {
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">STT</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={`loading-${index}`}>
                <TableCell>
                  <Skeleton className="h-4 w-10" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (methods.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">STT</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center">
                Không có phương thức thanh toán nào
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">STT</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Mã</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="payment-methods">
            {provided => (
              <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                {methods.map((method, index) => (
                  <Draggable key={method.id} draggableId={String(method.id)} index={index}>
                    {(provided, snapshot) => (
                      <TableRow
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(snapshot.isDragging && 'bg-muted/50', 'transition-colors')}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="text-muted-foreground h-5 w-5" />
                            </div>
                            <span className="font-medium">{method.displayOrder}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{method.name}</TableCell>
                        <TableCell>
                          <code className="bg-muted rounded px-2 py-1 text-sm">{method.code}</code>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={method.description || ''}>
                            {method.description || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {method.isActive ? (
                            <Badge className="bg-green-500">Hoạt động</Badge>
                          ) : (
                            <Badge variant="secondary">Vô hiệu</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {method.createdAt
                            ? format(new Date(method.createdAt), 'dd/MM/yyyy', { locale: vi })
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onToggleStatus(method)}
                              title={method.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                            >
                              {method.isActive ? (
                                <ToggleRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(method)}
                              title="Chỉnh sửa"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(method)}
                              className="text-red-600 hover:text-red-700"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </TableBody>
            )}
          </Droppable>
        </DragDropContext>
      </Table>
    </div>
  );
}
