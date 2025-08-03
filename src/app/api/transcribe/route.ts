import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      logger.warn('No audio file provided');
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    logger.info('Transcribing audio file');
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    });

    logger.info('Transcription complete');
    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    logger.error(error, 'Transcription error');
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}