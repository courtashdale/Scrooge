import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const collection = db.collection('expenses');

    const { searchParams } = new URL(request.url);
    const date_start = searchParams.get('date_start');
    const date_end = searchParams.get('date_end');
    const category = searchParams.get('category');
    
    const filter: { [key: string]: unknown } = {};
    
    if (date_start || date_end) {
      const dateFilter: { $gte?: Date; $lte?: Date } = {};
      if (date_start) dateFilter.$gte = new Date(date_start);
      if (date_end) dateFilter.$lte = new Date(date_end);
      filter.date = dateFilter;
    }
    
    if (category && category !== 'all') {
      filter[`is_${category}`] = true;
    }

    logger.info({ filter }, 'Fetching transactions');
    const transactions = await collection
      .find(filter)
      .sort({ date: -1 })
      .toArray();

    logger.info({ count: transactions.length }, 'Fetched transactions');
    return NextResponse.json(transactions);
  } catch (error) {
    logger.error(error, 'Database error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const collection = db.collection('expenses');

    const transaction = await request.json();
    logger.info({ transaction }, 'Creating transaction');
    const result = await collection.insertOne({
      ...transaction,
      date: new Date(transaction.date),
    });

    logger.info({ id: result.insertedId }, 'Created transaction');
    return NextResponse.json(
      {
        _id: result.insertedId,
        ...transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error(error, 'Database error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}