import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getBlog, updateBlog, type Blog } from '@/mechanisms/liveblog-api';

export function useBlog(blogId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['blog', blogId],
    queryFn: () => getBlog(blogId!),
    enabled: Boolean(blogId),
    retry: (count, err) => {
      if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404) {
        return false;
      }
      return count < 1;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (patch: Partial<Blog>) => {
      const current = query.data;
      if (!current?._etag) {
        throw new Error('Blog etag required for update');
      }
      return updateBlog(current, patch);
    },
    onSuccess: (blog) => {
      queryClient.setQueryData(['blog', blogId], blog);
    },
  });

  return {
    blog: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateBlog: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
