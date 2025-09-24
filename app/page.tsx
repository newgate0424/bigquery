"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Users, Shield, TrendingUp, ArrowRight, Play, CheckCircle, Database, Zap, Globe, Star } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (token && userData) {
          // มี token ให้ redirect ไป overview (หน้าหลัก)
          router.replace("/overview");
        } else {
          // ไม่มี token แสดงหน้า Landing
          setIsChecking(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsChecking(false);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">170sa</span>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            เข้าสู่ระบบ
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-full mb-6">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-blue-300 text-sm font-medium">แพลตฟอร์มวิเคราะห์ข้อมูลระดับมืออาชีพ</span>
              </div>
              
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight mb-8">
                วิเคราะห์ข้อมูล
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  อย่างชาญฉลาด
                </span>
              </h1>
              
              <p className="text-xl text-blue-200 mb-10 leading-relaxed max-w-2xl">
                ระบบจัดการและวิเคราะห์ข้อมูลแบบเรียลไทม์ที่ทรงพลัง ด้วยเทคโนโลยีล้ำสมัย 
                เพื่อการตัดสินใจที่แม่นยำและรวดเร็วที่สุด
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={() => router.push("/login")}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center gap-3"
                >
                  เริ่มใช้งานทันที
                  <Play className="w-6 h-6" />
                </button>
                <button className="border-2 border-blue-400/50 hover:border-blue-400 text-blue-300 hover:text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all backdrop-blur-sm hover:bg-blue-500/20">
                  ดูตัวอย่าง
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">99.9%</div>
                  <div className="text-blue-300 text-sm">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">10M+</div>
                  <div className="text-blue-300 text-sm">Records</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-400 mb-2">24/7</div>
                  <div className="text-blue-300 text-sm">Support</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Dashboard Preview */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div className="ml-auto text-white/60 text-sm font-medium">170sa Dashboard</div>
                </div>
                
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">Analytics Overview</h3>
                    <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 text-xs">Live</span>
                    </div>
                  </div>
                  
                  {/* Chart Area */}
                  <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
                    <div className="relative w-full h-full flex items-end justify-center gap-2 p-6">
                      {[40, 65, 45, 80, 55, 70, 60, 85].map((height, i) => (
                        <div key={i} className="bg-gradient-to-t from-blue-400 to-purple-400 rounded-t-sm opacity-80" 
                             style={{height: `${height}%`, width: '12%'}}></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-500/20 p-4 rounded-xl border border-blue-400/20">
                      <div className="text-2xl font-bold text-blue-400 mb-1">1.2M</div>
                      <div className="text-blue-300 text-sm">Total Views</div>
                    </div>
                    <div className="bg-purple-500/20 p-4 rounded-xl border border-purple-400/20">
                      <div className="text-2xl font-bold text-purple-400 mb-1">85%</div>
                      <div className="text-purple-300 text-sm">Conversion</div>
                    </div>
                    <div className="bg-pink-500/20 p-4 rounded-xl border border-pink-400/20">
                      <div className="text-2xl font-bold text-pink-400 mb-1">$24K</div>
                      <div className="text-pink-300 text-sm">Revenue</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl opacity-60 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-24 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ทำไมต้องเลือก 170sa?
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              เครื่องมือครบครัน เทคโนโลยีล้ำสมัย และประสิทธิภาพสูงสุดในระดับองค์กร
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/20 hover:border-blue-400/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">เรียลไทม์</h3>
              <p className="text-blue-200 leading-relaxed">วิเคราะห์ข้อมูลแบบเรียลไทม์ด้วยประสิทธิภาพสูง</p>
            </div>
            
            <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Big Data</h3>
              <p className="text-blue-200 leading-relaxed">จัดการข้อมูลขนาดใหญ่ได้อย่างมีประสิทธิภาพ</p>
            </div>
            
            <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/20 hover:border-pink-400/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">ปลอดภัย</h3>
              <p className="text-blue-200 leading-relaxed">ระบบรักษาความปลอดภัยระดับองค์กร</p>
            </div>

            <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/20 hover:border-green-400/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">รวดเร็ว</h3>
              <p className="text-blue-200 leading-relaxed">ประสิทธิภาพสูงสุดด้วยเทคโนโลยีล้ำสมัย</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-24">
        <div className="max-w-5xl mx-auto text-center px-6">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-12 border border-white/20">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              พร้อมเริ่มต้นแล้วหรือยัง?
            </h2>
            <p className="text-xl text-blue-200 mb-10 max-w-3xl mx-auto">
              เข้าร่วมกับเราและสัมผัสประสบการณ์การวิเคราะห์ข้อมูลแบบใหม่ที่จะเปลี่ยนวิธีการทำงานของคุณ
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <button
                onClick={() => router.push("/login")}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-2xl flex items-center gap-3"
              >
                เข้าสู่ระบบ
                <ArrowRight className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-3 text-blue-200">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="font-medium">ใช้งานฟรี ไม่มีค่าใช้จ่าย</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 text-blue-300">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <span>เข้าถึงได้ทุกที่</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>ทีมงานมืออาชีพ</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                <span>รายงานแบบเรียลไทม์</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/40 backdrop-blur-xl border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">170sa</span>
          </div>
          <p className="text-blue-300 mb-4">แพลตฟอร์มวิเคราะห์ข้อมูลที่ทรงพลังที่สุด</p>
          <p className="text-blue-400 text-sm">© 2025 170sa. สงวนสิทธิ์ทั้งหมด.</p>
        </div>
      </footer>
    </div>
  );
}
