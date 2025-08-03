import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Transaction } from '@/types/transaction';
import logger from '@/lib/logger';
import { Filter } from 'mongodb';
import { Filter } from 'mongodb';

type DateRange = { $gte?: Date; $lte?: Date };

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    // Strongly type the collection with your Transaction type
    const collection = db.collection<Transaction>('expenses');

    const { searchParams } = new URL(request.url);
    const date_start = searchParams.get('date_start');
    const date_end = searchParams.get('date_end');
    const category = searchParams.get('category');

    const filter: Filter<Transaction> = {};

    // Build a typed date range and assign to filter.date
    if (date_start || date_end) {
      const dateRange: DateRange = {};
      if (date_start) dateRange.$gte = new Date(date_start);
      if (date_end) dateRange.$lte = new Date(date_end);
      // Filter<Transaction> accepts operator objects for Date fields
      filter.date = dateRange as unknown as Date; // assign operator object to the date field
      // Alternatively, if your Transaction declares date as Date, you can do:
      // (filter as any).date = dateRange;
    }

    // Optional dynamic category flag
    if (category && category !== 'all') {
      // If Transaction does not declare these boolean flags, you can cast for this line only:
      (filter as Record<string, unknown>)[`is_${category}`] = true;
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
    const collection = db.collection<Transaction>('expenses');

    const transaction: Omit<Transaction, '_id'> = await request.json();
    logger.info({ transaction }, 'Creating transaction');
    const result = await collection.insertOne({
      ...transaction,
      date: new Date(transaction.date),
    } as Omit<Transaction, '_id'>);

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