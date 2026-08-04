"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { uploadFileToSupabase } from "@/lib/supabase";

// ── Helper: auto log ──────────────────────────────────────────────────────────
async function createLog(
  description: string,
  actionType: string,
  userId?: number,
) {
  await prisma.updateLog.create({
    data: { description, actionType, userId: userId ?? null },
  });
}

// ── Upload Report ─────────────────────────────────────────────────────────────
export async function submitReport(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return { error: "Vui lòng đăng nhập lại (Unauthorized)" };

    const title = formData.get("title") as string;
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as string;
    const references = formData.getAll("references") as string[];

    if (!title || !file || !category || file.size === 0)
      return { error: "Vui lòng điền đầy đủ thông tin và chọn file hợp lệ" };

    const fileName = file.name;
    const format = fileName.includes(".")
      ? fileName.slice(fileName.lastIndexOf(".")).toLowerCase()
      : ".unknown";
    const fileUrl = await uploadFileToSupabase(file);
    if (!fileUrl)
      return { error: "Không thể lấy được đường dẫn file từ Supabase" };

    const userId = parseInt((session.user as any).id);
    const report = await prisma.report.create({
      data: {
        title,
        url: fileUrl,
        format,
        category,
        uploaderId: userId,
        references: {
          create: references
            .filter((r) => r.trim() !== "")
            .map((r) => ({ sourceUrl: r })),
        },
      },
    });

    // Auto log — không cần nhập tay
    await createLog(
      `${session.user.name} đã tải lên báo cáo mới: "${title}" (${category.replace("_", " ")})`,
      "UPLOAD",
      userId,
    );

    revalidatePath("/");
    revalidatePath(`/reports/${category}`);
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi khi upload:", error);
    return { error: error.message || "Lỗi hệ thống không xác định." };
  }
}

// ── Update Report (title + references) ───────────────────────────────────────
export async function updateReport(
  reportId: number,
  title: string,
  refs: { id?: number; sourceUrl: string; description?: string }[],
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    const userId = parseInt((session.user as any).id);
    const role = (session.user as any).role;
    const report = await prisma.report.findUnique({ where: { id: reportId } });

    if (!report) return { error: "Không tìm thấy báo cáo" };
    if (report.uploaderId !== userId)
      return { error: "Bạn không có quyền chỉnh sửa báo cáo này" };

    // Delete all old references then recreate
    await prisma.reference.deleteMany({ where: { reportId } });
    await prisma.report.update({
      where: { id: reportId },
      data: {
        title,
        references: {
          create: refs
            .filter((r) => r.sourceUrl.trim())
            .map((r) => ({
              sourceUrl: r.sourceUrl,
              description: r.description || null,
            })),
        },
      },
    });

    await createLog(
      `${session.user.name} đã cập nhật báo cáo: "${title}"`,
      "EDIT",
      userId,
    );

    revalidatePath("/");
    revalidatePath(`/reports/${report.category}`);
    revalidatePath(`/admin/edit/${reportId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// ── Delete Report ─────────────────────────────────────────────────────────────
export async function deleteReport(reportId: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    const userId = parseInt((session.user as any).id);
    const role = (session.user as any).role;
    const report = await prisma.report.findUnique({ where: { id: reportId } });

    if (!report) return { error: "Không tìm thấy báo cáo" };
    if (report.uploaderId !== userId)
      return { error: "Bạn không có quyền xóa báo cáo này" };

    const reportTitle = report.title;
    const reportCategory = report.category;
    await prisma.report.delete({ where: { id: reportId } });

    await createLog(
      `${session.user.name} đã xóa báo cáo: "${reportTitle}"`,
      "DELETE",
      userId,
    );

    revalidatePath("/");
    revalidatePath(`/reports/${reportCategory}`);
    return { success: true, category: reportCategory };
  } catch (error: any) {
    return { error: error.message };
  }
}

// ── Delete Reference (ADMIN only) ─────────────────────────────────────────────
export async function deleteReference(refId: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    const role = (session.user as any).role;
    if (role !== "ADMIN")
      return { error: "Chỉ ADMIN mới có thể xóa tài liệu tham khảo" };

    const ref = await prisma.reference.findUnique({
      where: { id: refId },
      include: { report: true },
    });
    if (!ref) return { error: "Không tìm thấy tài liệu" };

    await prisma.reference.delete({ where: { id: refId } });

    const userId = parseInt((session.user as any).id);
    await createLog(
      `${session.user.name} (ADMIN) đã xóa tài liệu tham khảo khỏi báo cáo: "${ref.report.title}"`,
      "DELETE",
      userId,
    );

    revalidatePath("/references");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// ── Blog: Create Post ─────────────────────────────────────────────────────────
export async function createPost(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    if (!title?.trim() || !content?.trim())
      return { error: "Tiêu đề và nội dung không được để trống" };

    const userId = parseInt((session.user as any).id);
    const post = await prisma.post.create({
      data: { title, content, authorId: userId },
    });

    await createLog(
      `${session.user.name} đã đăng bài mới trên Blog: "${title}"`,
      "POST",
      userId,
    );

    revalidatePath("/blog");
    return { success: true, postId: post.id };
  } catch (error: any) {
    return { error: error.message };
  }
}

// ── Blog: Delete Post ─────────────────────────────────────────────────────────
export async function deletePost(postId: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    const userId = parseInt((session.user as any).id);
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) return { error: "Không tìm thấy bài viết" };
    if (post.authorId !== userId)
      return { error: "Bạn không có quyền xóa bài viết này" };

    await prisma.post.delete({ where: { id: postId } });
    revalidatePath("/blog");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// ── Blog: Upload Image ─────────────────────────────────────────────────────────
export async function uploadImageForBlog(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) return { error: "No file provided" };

    const fileUrl = await uploadFileToSupabase(file);
    if (!fileUrl) return { error: "Không thể tải ảnh lên Supabase" };

    return { success: true, url: fileUrl };
  } catch (error: any) {
    console.error("Lỗi khi upload ảnh blog:", error);
    return { error: error.message };
  }
}

// ── Blog: Create Comment ──────────────────────────────────────────────────────
export async function createComment(postId: number, content: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };
    if (!content?.trim())
      return { error: "Nội dung comment không được để trống" };

    const userId = parseInt((session.user as any).id);
    await prisma.comment.create({
      data: { content, postId, authorId: userId },
    });

    revalidatePath(`/blog/${postId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// ── Blog: Delete Comment ──────────────────────────────────────────────────────
export async function deleteComment(commentId: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    const userId = parseInt((session.user as any).id);
    const role = (session.user as any).role;
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) return { error: "Không tìm thấy comment" };
    if (comment.authorId !== userId && role !== "ADMIN")
      return { error: "Bạn không có quyền xóa comment này" };

    const postId = comment.postId;
    await prisma.comment.delete({ where: { id: commentId } });
    revalidatePath(`/blog/${postId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// ── Report feedback ──────────────────────────────────────────────────────────
export async function getReportFeedbacks(reportId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Vui lòng đăng nhập để xem phản hồi" };

  const feedbacks = await prisma.reportFeedback.findMany({
    where: { reportId },
    include: { author: { select: { id: true, username: true } } },
    orderBy: { createdAt: "asc" },
  });
  return { feedbacks };
}

export async function createReportFeedback(reportId: number, content: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Vui lòng đăng nhập để gửi phản hồi" };

  const normalizedContent = content?.trim();
  const plainContent = normalizedContent?.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  const hasMedia = /<(img|hr)\b/i.test(normalizedContent || "");
  if (!plainContent && !hasMedia) return { error: "Nội dung phản hồi không được để trống" };
  if (plainContent.length > 10000 || normalizedContent.length > 20000) return { error: "Nội dung phản hồi quá dài" };

  const report = await prisma.report.findUnique({ where: { id: reportId }, select: { category: true } });
  if (!report) return { error: "Báo cáo không tồn tại" };

  const authorId = parseInt((session.user as any).id);
  const feedback = await prisma.reportFeedback.create({
    data: { reportId, authorId, content: normalizedContent },
    include: { author: { select: { id: true, username: true } } },
  });

  revalidatePath(`/reports/${report.category}`);
  revalidatePath("/");
  return { success: true, feedback };
}

export async function deleteReportFeedback(feedbackId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Vui lòng đăng nhập lại" };

  const feedback = await prisma.reportFeedback.findUnique({
    where: { id: feedbackId },
    include: { report: { select: { category: true } } },
  });
  if (!feedback) return { error: "Không tìm thấy phản hồi" };

  const userId = parseInt((session.user as any).id);
  const role = (session.user as any).role;
  if (feedback.authorId !== userId && role !== "ADMIN") {
    return { error: "Bạn không có quyền xóa phản hồi này" };
  }

  await prisma.reportFeedback.delete({ where: { id: feedbackId } });
  revalidatePath(`/reports/${feedback.report.category}`);
  revalidatePath("/");
  return { success: true };
}

// ── Pinned Reports ─────────────────────────────────────────────────────────────
export async function pinReport(
  category: string,
  type: string,
  reportId: number,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };
    const role = (session.user as any).role;
    const userId = parseInt((session.user as any).id);

    // Kiểm tra quyền
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) return { error: "Báo cáo không tồn tại" };

    if (role !== "ADMIN" && report.uploaderId !== userId) {
      return {
        error:
          "Bạn không có quyền ghim báo cáo này (Chỉ dành cho Admin hoặc người tạo)",
      };
    }

    await prisma.pinnedReport.upsert({
      where: {
        category_type: { category, type },
      },
      update: {
        reportId,
      },
      create: {
        category,
        type,
        reportId,
      },
    });

    revalidatePath("/overview");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Lỗi server" };
  }
}

export async function unpinReport(id: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };
    const role = (session.user as any).role;
    const userId = parseInt((session.user as any).id);

    const pinned = await prisma.pinnedReport.findUnique({
      where: { id },
      include: { report: true },
    });

    if (!pinned) return { error: "Không tìm thấy mục ghim" };

    if (role !== "ADMIN" && pinned.report.uploaderId !== userId) {
      return { error: "Bạn không có quyền gỡ ghim báo cáo này" };
    }

    await prisma.pinnedReport.delete({ where: { id } });
    revalidatePath("/overview");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Lỗi server" };
  }
}

// ── Document Management ─────────────────────────────────────────────────────────────
export async function uploadDocument(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File | null;

    if (!title || !file || file.size === 0)
      return { error: "Thiếu thông tin hoặc file" };

    const fileName = file.name;
    const format = fileName.includes(".")
      ? fileName.slice(fileName.lastIndexOf(".")).toLowerCase()
      : ".unknown";
    const size = file.size;

    // Tái sử dụng hàm uploadFileToSupabase hiện có
    const { uploadFileToSupabase } = await import("@/lib/supabase");
    const fileUrl = await uploadFileToSupabase(file);
    if (!fileUrl) return { error: "Upload file thất bại" };

    const userId = parseInt((session.user as any).id);

    const doc = await prisma.document.create({
      data: {
        title,
        description,
        fileUrl,
        format,
        size,
        uploaderId: userId,
      },
    });

    await createLog(
      `${session.user.name} đã tải lên tài liệu nội bộ: "${title}"`,
      "UPLOAD",
      userId,
    );

    revalidatePath("/documents");
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi upload document:", error);
    return { error: error.message || "Lỗi server" };
  }
}

export async function getDocuments() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];

    return await prisma.document.findMany({
      include: {
        uploader: { select: { username: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Lỗi get documents:", error);
    return [];
  }
}

export async function deleteDocument(id: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return { error: "Tài liệu không tồn tại" };

    const userRole = (session.user as any).role;
    const userId = parseInt((session.user as any).id);
    if (doc.uploaderId !== userId && userRole !== "ADMIN") {
      return { error: "Bạn không có quyền xóa tài liệu này" };
    }

    const { deleteFileFromSupabase } = await import("@/lib/supabase");
    await deleteFileFromSupabase(doc.fileUrl);

    await prisma.document.delete({ where: { id } });

    await createLog(
      `${session.user.name} đã xóa tài liệu nội bộ: "${doc.title}"`,
      "DELETE",
      userId,
    );

    revalidatePath("/documents");
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi delete document:", error);
    return { error: error.message || "Lỗi server" };
  }
}
