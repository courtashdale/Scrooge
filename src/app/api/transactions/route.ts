import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Transaction } from '@/types/transaction';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const collection = db.collection('expenses');

    const { searchParams } = new URL(request.url);
    const date_start = searchParams.get('date_start');
    const date_end = searchParams.get('date_end');
    const category = searchParams.get('category');
    
    let filter: any = {};
    
    if (date_start || date_end) {
      filter.date = {};
      if (date_start) filter.date.$gte = new Date(date_start);
      if (date_end) filter.date.$lte = new Date(date_end);
    }
    
    if (category && category !== 'all') {
      filter[`is_${category}`] = true;
    }
    
    const transactions = await collection
      .find(filter)
      .sort({ date: -1 })
      .toArray();
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const collection = db.collection('expenses');

    const transaction: Omit<Transaction, '_id'> = await request.json();
    const result = await collection.insertOne({
      ...transaction,
      date: new Date(transaction.date)
    });
    
    return NextResponse.json({ 
      _id: result.insertedId,
      ...transaction 
    }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}