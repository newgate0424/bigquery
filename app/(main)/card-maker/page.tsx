import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CardMaker() {
  return (
    <div className="min-h-screen p-6">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎫 Card Maker Studio
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Passport Card */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-6">🛂 หนังสือเดินทาง</h2>
                <Link href="/card-maker/passport">
                  <Button className="w-full text-lg py-3">
                    เริ่มสร้าง
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Driving License Card */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-300 opacity-75">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-6">🚗 ใบขับขี่</h2>
                <Button className="w-full text-lg py-3" variant="outline" disabled>
                  กำลังพัฒนา
                </Button>
              </CardContent>
            </Card>

            {/* ID Card */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-300 opacity-75">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-6">🆔 บัตรประชาชน</h2>
                <Button className="w-full text-lg py-3" variant="outline" disabled>
                  กำลังพัฒนา
                </Button>
              </CardContent>
            </Card>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
