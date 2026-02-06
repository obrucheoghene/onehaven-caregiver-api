/**
 * Seed Script
 *
 * This script demonstrates:
 * 1. Creating a sample caregiver
 * 2. Adding 3 protected members concurrently
 * 3. Logging emitted real-time events
 *
 * Usage: npm run seed
 *
 * Note: Make sure the server is running before executing this script
 */

import dotenv from "dotenv";
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

interface AuthResponse {
  token: string;
  caregiver: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

interface ProtectedMember {
  id: string;
  caregiverId: string;
  firstName: string;
  lastName: string;
  relationship: string;
  birthYear: number;
  status: string;
  createdAt: string;
}

// Generate a unique email for testing
const generateUniqueEmail = (): string => {
  const timestamp = Date.now();
  return `test.caregiver.${timestamp}@onhaven.com`;
};

// Helper to make API requests
async function apiRequest<T>(
  endpoint: string,
  method: string = "GET",
  body?: object,
  token?: string,
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return response.json() as Promise<ApiResponse<T>>;
}

// Create a sample caregiver
async function createCaregiver(): Promise<{
  token: string;
  caregiverId: string;
}> {
  console.log("\nStep 1: Creating sample caregiver...\n");

  const email = generateUniqueEmail();
  const signupData = {
    name: "Juliet Ferguson",
    email,
    password: "StrongPassword123!",
  };

  const response = await apiRequest<AuthResponse>(
    "/api/caregivers/signup",
    "POST",
    signupData,
  );

  if (!response.success || !response.data) {
    throw new Error(`Failed to create caregiver: ${response.error?.message}`);
  }

  console.log(`✅ Caregiver created successfully!`);
  console.log(`   ID: ${response.data.caregiver.id}`);
  console.log(`   Name: ${response.data.caregiver.name}`);
  console.log(`   Email: ${response.data.caregiver.email}`);

  return {
    token: response.data.token,
    caregiverId: response.data.caregiver.id,
  };
}

// Add protected members concurrently
async function addProtectedMembersConcurrently(token: string): Promise<void> {
  console.log("\nStep 2: Adding 3 protected members concurrently...\n");

  const members = [
    {
      firstName: "Tommy",
      lastName: "Ferguson",
      relationship: "Son",
      birthYear: 2015,
      status: "active",
    },
    {
      firstName: "Sarah",
      lastName: "Ferguson",
      relationship: "Daughter",
      birthYear: 2018,
      status: "active",
    },
    {
      firstName: "Robert",
      lastName: "Ferguson",
      relationship: "Parent",
      birthYear: 1955,
      status: "active",
    },
  ];

  // Create all members concurrently using Promise.all
  const results = await Promise.all(
    members.map((member) =>
      apiRequest<ProtectedMember>(
        "/api/protected-members",
        "POST",
        member,
        token,
      ),
    ),
  );

  console.log("📋 Results:\n");
  results.forEach((result, index) => {
    if (result.success && result.data) {
      console.log(
        `   ✅ Member ${index + 1}: ${result.data.firstName} ${result.data.lastName} (${result.data.relationship})`,
      );
      console.log(`      ID: ${result.data.id}`);
    } else {
      console.log(
        `   ❌ Member ${index + 1}: Failed - ${result.error?.message}`,
      );
    }
  });
}

// List all protected members
async function listProtectedMembers(token: string): Promise<void> {
  console.log("\n📜 Step 3: Listing all protected members...\n");

  const response = await apiRequest<ProtectedMember[]>(
    "/api/protected-members",
    "GET",
    undefined,
    token,
  );

  if (!response.success || !response.data) {
    throw new Error(`Failed to list members: ${response.error?.message}`);
  }

  console.log(`Found ${response.data.length} protected members:\n`);
  response.data.forEach((member, index) => {
    console.log(`   ${index + 1}. ${member.firstName} ${member.lastName}`);
    console.log(`      Relationship: ${member.relationship}`);
    console.log(`      Birth Year: ${member.birthYear}`);
    console.log(`      Status: ${member.status}`);
    console.log("");
  });
}

// Main execution
async function main(): Promise<void> {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("     OneHaven Caregiver API - Seed Script");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`\nTarget API: ${API_BASE_URL}`);
  console.log("\n⚠️  Note: Check the server console for real-time event logs!");

  try {
    // Step 1: Create caregiver
    const { token } = await createCaregiver();

    // Step 2: Add protected members concurrently
    await addProtectedMembersConcurrently(token);

    // Step 3: List all members to verify
    await listProtectedMembers(token);

    console.log(
      "\n═══════════════════════════════════════════════════════════",
    );
    console.log("     Seed completed successfully!");
    console.log(
      "═══════════════════════════════════════════════════════════\n",
    );
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  }
}

main();
