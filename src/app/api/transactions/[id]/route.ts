import { type NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import logger from '@/lib/logger';

type Params = { id: string };

function hasParamsWithId(context: unknown): context is { params: Params } {
if (!context || typeof context !== 'object') return false;
const c = context as { params?: unknown };
if (!c.params || typeof c.params !== 'object') return false;
const p = c.params as { id?: unknown };
return typeof p.id === 'string';
}

export async function PUT(request: NextRequest, context: unknown) {
if (!hasParamsWithId(context)) {
return NextResponse.json({ error: 'Invalid route context' }, { status: 500 });
}
const { id } = context.params;
logger.info({ id }, 'Updating transaction');

if (!ObjectId.isValid(id)) {
logger.warn({ id }, 'Invalid transaction ID');
return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
}

try {
const db = await getDatabase();
const collection = db.collection('expenses');


const updateData = await request.json();
if (updateData && typeof updateData === 'object' && 'date' in updateData) {
  const d = new Date((updateData as { date: unknown }).date as string);
  if (!Number.isNaN(d.getTime())) {
    (updateData as Record<string, unknown>).date = d;
  }
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
if (!hasParamsWithId(context)) {
return NextResponse.json({ error: 'Invalid route context' }, { status: 500 });
}
const { id } = context.params;
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