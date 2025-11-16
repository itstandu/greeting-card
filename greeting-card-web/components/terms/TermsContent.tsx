import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const sections = [
  {
    title: '1. Chấp nhận điều khoản',
    content: `Bằng việc truy cập và sử dụng dịch vụ của Greeting Card, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý tuân thủ các điều khoản và điều kiện này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.`,
  },
  {
    title: '2. Định nghĩa',
    content: `"Dịch vụ" đề cập đến website, ứng dụng và các dịch vụ được cung cấp bởi Greeting Card. "Người dùng" hoặc "Bạn" đề cập đến cá nhân hoặc tổ chức truy cập hoặc sử dụng dịch vụ. "Nội dung" bao gồm tất cả văn bản, hình ảnh, video, âm thanh và các tài liệu khác trên dịch vụ.`,
  },
  {
    title: '3. Sử dụng dịch vụ',
    content: `Bạn được phép sử dụng dịch vụ của chúng tôi cho mục đích hợp pháp và phù hợp với các điều khoản này. Bạn không được sử dụng dịch vụ để:
- Vi phạm bất kỳ luật pháp hoặc quy định nào
- Xâm phạm quyền của người khác
- Gửi hoặc truyền nội dung bất hợp pháp, có hại, đe dọa, lạm dụng, quấy rối hoặc vi phạm
- Tạo hoặc phát tán virus, malware hoặc mã độc hại
- Thu thập thông tin cá nhân của người dùng khác mà không có sự đồng ý`,
  },
  {
    title: '4. Tài khoản người dùng',
    content: `Khi tạo tài khoản, bạn có trách nhiệm:
- Cung cấp thông tin chính xác, đầy đủ và cập nhật
- Bảo mật mật khẩu và thông tin đăng nhập
- Thông báo ngay cho chúng tôi nếu phát hiện bất kỳ hoạt động trái phép nào
- Chịu trách nhiệm cho tất cả các hoạt động diễn ra dưới tài khoản của bạn`,
  },
  {
    title: '5. Quyền sở hữu trí tuệ',
    content: `Tất cả nội dung trên dịch vụ, bao gồm nhưng không giới hạn ở văn bản, đồ họa, logo, hình ảnh, video, phần mềm, là tài sản của Greeting Card hoặc các bên cấp phép và được bảo vệ bởi luật bản quyền và các luật sở hữu trí tuệ khác. Bạn không được sao chép, phân phối, sửa đổi hoặc tạo tác phẩm phái sinh từ nội dung mà không có sự cho phép bằng văn bản của chúng tôi.`,
  },
  {
    title: '6. Thanh toán và hoàn tiền',
    content: `Khi mua sản phẩm hoặc dịch vụ:
- Bạn đồng ý thanh toán đúng số tiền và phí được hiển thị
- Tất cả giá đều được tính bằng VNĐ và có thể thay đổi mà không cần thông báo trước
- Chúng tôi có chính sách hoàn tiền trong vòng 7 ngày nếu bạn không hài lòng với sản phẩm
- Yêu cầu hoàn tiền phải được gửi qua email hoặc form liên hệ`,
  },
  {
    title: '7. Giới hạn trách nhiệm',
    content: `Greeting Card không chịu trách nhiệm cho bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên, đặc biệt hoặc hậu quả nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ của chúng tôi. Chúng tôi không đảm bảo rằng dịch vụ sẽ luôn hoạt động không gián đoạn, an toàn hoặc không có lỗi.`,
  },
  {
    title: '8. Chấm dứt dịch vụ',
    content: `Chúng tôi có quyền chấm dứt hoặc tạm ngưng quyền truy cập của bạn vào dịch vụ ngay lập tức, mà không cần thông báo trước, nếu bạn vi phạm bất kỳ điều khoản nào. Sau khi chấm dứt, quyền sử dụng của bạn sẽ ngay lập tức chấm dứt và bạn phải ngừng sử dụng dịch vụ.`,
  },
  {
    title: '9. Thay đổi điều khoản',
    content: `Chúng tôi có quyền sửa đổi các điều khoản này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực ngay sau khi được đăng tải trên trang này. Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi được coi là bạn đã chấp nhận các điều khoản mới.`,
  },
  {
    title: '10. Luật áp dụng',
    content: `Các điều khoản này được điều chỉnh bởi và giải thích theo luật pháp Việt Nam. Mọi tranh chấp phát sinh sẽ được giải quyết tại tòa án có thẩm quyền tại Việt Nam.`,
  },
];

export function TermsContent() {
  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <Card key={index} className="border-2">
                <CardHeader>
                  <CardTitle className="text-foreground text-xl font-semibold">
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </CardContent>
                {index < sections.length - 1 && <Separator className="my-4" />}
              </Card>
            ))}
          </div>

          {/* Contact Section */}
          <Card className="border-primary/20 mt-12 border-2">
            <CardHeader>
              <CardTitle className="text-foreground text-xl font-semibold">
                Câu hỏi về điều khoản?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi:
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-foreground font-medium">Email:</span>{' '}
                  <a
                    href="mailto:legal@greetingcard.vn"
                    className="text-primary hover:text-primary/80 transition-colors hover:underline"
                  >
                    legal@greetingcard.vn
                  </a>
                </p>
                <p>
                  <span className="text-foreground font-medium">Điện thoại:</span>{' '}
                  <a
                    href="tel:19001234"
                    className="text-primary hover:text-primary/80 transition-colors hover:underline"
                  >
                    1900 1234
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
