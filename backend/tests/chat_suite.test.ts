/**
 * BookMyChair - Backend Test Suite for Hackathon Readiness
 * Tests 20+ realistic salon customer messages and edge cases.
 */

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000';

type TestCase = {
  id: number;
  message: string;
  expectedType: string;
  description: string;
  validate?: (res: any) => boolean;
};

const TEST_CASES: TestCase[] = [
  {
    id: 1,
    message: 'haircut kal shaam ko',
    expectedType: 'slots',
    description: 'Haircut tomorrow evening slots',
    validate: (res) => res.type === 'slots' && res.slots?.length > 0 && res.service === 'Haircut'
  },
  {
    id: 2,
    message: 'facial Saturday 5pm',
    expectedType: 'slots',
    description: 'Facial on Saturday around 5pm',
    validate: (res) => res.type === 'slots' && res.slots?.length > 0 && res.service === 'Facial'
  },
  {
    id: 3,
    message: 'haircut tomorrow evening',
    expectedType: 'slots',
    description: 'English haircut tomorrow evening',
    validate: (res) => res.type === 'slots' && res.slots?.length > 0
  },
  {
    id: 4,
    message: 'parso 4 baje facial',
    expectedType: 'slots',
    description: 'Facial day after tomorrow at 4pm',
    validate: (res) => res.type === 'slots' && res.slots?.length > 0
  },
  {
    id: 5,
    message: 'Rohit ke saath haircut chahiye',
    expectedType: 'clarification',
    description: 'Specific stylist without date/time',
    validate: (res) => res.type === 'clarification'
  },
  {
    id: 6,
    message: 'haircut yesterday',
    expectedType: 'clarification|no_availability',
    description: 'Past date rejected safely',
    validate: (res) => res.type === 'clarification' || res.type === 'no_availability'
  },
  {
    id: 7,
    message: 'Sunday 10pm haircut',
    expectedType: 'no_availability',
    description: 'Closed Sunday and outside salon hours',
    validate: (res) => res.type === 'no_availability'
  },
  {
    id: 8,
    message: 'haircut',
    expectedType: 'clarification',
    description: 'Service only, missing date/time',
    validate: (res) => res.type === 'clarification'
  },
  {
    id: 9,
    message: 'kal',
    expectedType: 'clarification',
    description: 'Date only, missing service',
    validate: (res) => res.type === 'clarification'
  },
  {
    id: 10,
    message: 'facial next Friday morning',
    expectedType: 'slots',
    description: 'Facial next Friday morning slots',
    validate: (res) => res.type === 'slots' && res.slots?.length > 0
  },
  {
    id: 11,
    message: 'haircut at 5pm',
    expectedType: 'clarification',
    description: 'Time only, missing date',
    validate: (res) => res.type === 'clarification'
  },
  {
    id: 12,
    message: 'haircut aur facial kal',
    expectedType: 'clarification',
    description: 'Ambiguous multiple services',
    validate: (res) => res.type === 'clarification'
  },
  {
    id: 13,
    message: 'hjaircut tomorow evning',
    expectedType: 'slots',
    description: 'Typo-tolerant: haircut tomorrow evening',
    validate: (res) => res.type === 'slots' && res.slots?.length > 0
  },
  {
    id: 14,
    message: 'Aman haircut kal',
    expectedType: 'slots',
    description: 'Aman haircut tomorrow',
    validate: (res) => res.type === 'slots' && res.slots?.every((s: any) => s.stylistName === 'Aman')
  },
  {
    id: 15,
    message: 'Rohit facial 6pm',
    expectedType: 'clarification',
    description: 'Rohit facial at 6pm missing date',
    validate: (res) => res.type === 'clarification'
  },
  {
    id: 16,
    message: 'cancel my appointment',
    expectedType: 'approval_required',
    description: 'Cancellation requires owner approval',
    validate: (res) => res.type === 'approval_required'
  },
  {
    id: 17,
    message: 'reschedule my appointment to 7pm',
    expectedType: 'approval_required',
    description: 'Reschedule requires owner approval',
    validate: (res) => res.type === 'approval_required'
  },
  {
    id: 18,
    message: 'can I get 20% discount',
    expectedType: 'approval_required',
    description: 'Discount request requires owner approval',
    validate: (res) => res.type === 'approval_required'
  },
  {
    id: 19,
    message: 'book me after closing time',
    expectedType: 'approval_required',
    description: 'Outside hours request requires approval',
    validate: (res) => res.type === 'approval_required'
  },
  {
    id: 20,
    message: 'hello',
    expectedType: 'clarification',
    description: 'Friendly greeting service prompt',
    validate: (res) => res.type === 'clarification'
  },
  {
    id: 21,
    message: '   ',
    expectedType: '400_validation_error',
    description: 'Whitespace/empty message returns HTTP 400',
    validate: (res) => res.httpStatus === 400 || res.type === 'error'
  },
  {
    id: 22,
    message: 'Suresh ke saath haircut kal',
    expectedType: 'clarification',
    description: 'Unknown stylist asks clarification',
    validate: (res) => res.type === 'clarification'
  },
  {
    id: 23,
    message: 'car wash kal',
    expectedType: 'clarification',
    description: 'Unsupported service asks clarification',
    validate: (res) => res.type === 'clarification'
  },
  {
    id: 24,
    message: 'haircut on 2020-01-01',
    expectedType: 'no_availability|clarification',
    description: 'Historic past date rejected safely',
    validate: (res) => res.type === 'no_availability' || res.type === 'clarification'
  }
];

async function runTests() {
  console.log('========================================================================');
  console.log('BookMyChair API Test Suite - 25 Comprehensive Test Cases');
  console.log(`Target: ${BASE_URL}`);
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;
  const results: Array<{
    id: number;
    message: string;
    expected: string;
    actual: string;
    status: 'PASS' | 'FAIL';
  }> = [];

  // Run chat test cases
  for (const tc of TEST_CASES) {
    try {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: tc.message })
      });

      const body: any = await response.json();
      body.httpStatus = response.status;

      const isExpected = tc.validate ? tc.validate(body) : body.type === tc.expectedType;
      const actualType = body.httpStatus === 400 ? '400_validation_error' : body.type;

      if (isExpected) {
        passed++;
        results.push({
          id: tc.id,
          message: tc.message,
          expected: tc.expectedType,
          actual: actualType,
          status: 'PASS'
        });
      } else {
        failed++;
        results.push({
          id: tc.id,
          message: tc.message,
          expected: tc.expectedType,
          actual: actualType,
          status: 'FAIL'
        });
      }
    } catch (err: any) {
      failed++;
      results.push({
        id: tc.id,
        message: tc.message,
        expected: tc.expectedType,
        actual: `ERROR: ${err.message}`,
        status: 'FAIL'
      });
    }
  }

  // Edge case 25: Duplicate booking detection (PostgreSQL Exclusion Constraint test)
  console.log('Testing Edge Case 25: Duplicate Booking (Double-booking rejection)...');
  try {
    const dupSlotPayload = {
      customerName: 'Duplicate Test Customer',
      phone: '+919876543299',
      serviceId: 'd015be4f-c11b-4c64-a1af-95511e9afde0',
      stylistId: '7c33d319-cc15-4d92-8eee-d0d40fab8105',
      start: '2026-10-15T04:30:00.000Z', // already booked in earlier test
      end: '2026-10-15T05:00:00.000Z'
    };

    const dupResponse = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dupSlotPayload)
    });

    if (dupResponse.status === 409) {
      passed++;
      results.push({
        id: 25,
        message: 'duplicate booking on same slot',
        expected: '409_conflict',
        actual: '409_conflict',
        status: 'PASS'
      });
    } else {
      failed++;
      results.push({
        id: 25,
        message: 'duplicate booking on same slot',
        expected: '409_conflict',
        actual: `status_${dupResponse.status}`,
        status: 'FAIL'
      });
    }
  } catch (err: any) {
    failed++;
    results.push({
      id: 25,
      message: 'duplicate booking on same slot',
      expected: '409_conflict',
      actual: `ERROR: ${err.message}`,
      status: 'FAIL'
    });
  }

  // Print results table
  console.log('\n| # | Message | Expected | Actual | Status |');
  console.log('|---|---|---|---|---|');
  for (const r of results) {
    console.log(`| ${r.id} | "${r.message}" | ${r.expected} | ${r.actual} | **${r.status}** |`);
  }

  console.log('\n========================================================================');
  console.log(`Total Test Cases: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
