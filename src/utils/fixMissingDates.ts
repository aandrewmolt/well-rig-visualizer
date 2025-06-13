import { supabase } from '@/integrations/supabase/client';

export async function fixMissingJobDates() {
  try {
    console.log('Fetching jobs with missing dates...');
    
    // Get all jobs with missing created_at or updated_at
    const { data: jobs, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .or('created_at.is.null,updated_at.is.null');
    
    if (fetchError) {
      console.error('Error fetching jobs:', fetchError);
      return { success: false, error: fetchError };
    }
    
    if (!jobs || jobs.length === 0) {
      console.log('No jobs with missing dates found');
      return { success: true, updated: 0 };
    }
    
    console.log(`Found ${jobs.length} jobs with missing dates`);
    
    // Set date to 1 week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const dateString = oneWeekAgo.toISOString();
    
    // Update each job
    let updatedCount = 0;
    for (const job of jobs) {
      const updates: any = {};
      
      if (!job.created_at) {
        updates.created_at = dateString;
      }
      if (!job.updated_at) {
        updates.updated_at = dateString;
      }
      
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('jobs')
          .update(updates)
          .eq('id', job.id);
        
        if (updateError) {
          console.error(`Error updating job ${job.id}:`, updateError);
        } else {
          console.log(`Updated job ${job.id} (${job.name}) with dates`);
          updatedCount++;
        }
      }
    }
    
    console.log(`Successfully updated ${updatedCount} jobs with creation dates`);
    return { success: true, updated: updatedCount };
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error };
  }
}

// Function to fix dates for all tables that might have missing dates
export async function fixAllMissingDates() {
  console.log('Starting comprehensive date fix...');
  
  // Fix jobs
  const jobResult = await fixMissingJobDates();
  console.log('Job date fix result:', jobResult);
  
  // You can add more tables here if needed
  // For example: equipment_items, individual_equipment, etc.
  
  return {
    jobs: jobResult
  };
}