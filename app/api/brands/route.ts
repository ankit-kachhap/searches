import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Brand from '@/models/brand';
import { auth } from '@clerk/nextjs';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();

    const brand = await Brand.create({
      userId,
      userEmail: data.userEmail,
      userName: data.userName,
      url: data.url,
      description: data.description,
      keywords: data.keywords,
    });

    return NextResponse.json({ brand }, { status: 201 });
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json({ error: 'Error creating brand' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const brands = await Brand.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ brands });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Error fetching brands' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get('id');
    
    if (!brandId) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 });
    }

    await connectDB();
    const brand = await Brand.findOne({ _id: brandId, userId });
    
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    await Brand.findByIdAndDelete(brandId);
    return NextResponse.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ error: 'Error deleting brand' }, { status: 500 });
  }
}