import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/lib/mongodb';
import { Transaction } from '@/types/transaction';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const db = await getDatabase();
    const collection = db.collection('expenses');

    if (req.method === 'GET') {
      const { date_start, date_end, category } = req.query;
      
      let filter: any = {};
      
      if (date_start || date_end) {
        filter.date = {};
        if (date_start) filter.date.$gte = new Date(date_start as string);
        if (date_end) filter.date.$lte = new Date(date_end as string);
      }
      
      if (category && category !== 'all') {
        filter[`is_${category}`] = true;
      }
      
      const transactions = await collection
        .find(filter)
        .sort({ date: -1 })
        .toArray();
      
      res.status(200).json(transactions);
    }
    
    else if (req.method === 'POST') {
      const transaction: Omit<Transaction, '_id'> = req.body;
      const result = await collection.insertOne({
        ...transaction,
        date: new Date(transaction.date)
      });
      
      res.status(201).json({ 
        _id: result.insertedId,
        ...transaction 
      });
    }
    
    else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}