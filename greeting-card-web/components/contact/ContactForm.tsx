'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CONTACT_CATEGORIES } from '@/lib/constants';
import { contactSchema, type ContactFormValues } from '@/lib/validations/contact';
import { submitContact } from '@/services/contact.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

export function ContactForm() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      subject: '',
      category: '',
      message: '',
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    try {
      await submitContact({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || undefined,
        subject: values.subject,
        category: values.category,
        message: values.message,
      });

      toast.success('Đã gửi thành công', {
        description: 'Chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất.',
      });
      form.reset();
    } catch (error) {
      const message = (error as Error)?.message || 'Gửi liên hệ thất bại. Vui lòng thử lại.';
      toast.error(message);
    }
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Họ và tên <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập họ và tên" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Email <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số điện thoại</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="0123 456 789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Chủ đề <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn chủ đề" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CONTACT_CATEGORIES.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tiêu đề <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tiêu đề" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tin nhắn <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea rows={6} placeholder="Nhập tin nhắn của bạn..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      'Đang gửi...'
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Gửi tin nhắn
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
