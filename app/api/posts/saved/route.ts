import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDatabase } from "@/lib/mongodb";
import { SavedPost } from "@/models/saved-post";

// GET /api/posts/saved - Get all saved posts for the current user
export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();
    
    const savedPosts = await SavedPost.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(savedPosts);
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/posts/saved - Save a new post
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { postUrl, title, content } = body;

    if (!postUrl || !title || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await connectToDatabase();

    // Try to create a new saved post, if it already exists, it will fail due to unique index
    const savedPost = await SavedPost.create({
      userId,
      postUrl,
      title,
      content
    });

    return NextResponse.json(savedPost);
  } catch (error: any) {
    if (error.code === 11000) {
      return new NextResponse("Post already saved", { status: 409 });
    }
    console.error("Error saving post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/posts/saved - Remove a saved post
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const postUrl = searchParams.get("postUrl");

    if (!postUrl) {
      return new NextResponse("Missing post URL", { status: 400 });
    }

    await connectToDatabase();

    const result = await SavedPost.deleteOne({ userId, postUrl });

    if (result.deletedCount === 0) {
      return new NextResponse("Post not found", { status: 404 });
    }

    return new NextResponse("Post removed from saved", { status: 200 });
  } catch (error) {
    console.error("Error removing saved post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}