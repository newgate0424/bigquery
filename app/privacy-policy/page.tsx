import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Cookie, Eye, Lock, FileText, Mail } from 'lucide-react';

export const metadata = {
  title: 'นโยบายความเป็นส่วนตัว - BigQuery Dashboard',
  description: 'นโยบายความเป็นส่วนตัวและการใช้คุกกี้ของ BigQuery Dashboard',
};

export default function PrivacyPolicyPage() {
  const currentDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              นโยบายความเป็นส่วนตัว
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              BigQuery Dashboard - อัปเดตล่าสุด: {currentDate}
            </p>
          </CardHeader>
        </Card>

        {/* Introduction */}
        <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-500" />
              บทนำ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              บริษัทของเราให้ความสำคัญกับความเป็นส่วนตัวของผู้ใช้งาน นโยบายฉบับนี้อธิบายถึงวิธีการที่เราเก็บรวบรวม 
              ใช้งาน และปกป้องข้อมูลส่วนบุคคลของท่านเมื่อใช้บริการ BigQuery Dashboard
            </p>
            <p>
              การใช้เว็บไซต์นี้ถือว่าท่านยอมรับเงื่อนไขในนโยบายความเป็นส่วนตัวนี้
            </p>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-green-500" />
              ข้อมูลที่เราเก็บรวบรวม
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">1. ข้อมูลที่ท่านให้ไว้โดยตรง</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>ข้อมูลการเข้าสู่ระบบ (อีเมล, รหัสผ่าน)</li>
                <li>ข้อมูลโปรไฟล์ผู้ใช้</li>
                <li>ข้อมูลการติดต่อ</li>
                <li>ข้อมูลการตั้งค่าและความชอบ</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">2. ข้อมูลที่เก็บอัตโนมัติ</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>ที่อยู่ IP และข้อมูลการเชื่อมต่อ</li>
                <li>ข้อมูลเบราว์เซอร์และอุปกรณ์</li>
                <li>ข้อมูลการใช้งานเว็บไซต์</li>
                <li>บันทึกการเข้าถึงและความผิดพลาด</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">3. ข้อมูลจากบุคคลที่สาม</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>ข้อมูลจากบริการ Google Analytics</li>
                <li>ข้อมูลจากระบบ BigQuery</li>
                <li>ข้อมูลจากบริการคลาวด์</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Policy */}
        <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Cookie className="h-5 w-5 text-orange-500" />
              นโยบายการใช้คุกกี้
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              เว็บไซต์ของเราใช้คุกกี้เพื่อปรับปรุงประสบการณ์การใช้งานและให้บริการที่ดีขึ้น
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50/70 dark:bg-gray-700/40 rounded-lg">
                <h5 className="font-semibold text-green-700 dark:text-green-400 mb-2">คุกกี้จำเป็น</h5>
                <p className="text-sm">จำเป็นสำหรับการทำงานพื้นฐานของเว็บไซต์ เช่น การเข้าสู่ระบบและความปลอดภัย</p>
              </div>
              
              <div className="p-4 bg-gray-50/70 dark:bg-gray-700/40 rounded-lg">
                <h5 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">คุกกี้การวิเคราะห์</h5>
                <p className="text-sm">ช่วยให้เราเข้าใจการใช้งานเว็บไซต์และปรับปรุงประสิทธิภาพ</p>
              </div>
              
              <div className="p-4 bg-gray-50/70 dark:bg-gray-700/40 rounded-lg">
                <h5 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">คุกกี้การตลาด</h5>
                <p className="text-sm">ใช้เพื่อแสดงโฆษณาและเนื้อหาที่เกี่ยวข้องกับความสนใจ</p>
              </div>
              
              <div className="p-4 bg-gray-50/70 dark:bg-gray-700/40 rounded-lg">
                <h5 className="font-semibold text-indigo-700 dark:text-indigo-400 mb-2">คุกกี้การตั้งค่า</h5>
                <p className="text-sm">จำการตั้งค่าและความชอบ เช่น ธีม ภาษา และการแสดงผล</p>
              </div>
            </div>

            <div className="bg-yellow-50/70 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>หมายเหตุ:</strong> ท่านสามารถจัดการการตั้งค่าคุกกี้ได้ในหน้าการตั้งค่า 
                หรือผ่านการตั้งค่าเบราว์เซอร์ของท่าน
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Usage */}
        <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-red-500" />
              การใช้ข้อมูลและการรักษาความปลอดภัย
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">เราใช้ข้อมูลของท่านเพื่อ:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>ให้บริการและดูแลระบบ</li>
                <li>ปรับปรุงประสบการณ์การใช้งาน</li>
                <li>วิเคราะห์และพัฒนาฟีเจอร์ใหม่</li>
                <li>ติดต่อสื่อสารและให้การสนับสนุน</li>
                <li>รับรองความปลอดภัยและป้องกันการใช้งานผิดวัตถุประสงค์</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">มาตรการความปลอดภัย:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>เข้ารหัสข้อมูลทั้งในการส่งและจัดเก็บ</li>
                <li>ควบคุมการเข้าถึงด้วยระบบยืนยันตัวตน</li>
                <li>สำรองข้อมูลและระบบกู้คืน</li>
                <li>ตรวจสอบและอัปเดตความปลอดภัยอย่างสม่ำเสมอ</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Rights */}
        <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-500" />
              สิทธิของผู้ใช้ข้อมูล
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>ท่านมีสิทธิในการ:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="p-3 bg-blue-50/70 dark:bg-blue-900/20 rounded-lg">
                  <h5 className="font-semibold text-blue-700 dark:text-blue-400">เข้าถึงข้อมูล</h5>
                  <p className="text-sm">ขอดูข้อมูลส่วนบุคคลที่เราเก็บไว้</p>
                </div>
                
                <div className="p-3 bg-green-50/70 dark:bg-green-900/20 rounded-lg">
                  <h5 className="font-semibold text-green-700 dark:text-green-400">แก้ไขข้อมูล</h5>
                  <p className="text-sm">ขอให้แก้ไขข้อมูลที่ไม่ถูกต้อง</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="p-3 bg-red-50/70 dark:bg-red-900/20 rounded-lg">
                  <h5 className="font-semibold text-red-700 dark:text-red-400">ลบข้อมูล</h5>
                  <p className="text-sm">ขอให้ลบข้อมูลส่วนบุคคล</p>
                </div>
                
                <div className="p-3 bg-purple-50/70 dark:bg-purple-900/20 rounded-lg">
                  <h5 className="font-semibold text-purple-700 dark:text-purple-400">โอนย้ายข้อมูล</h5>
                  <p className="text-sm">ขอให้โอนข้อมูลในรูปแบบที่อ่านได้</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-indigo-500" />
              ติดต่อเรา
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 dark:text-gray-300">
            <p className="mb-4">
              หากท่านมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ กรุณาติดต่อเราผ่าน:
            </p>
            <div className="space-y-2">
              <p><strong>อีเมล:</strong> privacy@bigquery-dashboard.com</p>
              <p><strong>โทรศัพท์:</strong> 02-xxx-xxxx</p>
              <p><strong>ที่อยู่:</strong> กรุงเทพมหานคร, ประเทศไทย</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          <p>© 2025 BigQuery Dashboard. สงวนสิทธิ์ทั้งหมด.</p>
          <p className="mt-1">นโยบายนี้อาจมีการปรับปรุงเปลี่ยนแปลง กรุณาตรวจสอบอย่างสม่ำเสมอ</p>
        </div>
      </div>
    </div>
  );
}