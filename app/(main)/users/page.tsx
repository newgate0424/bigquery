import React from 'react';
import UserManagement from '@/components/UserManagement';
import { Card } from "@/components/ui/card";

export default function UsersPage() {
  return (
    <div className="h-screen p-4 sm:p-6">
      <Card className="h-full overflow-hidden">
        <div className="h-full overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            <UserManagement />
          </div>
        </div>
      </Card>
    </div>
  );
}
