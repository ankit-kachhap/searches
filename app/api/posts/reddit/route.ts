import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { fetchRelevantPosts, postComment } from '@/lib/reddit';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Connect to MongoDB and get user's brand info
    const { db } = await connectToDatabase();
    if (!db) {
      throw new Error('Failed to connect to database');
    }
    const brand = await db.collection('brands').findOne({ userId: String(userId) });

    if (!brand) {
      return new NextResponse('Brand not found', { status: 404 });
    }

    // Extract keywords from brand info
    const keywords = [
      brand.name,
      brand.industry,
      ...brand.keywords || [],
      ...brand.targetAudience || []
    ].filter(Boolean);

    // Fetch relevant Reddit posts based on brand keywords
    const posts = await fetchRelevantPosts(keywords);

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { postId, comment } = await req.json();

    if (!postId || !comment) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Connect to MongoDB and get user's brand info for personalization
    const { db } = await connectToDatabase();
    if (!db) {
      throw new Error('Failed to connect to database');
    }
    const brand = await db.collection('brands').findOne({ userId: String(userId) });

    if (!brand) {
      return new NextResponse('Brand not found', { status: 404 });
    }

    // Personalize the comment with brand info
    const personalizedComment = `${comment}\n\n- ${brand.name}\n${brand.website || ''}`;

    // Post the comment to Reddit
    const response = await postComment(postId, personalizedComment);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error posting comment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}