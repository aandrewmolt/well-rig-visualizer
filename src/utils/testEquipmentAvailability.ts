// Test script to verify equipment availability logic

export const testEquipmentAvailability = () => {
  // Simulated data matching the issue
  const equipmentItems = [
    { id: 'pg001', typeId: 'pressure-gauge-1502', locationId: 'midland-office', quantity: 4, status: 'available' }
  ];
  
  const individualEquipment = [
    // Customer Computers CC01-CC18
    ...Array.from({ length: 18 }, (_, i) => ({
      id: `cc-${i + 1}`,
      equipmentId: `CC${(i + 1).toString().padStart(2, '0')}`,
      typeId: 'customer-computer',
      locationId: 'midland-office',
      status: 'available'
    })),
    // Starlink SL01-SL09
    ...Array.from({ length: 9 }, (_, i) => ({
      id: `sl-${i + 1}`,
      equipmentId: `SL${(i + 1).toString().padStart(2, '0')}`,
      typeId: 'starlink',
      locationId: 'midland-office',
      status: 'available'
    }))
  ];
  
  // Test availability check logic
  const checkAvailability = (typeId: string, locationId: string) => {
    // Check bulk equipment
    const availableBulk = equipmentItems
      .filter(item => 
        item.typeId === typeId && 
        item.locationId === locationId && 
        item.status === 'available'
      )
      .reduce((sum, item) => sum + item.quantity, 0);
    
    // Check individual equipment
    const availableIndividual = individualEquipment
      .filter(item => 
        item.typeId === typeId && 
        item.locationId === locationId && 
        item.status === 'available'
      )
      .length;
    
    const total = availableBulk + availableIndividual;
    
    console.log(`Type: ${typeId}, Location: ${locationId}`);
    console.log(`  Bulk: ${availableBulk}, Individual: ${availableIndividual}, Total: ${total}`);
    
    return total;
  };
  
  // Test cases
  console.log('=== Equipment Availability Test ===');
  console.log('Testing at midland-office location:');
  
  checkAvailability('pressure-gauge-1502', 'midland-office');
  checkAvailability('customer-computer', 'midland-office');
  checkAvailability('starlink', 'midland-office');
  checkAvailability('y-adapter', 'midland-office');
  
  console.log('\nTesting at wrong location:');
  checkAvailability('customer-computer', 'warehouse');
  
  console.log('\nTesting with wrong type IDs (old numeric IDs):');
  checkAvailability('7', 'midland-office'); // Old pressure gauge ID
  checkAvailability('11', 'midland-office'); // Old customer computer ID
  checkAvailability('10', 'midland-office'); // Old starlink ID
};