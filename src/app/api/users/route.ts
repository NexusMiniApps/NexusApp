import { NextResponse } from 'next/server';
import { supabase } from '~/lib/supabaseClient';

function bigIntToString(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(bigIntToString);

  const newObj: any = {};
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'bigint') {
      newObj[key] = value.toString();
    } else if (typeof value === 'object') {
      newObj[key] = bigIntToString(value);
    } else {
      newObj[key] = value;
    }
  }
  return newObj;
}

export async function POST(request: Request) {
  try {
    // Parse the request body as JSON
    const body = await request.json();
    const { id, firstName, lastName, username } = body;

    // Log the entire request body for debugging
    console.log('Request Body:', body);

    if (!id || !firstName) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert id to string to handle BigInt values
    const telegramId = id.toString();

    // Try to find the user by telegramId
    const { data, error } = await supabase
      .from('User') // Adjust table name as per your schema
      .select('*')
      .eq('telegramId', telegramId)
      .maybeSingle(); // Use maybeSingle to handle no results

    if (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json(
        { message: 'Error fetching user' },
        { status: 500 }
      );
    }

    // Initialize user variable to store user data
    let user = data;

    // If the user doesn't exist, create a new one
    if (!user) {
      const { data: newUser, error: insertError } = await supabase
        .from('User') // Adjust table name as per your schema
        .insert({
          telegramId: telegramId,
          firstName,
          lastName,
          username,
        })
        .select() // Returns the inserted record
        .single(); // Ensures a single object is returned

      if (insertError) {
        console.error('Error creating user:', insertError);
        return NextResponse.json(
          { message: 'Error creating user' },
          { status: 500 }
        );
      }

      user = newUser;
    }

    // Convert BigInt values to strings if necessary
    const userSerialized = bigIntToString(user);

    return NextResponse.json(userSerialized);
  } catch (error: any) {
    console.error('Error creating/checking user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}




// import { NextResponse } from 'next/server';
// import prisma from '~/lib/prisma';

// function bigIntToString(obj: any): any {
//     if (typeof obj !== 'object' || obj === null) return obj;
//     if (Array.isArray(obj)) return obj.map(bigIntToString);

//     const newObj: any = {};
//     for (const key in obj) {
//         const value = obj[key];
//         if (typeof value === 'bigint') {
//             newObj[key] = value.toString();
//         } else if (typeof value === 'object') {
//             newObj[key] = bigIntToString(value);
//         } else {
//             newObj[key] = value;
//         }
//     }
//     return newObj;
// }

// export async function POST(request: Request) {
//     try {
//         // Parse the request body as JSON
//         const body = await request.json();
//         const { id, firstName, lastName, username } = body;

//         // Log the entire request body for debugging
//         console.log("Request Body:", body);

//         if (!id || !firstName) {
//             return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
//         }

//         // Try to find the user by telegramId
//         let user = await prisma.user.findUnique({
//             where: { telegramId: BigInt(id) },
//         });

//         // If the user doesn't exist, create a new one
//         if (!user) {
//             user = await prisma.user.create({
//                 data: {
//                     telegramId: BigInt(id),
//                     firstName,
//                     lastName,
//                     username,
//                 },
//             });
//         }

//         const userSerialized = bigIntToString(user);

//         return NextResponse.json(userSerialized);
//     } catch (error: any) {
//         console.error('Error creating/checking user:', error);
//         return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//     }
// }
