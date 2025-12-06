'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { CONTACT_INFO } from '@/lib/constants/contact';
import { Link, Search } from 'lucide-react';

const faqs = [
  {
    category: 'Mua sắm',
    id: 'mua-sắm',
    questions: [
      {
        question: 'Làm thế nào để tìm sản phẩm phù hợp?',
        answer:
          'Bạn có thể sử dụng thanh tìm kiếm ở đầu trang, duyệt theo danh mục, hoặc sử dụng bộ lọc để tìm sản phẩm theo giá, chủ đề, hoặc các tiêu chí khác. Chúng tôi cũng có tính năng gợi ý sản phẩm dựa trên sở thích của bạn.',
      },
      {
        question: 'Tôi có thể xem trước thiệp trước khi mua không?',
        answer:
          'Có, bạn có thể xem hình ảnh chi tiết và mô tả của từng thiệp. Một số thiệp còn có tính năng xem trước tương tác để bạn có thể thấy thiệp sẽ trông như thế nào khi gửi đi.',
      },
      {
        question: 'Có giới hạn số lượng thiệp tôi có thể mua không?',
        answer:
          'Không có giới hạn số lượng thiệp bạn có thể mua. Bạn có thể mua bao nhiêu tùy thích và sử dụng cho nhiều dịp khác nhau.',
      },
      {
        question: 'Làm sao để thêm sản phẩm vào giỏ hàng?',
        answer:
          'Bạn chỉ cần nhấn vào nút "Thêm vào giỏ" trên trang sản phẩm. Bạn cũng có thể chọn số lượng trước khi thêm. Giỏ hàng của bạn sẽ được lưu tự động.',
      },
    ],
  },
  {
    category: 'Thanh toán',
    id: 'thanh-toán',
    questions: [
      {
        question: 'Các phương thức thanh toán nào được chấp nhận?',
        answer:
          'Chúng tôi chấp nhận thanh toán qua thẻ tín dụng/ghi nợ (Visa, Mastercard), ví điện tử (MoMo, ZaloPay, VNPay), chuyển khoản ngân hàng, và thanh toán khi nhận hàng (COD) cho một số khu vực.',
      },
      {
        question: 'Thanh toán có an toàn không?',
        answer:
          'Có, tất cả các giao dịch đều được mã hóa SSL và xử lý qua các cổng thanh toán uy tín. Chúng tôi không lưu trữ thông tin thẻ tín dụng của bạn.',
      },
      {
        question: 'Tôi có thể hoàn tiền nếu không hài lòng không?',
        answer:
          'Có, chúng tôi có chính sách hoàn tiền trong vòng 7 ngày kể từ ngày mua nếu bạn không hài lòng với sản phẩm. Vui lòng liên hệ bộ phận hỗ trợ để được xử lý.',
      },
      {
        question: 'Tôi có thể sử dụng mã giảm giá như thế nào?',
        answer:
          'Khi thanh toán, bạn sẽ thấy ô nhập mã giảm giá. Nhập mã và nhấn "Áp dụng" để được giảm giá. Mỗi đơn hàng chỉ được sử dụng một mã giảm giá.',
      },
    ],
  },
  {
    category: 'Giao hàng',
    id: 'giao-hàng',
    questions: [
      {
        question: 'Thời gian giao hàng là bao lâu?',
        answer:
          'Đối với thiệp điện tử, bạn sẽ nhận được ngay sau khi thanh toán thành công. Đối với thiệp in, thời gian giao hàng từ 3-5 ngày làm việc tùy thuộc vào địa điểm giao hàng.',
      },
      {
        question: 'Tôi có thể theo dõi đơn hàng không?',
        answer:
          'Có, sau khi đơn hàng được xác nhận, bạn sẽ nhận được mã theo dõi qua email và có thể theo dõi trạng thái đơn hàng trong tài khoản của mình tại mục "Đơn hàng".',
      },
      {
        question: 'Phí vận chuyển được tính như thế nào?',
        answer:
          'Phí vận chuyển được tính dựa trên trọng lượng, kích thước và địa điểm giao hàng. Chúng tôi có chương trình miễn phí vận chuyển cho đơn hàng trên 500.000đ.',
      },
      {
        question: 'Có giao hàng vào cuối tuần không?',
        answer:
          'Chúng tôi giao hàng từ thứ 2 đến thứ 7. Chủ nhật và ngày lễ sẽ được chuyển sang ngày làm việc tiếp theo.',
      },
    ],
  },
  {
    category: 'Đơn hàng',
    id: 'đơn-hàng',
    questions: [
      {
        question: 'Làm thế nào để hủy đơn hàng?',
        answer:
          'Bạn có thể hủy đơn hàng trong vòng 24 giờ sau khi đặt nếu đơn hàng chưa được xử lý. Vào mục "Đơn hàng" trong tài khoản, chọn đơn hàng cần hủy và nhấn "Hủy đơn hàng".',
      },
      {
        question: 'Tôi có thể thay đổi địa chỉ giao hàng không?',
        answer:
          'Bạn có thể thay đổi địa chỉ giao hàng trước khi đơn hàng được gửi đi. Liên hệ với bộ phận hỗ trợ hoặc cập nhật trong phần quản lý đơn hàng.',
      },
      {
        question: 'Đơn hàng của tôi bị chậm, tôi phải làm gì?',
        answer: `Nếu đơn hàng của bạn bị chậm quá thời gian dự kiến, vui lòng kiểm tra trạng thái đơn hàng hoặc liên hệ hotline ${CONTACT_INFO.phone} để được hỗ trợ.`,
      },
    ],
  },
  {
    category: 'Tài khoản',
    id: 'tài-khoản',
    questions: [
      {
        question: 'Làm thế nào để đăng ký tài khoản?',
        answer:
          'Bạn có thể đăng ký bằng cách nhấp vào nút "Đăng ký" ở góc trên bên phải, điền thông tin email, mật khẩu và xác nhận email. Quá trình này chỉ mất vài phút.',
      },
      {
        question: 'Tôi quên mật khẩu, làm sao để lấy lại?',
        answer:
          'Bạn có thể nhấp vào "Quên mật khẩu" ở trang đăng nhập, nhập email của mình và làm theo hướng dẫn trong email để đặt lại mật khẩu mới.',
      },
      {
        question: 'Tôi có thể thay đổi thông tin tài khoản không?',
        answer:
          'Có, bạn có thể cập nhật thông tin cá nhân, địa chỉ giao hàng và các cài đặt khác trong phần "Hồ sơ" của tài khoản.',
      },
      {
        question: 'Làm sao để xóa tài khoản của tôi?',
        answer: `Nếu bạn muốn xóa tài khoản, vui lòng liên hệ với bộ phận hỗ trợ qua email ${CONTACT_INFO.supportEmail}. Lưu ý rằng việc xóa tài khoản là không thể hoàn tác.`,
      },
    ],
  },
];

export function HelpFAQ() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = searchQuery.trim()
    ? faqs
        .map(category => ({
          ...category,
          questions: category.questions.filter(
            q =>
              q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              q.answer.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        }))
        .filter(category => category.questions.length > 0)
    : faqs;

  return (
    <section id="faq-section" className="from-muted/30 to-background bg-linear-to-b py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Câu hỏi thường gặp
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Tìm câu trả lời nhanh cho các câu hỏi phổ biến nhất.
          </p>

          {/* Search in FAQ */}
          <div className="relative mx-auto max-w-md">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Tìm kiếm trong FAQ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="mx-auto max-w-4xl space-y-8">
          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                Không tìm thấy kết quả cho &quot;{searchQuery}&quot;. Vui lòng thử từ khóa khác hoặc{' '}
                <Link href="/contact" className="text-primary hover:underline">
                  liên hệ với chúng tôi
                </Link>
                .
              </p>
            </div>
          ) : (
            filteredFaqs.map((category, categoryIndex) => (
              <div key={categoryIndex} id={category.id}>
                <h3 className="text-foreground mb-6 text-2xl font-semibold">{category.category}</h3>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem
                      key={faqIndex}
                      value={`item-${categoryIndex}-${faqIndex}`}
                      className="data-[state=open]:border-primary/50 rounded-lg border-2 px-4"
                    >
                      <AccordionTrigger className="text-left font-semibold hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
