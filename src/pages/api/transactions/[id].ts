import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid transaction ID' });
  }
  
  try {
    const db = await getDatabase();
    const collection = db.collection('expenses');
    
    if (req.method === 'PUT') {
      const updateData = req.body;
      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }
      
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      res.status(200).json({ message: 'Transaction updated successfully' });
    }
    
    else if (req.method === 'DELETE') {
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      res.status(200).json({ message: 'Transaction deleted successfully' });
    }
    
    else {
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}