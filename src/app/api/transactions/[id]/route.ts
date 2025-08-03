import { type NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import logger from '@/lib/logger';

type Params = { id: string };

function getParams(context: unknown): Params {
  if (
    context &&
    typeof context === 'object' &&
    'params' in context &&
    typeof (context as any).params === 'object' &&
    (context as any).params !== null &&
    'id' in (context as any).params &&
    typeof (context as any).params.id === 'string'
  ) {
    return (context as { params: Params }).params;
  }
  throw new Error('Invalid route context');
}

export async function PUT(request: NextRequest, context: unknown) {
  const { id } = getParams(context);
  logger.info({ id }, 'Updating transaction');

  if (!ObjectId.isValid(id)) {
    logger.warn({ id }, 'Invalid transaction ID');
    return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
  }

  try {
    const db = await getDatabase();
    const collection = db.collection('expenses');

    const updateData = await request.json();
    if (updateData?.date) {
      const d = new Date(updateData.date);
      if (!Number.isNaN(d.getTime())) updateData.date = d;
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      logger.warn({ id }, 'Transaction not found');
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    logger.info({ id }, 'Updated transaction');
    return NextResponse.json({ message: 'Transaction updated successfully' });
  } catch (error) {
    logger.error({ id, error }, 'Database error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: unknown) {
  const { id } = getParams(context);
  logger.info({ id }, 'Deleting transaction');

  if (!ObjectId.isValid(id)) {
    logger.warn({ id }, 'Invalid transaction ID');
    return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
  }

  try {
    const db = await getDatabase();
    const collection = db.collection('expenses');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      logger.warn({ id }, 'Transaction not found');
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    logger.info({ id }, 'Deleted transaction');
    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    logger.error({ id, error }, 'Database error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}