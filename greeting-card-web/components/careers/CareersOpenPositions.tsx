'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Clock, MapPin } from 'lucide-react';

type Position = {
  id: number;
  title: string;
  department: string;
  location: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  experience: string;
  description: string;
};

const positions: Position[] = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Hà Nội / Remote',
    type: 'FULL_TIME',
    experience: '3-5 năm',
    description:
      'Chúng tôi đang tìm kiếm một Senior Frontend Developer có kinh nghiệm với React, Next.js và TypeScript để phát triển các tính năng mới cho nền tảng.',
  },
  {
    id: 2,
    title: 'UI/UX Designer',
    department: 'Design',
    location: 'TP. Hồ Chí Minh',
    type: 'FULL_TIME',
    experience: '2-4 năm',
    description:
      'Tạo ra những thiết kế đẹp mắt và trải nghiệm người dùng tuyệt vời. Làm việc với team product để phát triển các tính năng mới.',
  },
  {
    id: 3,
    title: 'Backend Developer',
    department: 'Engineering',
    location: 'Hà Nội / Remote',
    type: 'FULL_TIME',
    experience: '2-4 năm',
    description:
      'Phát triển và duy trì các API, microservices sử dụng Java Spring Boot. Làm việc với database và cloud infrastructure.',
  },
  {
    id: 4,
    title: 'Product Manager',
    department: 'Product',
    location: 'Hà Nội',
    type: 'FULL_TIME',
    experience: '3-5 năm',
    description:
      'Định hướng chiến lược sản phẩm, làm việc với các team để phát triển roadmap và đảm bảo sản phẩm đáp ứng nhu cầu khách hàng.',
  },
  {
    id: 5,
    title: 'Marketing Specialist',
    department: 'Marketing',
    location: 'TP. Hồ Chí Minh',
    type: 'FULL_TIME',
    experience: '1-3 năm',
    description:
      'Phát triển và thực hiện các chiến dịch marketing, quản lý social media và tối ưu hóa conversion rate.',
  },
  {
    id: 6,
    title: 'Intern - Software Engineering',
    department: 'Engineering',
    location: 'Hà Nội',
    type: 'INTERNSHIP',
    experience: 'Sinh viên',
    description:
      'Cơ hội thực tập cho sinh viên năm 3-4, học hỏi và làm việc với các công nghệ hiện đại trong môi trường chuyên nghiệp.',
  },
];

const typeLabels: Record<Position['type'], string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  CONTRACT: 'Hợp đồng',
  INTERNSHIP: 'Thực tập',
};

const typeVariants: Record<Position['type'], 'default' | 'secondary' | 'outline'> = {
  FULL_TIME: 'default',
  PART_TIME: 'secondary',
  CONTRACT: 'outline',
  INTERNSHIP: 'secondary',
};

export function CareersOpenPositions() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const departments = ['all', ...Array.from(new Set(positions.map(p => p.department)))];

  const filteredPositions =
    selectedDepartment === 'all'
      ? positions
      : positions.filter(p => p.department === selectedDepartment);

  return (
    <section className="from-muted/30 to-background bg-gradient-to-b py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Vị trí đang tuyển dụng
          </h2>
          <p className="text-muted-foreground text-lg">
            Khám phá các cơ hội nghề nghiệp và tìm vị trí phù hợp với bạn.
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          {departments.map(dept => (
            <Button
              key={dept}
              variant={selectedDepartment === dept ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDepartment(dept)}
              className="rounded-full"
            >
              {dept === 'all' ? 'Tất cả' : dept}
            </Button>
          ))}
        </div>

        {/* Positions Grid */}
        {filteredPositions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Hiện tại không có vị trí nào phù hợp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPositions.map(position => (
              <Card
                key={position.id}
                className="hover:border-primary/50 flex flex-col border-2 transition-all hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-3 flex items-start justify-between">
                    <Badge variant={typeVariants[position.type]} className="rounded-full">
                      {typeLabels[position.type]}
                    </Badge>
                    <Badge variant="outline" className="rounded-full">
                      {position.department}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{position.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {position.description}
                  </p>
                  <div className="space-y-2">
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{position.location}</span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{position.experience}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full rounded-full" asChild>
                    <a href={`mailto:careers@greetingcard.vn?subject=Ứng tuyển: ${position.title}`}>
                      Ứng tuyển ngay
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
