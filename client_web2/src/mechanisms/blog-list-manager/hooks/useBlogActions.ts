import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createBlog,
  deleteBlog,
  updateBlogStatus,
  uploadArchiveMedia,
  type Blog,
  type BlogStatusCode,
  type CreateBlogPayload,
} from '@/mechanisms/liveblog-api';

export function useBlogActions() {
  const navigate = useNavigate();

  const createBlogAndOpen = useCallback(
    async (payload: CreateBlogPayload) => {
      const blog = await createBlog(payload);
      navigate(`/liveblog/edit/${blog._id}`);
      return blog;
    },
    [navigate],
  );

  const bulkUpdateStatus = useCallback(async (blogs: Blog[], status: BlogStatusCode) => {
    await Promise.all(blogs.map((blog) => updateBlogStatus(blog, status)));
  }, []);

  const bulkArchive = useCallback(
    async (blogs: Blog[]) => bulkUpdateStatus(blogs, 'closed'),
    [bulkUpdateStatus],
  );

  const bulkActivate = useCallback(
    async (blogs: Blog[]) => bulkUpdateStatus(blogs, 'open'),
    [bulkUpdateStatus],
  );

  const softDelete = useCallback(
    async (blogs: Blog[]) => bulkUpdateStatus(blogs, 'deleted'),
    [bulkUpdateStatus],
  );

  const permanentDelete = useCallback(async (blogs: Blog[]) => {
    await Promise.all(blogs.map((blog) => deleteBlog(blog)));
  }, []);

  const uploadCoverImage = useCallback((file: File) => uploadArchiveMedia(file), []);

  return {
    createBlog: createBlogAndOpen,
    bulkArchive,
    bulkActivate,
    softDelete,
    permanentDelete,
    uploadCoverImage,
  };
}
