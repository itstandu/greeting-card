'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CONTACT_CATEGORIES } from '@/lib/constants';
import { submitContact } from '@/services/contact.service';
import type { CreateContactRequest } from '@/types';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

export function ContactForm() {
  const initialFormData: CreateContactRequest = useMemo(
    () => ({
      fullName: '',
      email: '',
      phone: '',
      subject: '',
      category: '',
      message: '',
    }),
    [],
  );

  const [formData, setFormData] = useState<CreateContactRequest>({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      toast.error('Vui lòng chọn chủ đề liên hệ');
      return;
    }
    setIsSubmitting(true);

    try {
      await submitContact({
        ...formData,
        fullName: formData.fullName.trim(),
        subject: formData.subject.trim(),
        category: formData.category,
        message: formData.message.trim(),
        phone: formData.phone?.trim() || undefined,
      });

      toast.success('Đã gửi thành công', {
        description: 'Chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất.',
      });
      setFormData(initialFormData);
    } catch (error) {
      const message = (error as Error)?.message || 'Gửi liên hệ thất bại. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value,
    }));
  };

  return (
    <section className="from-muted/30 to-background bg-linear-to-b py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Gửi tin nhắn cho chúng tôi
          </h2>
          <p className="text-muted-foreground text-lg">
            Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại với bạn sớm nhất có thể.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <Card className="border-2 py-6">
            <CardHeader>
              <CardTitle>Form liên hệ</CardTitle>
              <CardDescription>
                Vui lòng điền đầy đủ thông tin để chúng tôi có thể hỗ trợ bạn tốt nhất.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Họ và tên <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0123 456 789"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Chủ đề <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.category} onValueChange={handleSelectChange} required>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Chọn chủ đề" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTACT_CATEGORIES.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">
                    Tiêu đề <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Nhập tiêu đề"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    Tin nhắn <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Nhập tin nhắn của bạn..."
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    'Đang gửi...'
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Gửi tin nhắn
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
