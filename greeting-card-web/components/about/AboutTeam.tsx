import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Github, Linkedin, Mail } from 'lucide-react';

const teamMembers = [
  {
    name: 'Tấn Dự',
    role: 'Developer',
    description: 'Phát triển và xây dựng nền tảng Greeting Card với đam mê công nghệ.',
    initials: 'TD',
    email: 'tandu542003@gmail.com',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com/itstandu',
  },
  {
    name: 'Trọng Hậu',
    role: 'Developer',
    description: 'Chuyên gia phát triển phần mềm, đảm bảo chất lượng và hiệu suất ứng dụng.',
    initials: 'TH',
    email: 'phantronghau.dev@gmail.com',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com/Phan-Trong-Hau',
  },
  {
    name: 'Trung Hân',
    role: 'Developer',
    description: 'Xây dựng và tối ưu hóa trải nghiệm người dùng trên nền tảng Greeting Card.',
    initials: 'TH',
    email: 'letrunghan1692003@gmail.com',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com/LeTrungHan',
  },
  {
    name: 'Đức Hải',
    role: 'Developer',
    description: 'Phát triển các tính năng mới và đảm bảo hệ thống hoạt động ổn định.',
    initials: 'ĐH',
    email: 'buiduchai276@gmail.com',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com/BDucHai-dev',
  },
];

export function AboutTeam() {
  return (
    <section className="from-muted/30 to-background bg-gradient-to-b py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Đội ngũ của chúng tôi
          </h2>
          <p className="text-muted-foreground text-lg">
            Những con người tài năng và tận tâm đang xây dựng tương lai của Greeting Card.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, index) => (
            <Card
              key={index}
              className="hover:border-primary/50 border-2 transition-all hover:shadow-xl"
            >
              <CardContent className="p-6 text-center">
                <Avatar className="mx-auto mb-4 h-24 w-24">
                  <AvatarFallback className="from-primary to-accent-foreground text-primary-foreground bg-gradient-to-br text-2xl font-bold">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-foreground mb-1 text-lg font-semibold">{member.name}</h3>
                <p className="text-primary mb-3 text-sm font-medium">{member.role}</p>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {member.description}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <a
                    href={`mailto:${member.email}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Email"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="GitHub"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
