#!/usr/bin/env tsx

/**
 * Migration script to create missing profiles for existing users
 * 
 * This script:
 * 1. Finds all users in auth.users who don't have profiles
 * 2. Creates profiles for them with basic information
 * 3. Reports the results
 * 
 * Usage: npm run migrate:profiles
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!SUPABASE_URL)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!SUPABASE_SERVICE_KEY)
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface AuthUser {
  id: string
  email: string
  created_at: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
  } | null
}

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string | null
  updated_at: string | null
}

async function migrateProfiles() {
  console.log('🚀 Starting profile migration...')
  
  try {
    // Get all users from auth.users
    console.log('📥 Fetching all users from auth.users...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Failed to fetch auth users:', authError.message)
      process.exit(1)
    }
    
    console.log(`📊 Found ${authUsers.users.length} users in auth.users`)
    
    // Get all existing profiles
    console.log('📥 Fetching existing profiles...')
    const { data: existingProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
    
    if (profileError) {
      console.error('❌ Failed to fetch existing profiles:', profileError.message)
      process.exit(1)
    }
    
    const existingProfileIds = new Set(existingProfiles?.map(p => p.id) || [])
    console.log(`📊 Found ${existingProfileIds.size} existing profiles`)
    
    // Find users without profiles
    const usersWithoutProfiles = authUsers.users.filter(user => !existingProfileIds.has(user.id))
    console.log(`📊 Found ${usersWithoutProfiles.length} users without profiles`)
    
    if (usersWithoutProfiles.length === 0) {
      console.log('✅ All users already have profiles!')
      return
    }
    
    // Create profiles for users without them
    console.log('🔄 Creating missing profiles...')
    const profilesToCreate: Profile[] = []
    
    for (const user of usersWithoutProfiles) {
      const profile: Profile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      profilesToCreate.push(profile)
    }
    
    // Insert profiles in batches
    const batchSize = 100
    let createdCount = 0
    let errorCount = 0
    
    for (let i = 0; i < profilesToCreate.length; i += batchSize) {
      const batch = profilesToCreate.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(batch)
        .select('id')
      
      if (error) {
        console.error(`❌ Failed to create batch ${Math.floor(i / batchSize) + 1}:`, error.message)
        errorCount += batch.length
      } else {
        createdCount += data?.length || 0
        console.log(`✅ Created batch ${Math.floor(i / batchSize) + 1}: ${data?.length || 0} profiles`)
      }
    }
    
    // Report results
    console.log('\n📊 Migration Results:')
    console.log(`   Total users: ${authUsers.users.length}`)
    console.log(`   Existing profiles: ${existingProfileIds.size}`)
    console.log(`   Users without profiles: ${usersWithoutProfiles.length}`)
    console.log(`   Profiles created: ${createdCount}`)
    console.log(`   Errors: ${errorCount}`)
    
    if (errorCount === 0) {
      console.log('✅ Migration completed successfully!')
    } else {
      console.log('⚠️  Migration completed with some errors. Check the logs above.')
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
migrateProfiles()
  .then(() => {
    console.log('🎉 Migration script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error)
    process.exit(1)
  })
