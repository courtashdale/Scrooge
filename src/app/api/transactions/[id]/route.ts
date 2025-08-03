import { NextRequest, NextResponse } from 'next/server';


import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import logger from '@/lib/logger';

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  logger.info({ id }, 'Updating transaction');
  
  if (!id || !ObjectId.isValid(id)) {
    logger.warn({ id }, 'Invalid transaction ID');
    return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
  }
  
  try {
    const db = await getDatabase();
    const collection = db.collection('expenses');
    
    const updateData = await request.json();
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
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

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  logger.info({ id }, 'Deleting transaction');
  
  if (!id || !ObjectId.isValid(id)) {
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