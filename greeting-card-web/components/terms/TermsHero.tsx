import { FileText } from 'lucide-react';

export function TermsHero() {
  return (
    <section className="from-muted/50 via-background to-background relative overflow-hidden bg-linear-to-b pt-24 pb-16 lg:pt-32 lg:pb-24">
      <div className="relative z-10 container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="bg-primary/10 text-primary mb-6 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium">
            <FileText className="mr-2 h-4 w-4" />
            <span>Điều khoản sử dụng</span>
          </div>
          <h1 className="text-foreground mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Điều khoản và{' '}
            <span className="from-primary to-accent-foreground bg-linear-to-r bg-clip-text text-transparent">
              điều kiện
            </span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg sm:text-xl">
            Vui lòng đọc kỹ các điều khoản và điều kiện sử dụng dịch vụ của chúng tôi. Bằng việc sử
            dụng dịch vụ, bạn đồng ý với các điều khoản này.
          </p>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-sm">
            Cập nhật lần cuối:{' '}
            {new Date().toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="bg-primary/20 absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      <div className="bg-accent/20 absolute top-0 right-0 -z-10 h-64 w-64 rounded-full blur-3xl" />
      <div className="bg-secondary/20 absolute bottom-0 left-0 -z-10 h-64 w-64 rounded-full blur-3xl" />
    </section>
  );
}
