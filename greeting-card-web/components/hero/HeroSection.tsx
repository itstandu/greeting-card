import Image from 'next/image';

const heroImg = '/intro_hero.png';

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center bg-gradient-to-r from-[#f8f9ff] to-[#e6f7ff] px-4 py-12 text-center">
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 rounded-3xl bg-white/30 backdrop-blur-lg" />

      <Image
        src={heroImg}
        alt="Greeting Card illustration"
        width={1200}
        height={600}
        className="w-full max-w-4xl rounded-xl shadow-lg"
        priority
      />

      <div className="absolute z-10 flex flex-col items-center text-center">
        <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-gray-800">
          Gửi Lời Chúc Đầy Ý Nghĩa
        </h1>
        <p className="mt-4 max-w-xl text-lg text-gray-600">
          Tạo, tùy chỉnh và gửi thiệp chúc mừng ngay trong vài giây. Đơn giản, nhanh chóng và đầy
          phong cách.
        </p>
      </div>
    </section>
  );
}
