import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CardMaker() {
  return (
    <div className="min-h-screen p-6">
      <Card className="max-w-6xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🎫 Card Maker Studio
          </CardTitle>
          <p className="text-gray-600 text-lg">
            เครื่องมือสร้างเอกสารจำลองสำหรับการศึกษาและงานออกแบบ
          </p>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm font-medium">
              ⚠️ หมายเหตุ: เอกสารที่สร้างขึ้นเป็นเพียงแบบจำลองเพื่อการศึกษาเท่านั้น ไม่สามารถใช้เป็นเอกสารทางกฎหมายได้
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Passport Card */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-300 hover:scale-105 overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[3/2] bg-gradient-to-br from-blue-50 to-blue-100 p-4 flex items-center justify-center">
                  <img 
                    src="/card/th/th-id.png" 
                    alt="หนังสือเดินทางไทย" 
                    className="w-full h-full object-contain rounded-md shadow-sm"
                  />
                </div>
                <div className="p-6 text-center">
                  <h2 className="text-xl font-bold mb-2">🛂 หนังสือเดินทาง</h2>
                  <p className="text-gray-600 text-sm mb-4">สร้างหนังสือเดินทางไทยแบบจำลอง</p>
                  <Link href="/card-maker/passport">
                    <Button className="w-full text-lg py-2">
                      เริ่มสร้าง
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Driving License Card */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-300 hover:scale-105 overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[3/2] bg-gradient-to-br from-blue-50 to-blue-100 p-4 flex items-center justify-center">
                  <img 
                    src="/card/th/driving.png" 
                    alt="ใบขับขี่ไทย" 
                    className="w-full h-full object-contain rounded-md shadow-sm"
                  />
                </div>
                <div className="p-6 text-center">
                  <h2 className="text-xl font-bold mb-2">🚗 ใบขับขี่</h2>
                  <p className="text-gray-600 text-sm mb-4">สร้างใบขับขี่ไทยแบบจำลอง</p>
                  <Link href="/card-maker/driving-license">
                    <Button className="w-full text-lg py-2 bg-blue-600 hover:bg-blue-700">
                      เริ่มสร้าง
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* ID Card */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-red-300 hover:scale-105 overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[3/2] bg-gradient-to-br from-red-50 to-red-100 p-4 flex items-center justify-center">
                  <img 
                    src="/card/th/idcard.png" 
                    alt="บัตรประชาชนไทย" 
                    className="w-full h-full object-contain rounded-md shadow-sm"
                  />
                </div>
                <div className="p-6 text-center">
                  <h2 className="text-xl font-bold mb-2">🆔 บัตรประชาชน</h2>
                  <p className="text-gray-600 text-sm mb-4">สร้างบัตรประชาชนไทยแบบจำลอง</p>
                  <Link href="/card-maker/id-card">
                    <Button className="w-full text-lg py-2 bg-red-600 hover:bg-red-700">
                      เริ่มสร้าง
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
