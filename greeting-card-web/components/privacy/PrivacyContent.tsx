import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CONTACT_INFO } from '@/lib/constants/contact';

const sections = [
  {
    title: '1. Thông tin chúng tôi thu thập',
    content: `Chúng tôi thu thập các loại thông tin sau đây:

Thông tin cá nhân: Khi bạn đăng ký tài khoản, chúng tôi thu thập tên, email, số điện thoại và các thông tin khác mà bạn cung cấp.

Thông tin giao dịch: Chúng tôi thu thập thông tin về các giao dịch mua hàng của bạn, bao gồm phương thức thanh toán và lịch sử đơn hàng.

Thông tin sử dụng: Chúng tôi tự động thu thập thông tin về cách bạn sử dụng dịch vụ, bao gồm địa chỉ IP, loại trình duyệt, trang bạn truy cập và thời gian truy cập.

Cookies và công nghệ tương tự: Chúng tôi sử dụng cookies và các công nghệ tương tự để cải thiện trải nghiệm của bạn và phân tích cách bạn sử dụng dịch vụ.`,
  },
  {
    title: '2. Cách chúng tôi sử dụng thông tin',
    content: `Chúng tôi sử dụng thông tin thu thập được để:

- Cung cấp, duy trì và cải thiện dịch vụ của chúng tôi
- Xử lý đơn hàng và giao dịch của bạn
- Gửi thông báo, cập nhật và tài liệu quảng cáo (với sự đồng ý của bạn)
- Phản hồi các yêu cầu và câu hỏi của bạn
- Phát hiện, ngăn chặn và giải quyết các vấn đề kỹ thuật hoặc gian lận
- Tuân thủ các nghĩa vụ pháp lý và bảo vệ quyền lợi của chúng tôi`,
  },
  {
    title: '3. Chia sẻ thông tin',
    content: `Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba, ngoại trừ các trường hợp sau:

Nhà cung cấp dịch vụ: Chúng tôi có thể chia sẻ thông tin với các nhà cung cấp dịch vụ đáng tin cậy giúp chúng tôi vận hành dịch vụ (như xử lý thanh toán, giao hàng).

Yêu cầu pháp lý: Chúng tôi có thể tiết lộ thông tin nếu được yêu cầu bởi pháp luật hoặc để bảo vệ quyền lợi, tài sản hoặc an toàn của chúng tôi hoặc người dùng khác.

Với sự đồng ý của bạn: Chúng tôi có thể chia sẻ thông tin trong các trường hợp khác với sự đồng ý rõ ràng của bạn.`,
  },
  {
    title: '4. Bảo mật thông tin',
    content: `Chúng tôi thực hiện các biện pháp bảo mật kỹ thuật và tổ chức phù hợp để bảo vệ thông tin cá nhân của bạn khỏi truy cập trái phép, mất mát, phá hủy hoặc thay đổi. Tuy nhiên, không có phương thức truyền tải qua internet hoặc lưu trữ điện tử nào là 100% an toàn, vì vậy chúng tôi không thể đảm bảo an toàn tuyệt đối.`,
  },
  {
    title: '5. Quyền của bạn',
    content: `Bạn có các quyền sau đây đối với thông tin cá nhân của mình:

- Quyền truy cập: Bạn có quyền yêu cầu truy cập thông tin cá nhân mà chúng tôi lưu trữ về bạn
- Quyền chỉnh sửa: Bạn có thể cập nhật hoặc sửa đổi thông tin cá nhân của mình bất cứ lúc nào
- Quyền xóa: Bạn có thể yêu cầu xóa thông tin cá nhân của mình, với một số ngoại lệ theo quy định pháp luật
- Quyền từ chối: Bạn có thể từ chối việc xử lý thông tin cá nhân của mình cho một số mục đích nhất định
- Quyền di chuyển dữ liệu: Bạn có quyền yêu cầu chuyển dữ liệu của mình sang một dịch vụ khác`,
  },
  {
    title: '6. Cookies và công nghệ theo dõi',
    content: `Chúng tôi sử dụng cookies và các công nghệ tương tự để:

- Ghi nhớ tùy chọn và cài đặt của bạn
- Phân tích cách bạn sử dụng dịch vụ để cải thiện trải nghiệm
- Cung cấp nội dung và quảng cáo phù hợp với sở thích của bạn

Bạn có thể kiểm soát cookies thông qua cài đặt trình duyệt của mình. Tuy nhiên, việc tắt cookies có thể ảnh hưởng đến chức năng của một số tính năng trên dịch vụ.`,
  },
  {
    title: '7. Quyền riêng tư của trẻ em',
    content: `Dịch vụ của chúng tôi không dành cho trẻ em dưới 13 tuổi. Chúng tôi không cố ý thu thập thông tin cá nhân từ trẻ em dưới 13 tuổi. Nếu chúng tôi phát hiện rằng chúng tôi đã thu thập thông tin từ trẻ em dưới 13 tuổi mà không có sự đồng ý của phụ huynh, chúng tôi sẽ xóa thông tin đó ngay lập tức.`,
  },
  {
    title: '8. Thay đổi chính sách bảo mật',
    content: `Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách đăng chính sách mới trên trang này và cập nhật ngày "Cập nhật lần cuối" ở đầu trang. Chúng tôi khuyến khích bạn xem lại chính sách này định kỳ để nắm được cách chúng tôi bảo vệ thông tin của bạn.`,
  },
  {
    title: '9. Liên hệ với chúng tôi',
    content: `Nếu bạn có bất kỳ câu hỏi hoặc mối quan ngại nào về chính sách bảo mật này hoặc cách chúng tôi xử lý thông tin cá nhân của bạn, vui lòng liên hệ với chúng tôi:

Email: ${CONTACT_INFO.privacyEmail}
Điện thoại: ${CONTACT_INFO.phone}
Địa chỉ: ${CONTACT_INFO.address.full}`,
  },
];

export function PrivacyContent() {
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
              </Card>
            ))}
          </div>

          {/* Contact Section */}
          <Card className="border-primary/20 mt-12 border-2">
            <CardHeader>
              <CardTitle className="text-foreground text-xl font-semibold">
                Câu hỏi về quyền riêng tư?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật hoặc muốn thực hiện quyền của
                mình, vui lòng liên hệ với chúng tôi:
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-foreground font-medium">Email:</span>{' '}
                  <a
                    href={`mailto:${CONTACT_INFO.privacyEmail}`}
                    className="text-primary hover:text-primary/80 transition-colors hover:underline"
                  >
                    {CONTACT_INFO.privacyEmail}
                  </a>
                </p>
                <p>
                  <span className="text-foreground font-medium">Điện thoại:</span>{' '}
                  <a
                    href={CONTACT_INFO.phoneLink}
                    className="text-primary hover:text-primary/80 transition-colors hover:underline"
                  >
                    {CONTACT_INFO.phone}
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
