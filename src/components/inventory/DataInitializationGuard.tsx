
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Database, CheckCircle } from 'lucide-react';
import { useDefaultDataSetup } from '@/hooks/useDefaultDataSetup';

interface DataInitializationGuardProps {
  children: React.ReactNode;
}

const DataInitializationGuard: React.FC<DataInitializationGuardProps> = ({ children }) => {
  const { isInitializing, hasInitialized, needsInitialization } = useDefaultDataSetup();

  // If still initializing, show loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Setting Up Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating default equipment types and storage locations...</span>
            </div>
            <p className="text-sm text-gray-600">
              This will only happen once during initial setup.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If needs initialization but not currently initializing, show status
  if (needsInitialization && !hasInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Inventory Setup Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Preparing inventory system...</span>
            </div>
            <p className="text-sm text-gray-600">
              Setting up default equipment types and storage locations.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Initialization complete, render children
  return <>{children}</>;
};

export default DataInitializationGuard;
